// ─────────────────────────────────────────────────────────────────────────
// Local, offline content analysis: file text extraction + keyphrase-based
// concept extraction + flashcard/quiz generation. No external AI API calls —
// everything here is deterministic text processing (RAKE-style keyphrase
// extraction + extractive summarization).
// ─────────────────────────────────────────────────────────────────────────

const STOPWORDS = new Set([
  "a","about","above","after","again","against","all","am","an","and","any","are","aren't","as","at",
  "be","because","been","before","being","below","between","both","but","by",
  "can","cannot","could","couldn't",
  "did","didn't","do","does","doesn't","doing","don't","down","during",
  "each","few","for","from","further",
  "had","hadn't","has","hasn't","have","haven't","having","he","her","here","hers","herself","him","himself","his","how",
  "i","if","in","into","is","isn't","it","it's","its","itself",
  "just",
  "let's",
  "may","might","me","more","most","must","mustn't","my","myself",
  "need","needs","no","nor","not","now",
  "of","off","on","once","only","or","other","ought","our","ours","ourselves","out","over","own",
  "same","shall","shan't","she","should","shouldn't","so","some","such",
  "than","that","that's","the","their","theirs","them","themselves","then","there","these","they","this","those","through","to","too",
  "under","until","up",
  "very",
  "was","wasn't","we","were","weren't","what","when","where","which","while","who","whom","why","will","with","won't","would","wouldn't",
  "you","you'd","you'll","you're","you've","your","yours","yourself","yourselves",
  "e.g","i.e","etc","also","however","thus","therefore","much","many","using","used","use","one","two","three",
]);

export interface ExtractedConcept {
  concept: string;
  explanation: string;
  example: string;
  interviewTip: string;
  commonMistake: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  topic: string;
  subtopic: string;
  tags: string[];
  score: number;
}

// ─── File text extraction ───────────────────────────────────────────────

export async function extractTextFromFile(
  base64Data: string,
  fileType: string
): Promise<{ text: string; warning?: string }> {
  const buffer = Buffer.from(base64Data, "base64");

  if (fileType === "pdf") {
    const { PDFParse } = await import("pdf-parse");
    // pdfjs-dist (used internally) resolves its worker script relative to
    // the bundled chunk path, which doesn't exist under Turbopack's server
    // output. Point it at the real file on disk instead.
    const path = await import("path");
    const { pathToFileURL } = await import("url");
    const workerPath = path.join(
      process.cwd(),
      "node_modules",
      "pdf-parse",
      "dist",
      "worker",
      "pdf.worker.mjs"
    );
    PDFParse.setWorker(pathToFileURL(workerPath).href);

    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      // Strip pdf-parse's inter-page markers ("-- 1 of 3 --") so they don't
      // get absorbed into a sentence during concept extraction.
      const cleaned = (result.text ?? "").replace(/--\s*\d+\s*of\s*\d+\s*--/g, " ");
      return { text: cleaned };
    } finally {
      await parser.destroy();
    }
  }

  if (fileType === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return { text: result.value ?? "" };
  }

  if (fileType === "ppt" || fileType === "pptx") {
    const JSZip = (await import("jszip")).default;
    let zip;
    try {
      zip = await JSZip.loadAsync(buffer);
    } catch {
      return {
        text: "",
        warning:
          "This looks like a legacy .ppt (pre-2007 binary) file, which isn't supported. Please re-save as .pptx.",
      };
    }
    const slideFiles = Object.keys(zip.files)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
      .sort((a, b) => {
        const na = parseInt(a.match(/slide(\d+)\.xml/)?.[1] ?? "0", 10);
        const nb = parseInt(b.match(/slide(\d+)\.xml/)?.[1] ?? "0", 10);
        return na - nb;
      });

    if (slideFiles.length === 0) {
      return {
        text: "",
        warning:
          "This looks like a legacy .ppt (pre-2007 binary) file, which isn't supported. Please re-save as .pptx.",
      };
    }

    const slideTexts: string[] = [];
    for (const file of slideFiles) {
      const xml = await zip.files[file].async("text");
      const runs = [...xml.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map((m) => m[1]);
      if (runs.length) slideTexts.push(runs.join(" "));
    }
    return { text: slideTexts.join("\n\n") };
  }

  return { text: "" };
}

// ─── Sentence splitting ─────────────────────────────────────────────────

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.split(" ").length >= 4); // drop stray fragments/headers
}

// ─── RAKE-style keyphrase extraction ────────────────────────────────────

function tokenizeToPhrases(sentence: string): string[][] {
  // RAKE treats punctuation as a hard phrase boundary, not just stopwords —
  // split on it first so e.g. "X, allowing Y" doesn't merge into one phrase.
  const chunks = sentence.toLowerCase().split(/[,;:()"“”–—]+/);

  const phrases: string[][] = [];
  for (const chunk of chunks) {
    const words = chunk
      .replace(/[^a-z0-9\s'-]/g, " ")
      .split(/\s+/)
      .filter(Boolean);

    let current: string[] = [];
    for (const w of words) {
      if (STOPWORDS.has(w) || /^\d+$/.test(w)) {
        if (current.length) phrases.push(current);
        current = [];
      } else {
        current.push(w);
      }
    }
    if (current.length) phrases.push(current);
  }
  return phrases.filter((p) => p.length >= 1 && p.length <= 4);
}

interface RankedPhrase {
  phrase: string;
  score: number;
}

function rakeExtract(sentences: string[], maxPhrases: number): RankedPhrase[] {
  const allPhrases: string[][] = [];
  for (const s of sentences) allPhrases.push(...tokenizeToPhrases(s));

  const freq = new Map<string, number>();
  const degree = new Map<string, number>();

  for (const phrase of allPhrases) {
    const phraseDegree = phrase.length - 1;
    for (const word of phrase) {
      freq.set(word, (freq.get(word) ?? 0) + 1);
      degree.set(word, (degree.get(word) ?? 0) + phraseDegree + 1);
    }
  }

  const phraseScores = new Map<string, number>();
  for (const phrase of allPhrases) {
    const key = phrase.join(" ");
    if (phraseScores.has(key)) continue;
    const score = phrase.reduce((sum, w) => sum + (degree.get(w) ?? 0) / (freq.get(w) ?? 1), 0);
    phraseScores.set(key, score);
  }

  return [...phraseScores.entries()]
    .map(([phrase, score]) => ({ phrase, score }))
    .filter((p) => p.phrase.length > 2 && p.phrase.split(" ").length <= 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxPhrases * 3) // over-fetch, dedupe by containment below
    .filter((p, i, arr) => {
      // drop phrases that are substrings of a higher-ranked phrase (e.g. "system" inside "operating system")
      return !arr.slice(0, i).some((other) => other.phrase.includes(p.phrase));
    })
    .slice(0, maxPhrases);
}

function toTitleCase(phrase: string): string {
  return phrase
    .split(" ")
    .map((w) => (w.length > 3 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

// ─── Topic classification (coarse category label, not concept extraction) ─

export function classifyTopic(text: string): string {
  const lower = text.toLowerCase();
  const rules: [string, string[]][] = [
    ["Java", ["java", "spring", "jvm"]],
    ["Python", ["python", "django", "flask"]],
    ["Frontend", ["react", "vue", "angular", "javascript", "typescript"]],
    ["DevOps", ["docker", "kubernetes", "aws", "ci/cd", "terraform"]],
    ["Databases", ["sql", "mongodb", "database", "postgres", "index"]],
    ["DSA", ["data structure", "leetcode", "time complexity", "space complexity", "binary search", "sorting algorithm"]],
    ["AI/ML", ["machine learning", "neural network", "deep learning", "gradient descent", "training data", "backpropagation", "overfitting"]],
    ["Cybersecurity", ["security", "encryption", "owasp", "vulnerability"]],
  ];

  // Frequency-based voting rather than first-match-wins: a document that
  // mentions "algorithm" once shouldn't out-rank one that says "neural
  // network" five times just because DSA's rule happened to run first.
  let bestTopic = "General";
  let bestCount = 0;
  for (const [topic, keywords] of rules) {
    const count = keywords.reduce((sum, k) => {
      const matches = lower.split(k).length - 1;
      return sum + matches;
    }, 0);
    if (count > bestCount) {
      bestCount = count;
      bestTopic = topic;
    }
  }
  return bestTopic;
}

// ─── Concept extraction ─────────────────────────────────────────────────

export function extractConceptsFromText(text: string, maxConcepts = 6): ExtractedConcept[] {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return [];

  const topic = classifyTopic(text);
  // Over-fetch candidates: some ranked phrases only ever co-occur with a
  // higher-ranked phrase in the same single sentence, so they get skipped
  // below (they're not a genuinely distinct concept, just the same fact).
  const candidates = rakeExtract(sentences, maxConcepts * 3);

  const usedAsExplanation = new Set<number>();
  const usedAtAll = new Set<number>();
  const concepts: ExtractedConcept[] = [];

  for (const r of candidates) {
    if (concepts.length >= maxConcepts) break;

    const matchIndices = sentences
      .map((s, idx) => (s.toLowerCase().includes(r.phrase) ? idx : -1))
      .filter((idx) => idx !== -1);

    // Every sentence this phrase appears in is already claimed as another
    // concept's explanation — this phrase doesn't add a new fact, skip it.
    if (matchIndices.length === 0 || matchIndices.every((idx) => usedAsExplanation.has(idx))) {
      continue;
    }

    const explanationIdx = matchIndices.find((idx) => !usedAsExplanation.has(idx))!;
    usedAsExplanation.add(explanationIdx);
    usedAtAll.add(explanationIdx);
    const explanation = sentences[explanationIdx];

    // Prefer another sentence mentioning the same phrase; then the next
    // unused sentence in document order; then fall back to a labeled repeat.
    const exampleIdx =
      matchIndices.find((idx) => idx !== explanationIdx && !usedAtAll.has(idx)) ??
      matchIndices.find((idx) => idx !== explanationIdx) ??
      [explanationIdx + 1].find((idx) => idx < sentences.length && !usedAtAll.has(idx));

    let example: string;
    if (exampleIdx !== undefined) {
      usedAtAll.add(exampleIdx);
      example = sentences[exampleIdx];
    } else {
      example = `In context: "${explanation}"`;
    }

    const i = concepts.length;
    const tertile = Math.floor((i / maxConcepts) * 3);
    const difficulty: ExtractedConcept["difficulty"] =
      tertile === 0 ? "beginner" : tertile === 1 ? "intermediate" : "advanced";

    const conceptTitle = toTitleCase(r.phrase);

    concepts.push({
      concept: conceptTitle,
      explanation,
      example,
      interviewTip: `When "${conceptTitle}" comes up, ground your answer in specifics from the source rather than a generic definition — e.g.: "${explanation}"`,
      commonMistake: `Treating "${conceptTitle}" as an isolated fact rather than connecting it to how it's actually used: "${example}"`,
      difficulty,
      topic,
      subtopic: i === 0 ? "Core Idea" : "Detail",
      tags: [topic.toLowerCase(), ...r.phrase.split(" ").slice(0, 2)],
      score: r.score,
    });
  }

  return concepts;
}

// ─── Flashcard generation ───────────────────────────────────────────────

export interface GeneratedFlashcard {
  front: string;
  back: string;
  topic: string;
  difficulty: string;
}

export function generateFlashcardsFromConcepts(concepts: ExtractedConcept[]): GeneratedFlashcard[] {
  return concepts.map((c) => ({
    front: `What is "${c.concept}"?`,
    back: c.explanation,
    topic: c.topic,
    difficulty: c.difficulty,
  }));
}

// ─── MCQ quiz generation (3 tiers, real distractors from extracted text) ─

export type QuizTier = "beginner" | "professional" | "expert";

export interface GeneratedMCQ {
  questionText: string;
  type: "mcq";
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: QuizTier;
  topic: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function truncate(s: string, max = 160): string {
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
}

function otherConcepts(concepts: ExtractedConcept[], excludeIndex: number): ExtractedConcept[] {
  const pool = concepts.filter((_, i) => i !== excludeIndex);
  return shuffle(pool);
}

// Scans the full shuffled candidate pool (not just the first 3) and returns
// exactly 3 distractors distinct from the correct answer and from each
// other. Returns null if the pool can't supply 3 unique options — callers
// must then skip the question rather than emit fewer than 4 options.
function buildOptions(correct: string, candidatePool: string[]): string[] | null {
  const seen = new Set([correct]);
  const distractors: string[] = [];
  for (const candidate of candidatePool) {
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    distractors.push(candidate);
    if (distractors.length === 3) break;
  }
  if (distractors.length < 3) return null;
  return shuffle([correct, ...distractors]);
}

function beginnerQuestion(concepts: ExtractedConcept[], i: number): GeneratedMCQ | null {
  const c = concepts[i];
  const correct = truncate(c.explanation);
  const candidates = otherConcepts(concepts, i).map((o) => truncate(o.explanation));
  const options = buildOptions(correct, candidates);
  if (!options) return null;

  return {
    questionText: `What does "${c.concept}" refer to, based on the source material?`,
    type: "mcq",
    options,
    correctAnswer: correct,
    explanation: c.explanation,
    difficulty: "beginner",
    topic: c.topic,
  };
}

function professionalQuestion(concepts: ExtractedConcept[], i: number): GeneratedMCQ | null {
  const c = concepts[i];
  const correct = truncate(c.example);
  const candidates = otherConcepts(concepts, i).map((o) => truncate(o.example));
  const options = buildOptions(correct, candidates);
  if (!options) return null;

  return {
    questionText: `Which statement best describes how "${c.concept}" is used or applied, according to the source material?`,
    type: "mcq",
    options,
    correctAnswer: correct,
    explanation: `${c.explanation} ${c.example}`,
    difficulty: "professional",
    topic: c.topic,
  };
}

function expertQuestion(concepts: ExtractedConcept[], i: number): GeneratedMCQ | null {
  const c = concepts[i];
  const others = otherConcepts(concepts, i);
  if (others.length < 3) return null;

  // Correct answer: both real facts about THIS concept, combined.
  const correct = truncate(`${c.explanation} ${c.example}`, 220);

  // Distractors: mix one true sentence about THIS concept with one true
  // sentence about ANOTHER concept — both halves are real, but the pairing
  // is wrong, which is what makes it a harder (closer) distractor than a
  // fully off-topic statement.
  const candidates = others.flatMap((o) => [
    truncate(`${c.explanation} ${o.example}`, 220),
    truncate(`${o.explanation} ${c.example}`, 220),
  ]);
  const options = buildOptions(correct, candidates);
  if (!options) return null;

  return {
    questionText: `Which of the following is the most accurate, complete statement about "${c.concept}"?`,
    type: "mcq",
    options,
    correctAnswer: correct,
    explanation: `The correct statement combines both real facts about "${c.concept}" from the source: ${correct}`,
    difficulty: "expert",
    topic: c.topic,
  };
}

export function generateQuizFromConcepts(concepts: ExtractedConcept[]): {
  beginner: GeneratedMCQ[];
  professional: GeneratedMCQ[];
  expert: GeneratedMCQ[];
} {
  const beginner: GeneratedMCQ[] = [];
  const professional: GeneratedMCQ[] = [];
  const expert: GeneratedMCQ[] = [];

  concepts.forEach((_, i) => {
    const b = beginnerQuestion(concepts, i);
    if (b) beginner.push(b);
    const p = professionalQuestion(concepts, i);
    if (p) professional.push(p);
    const e = expertQuestion(concepts, i);
    if (e) expert.push(e);
  });

  return { beginner, professional, expert };
}
