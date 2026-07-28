// Mock data for all features — used during development / demo

import {
  KnowledgeCard,
  Roadmap,
  Mentor,
  ConceptMemory,
  DailyStats,
  StreakData,
  QuizQuestion,
  UserUpload,
} from "@/types";

// ─── Feed Cards ──────────────────────────────────────────────────────────────

export const MOCK_CARDS: KnowledgeCard[] = [
  {
    id: "c1",
    source: "ai_feed",
    title: "HashMap Internal Working",
    concept: "How HashMap resolves hash collisions using chaining",
    explanation:
      "HashMap uses an array of linked lists (buckets). When two keys hash to the same index, they're stored in the same bucket as a linked list. Java 8+ converts chains longer than 8 to red-black trees for O(log n) worst-case lookup instead of O(n).",
    example:
      'HashMap<String,Integer> map = new HashMap<>();\nmap.put("apple", 1); // hash("apple") → bucket[5]\nmap.put("mango", 1); // hash("mango") → bucket[5] (collision → linked list)',
    interviewTip:
      "Always mention the tree-ification threshold (8 nodes) and the load factor (0.75) that triggers rehashing — interviewers love this detail.",
    commonMistake:
      "Confusing HashMap (unordered, not thread-safe) with LinkedHashMap (insertion order) and TreeMap (sorted).",
    difficulty: "intermediate",
    readingTimeSeconds: 75,
    topic: "Java",
    subtopic: "Collections",
    tags: ["java", "collections", "hashmap", "data-structures"],
    upvotes: 2341,
    createdAt: new Date().toISOString(),
    isBookmarked: false,
    userStrength: "weak",
    confidenceScore: 42,
  },
  {
    id: "c2",
    source: "ai_feed",
    title: "Docker Layers & Build Cache",
    concept: "How Docker caches image layers to speed up builds",
    explanation:
      "Docker images are built from stacked read-only layers. Each instruction in a Dockerfile creates a new layer. Docker caches each layer — if nothing changed in a layer, it reuses the cache. This means instruction order matters: put rarely-changed steps first (like installing dependencies) and frequently-changed steps last.",
    example:
      "# ✅ Good — dependencies cached separately\nCOPY package.json .\nRUN npm install\nCOPY . .\n\n# ❌ Bad — cache busted every time any file changes\nCOPY . .\nRUN npm install",
    interviewTip:
      "Explain layer caching + multi-stage builds to show you understand Docker optimization. Mention .dockerignore to exclude node_modules.",
    commonMistake:
      "Copying the entire project directory before running npm install — this busts the cache on every code change, making builds 10x slower.",
    difficulty: "intermediate",
    readingTimeSeconds: 60,
    topic: "DevOps",
    subtopic: "Docker",
    tags: ["docker", "devops", "containers", "optimization"],
    upvotes: 1872,
    createdAt: new Date().toISOString(),
    isBookmarked: true,
    userStrength: "medium",
    confidenceScore: 67,
  },
  {
    id: "c3",
    source: "ai_feed",
    title: "React useEffect Cleanup",
    concept: "Why and how to clean up side effects in useEffect",
    explanation:
      "useEffect can return a cleanup function that runs before the component unmounts or before the effect re-runs. Without cleanup, you risk memory leaks (stale event listeners, lingering timers, unresolved subscriptions), especially in React StrictMode where effects run twice in development.",
    example:
      "useEffect(() => {\n  const timer = setInterval(() => setCount(c => c + 1), 1000);\n  \n  // ✅ Cleanup prevents memory leak\n  return () => clearInterval(timer);\n}, []);",
    interviewTip:
      "React StrictMode mounts/unmounts components twice in dev to catch missing cleanups. Mention this — it shows you understand React internals.",
    commonMistake:
      "Adding async directly to useEffect: `useEffect(async () => {...})` — this makes useEffect return a Promise, not a cleanup function, breaking React's contract.",
    difficulty: "intermediate",
    readingTimeSeconds: 55,
    topic: "React",
    subtopic: "Hooks",
    tags: ["react", "hooks", "useeffect", "frontend"],
    upvotes: 3120,
    createdAt: new Date().toISOString(),
    isBookmarked: false,
    userStrength: "strong",
    confidenceScore: 89,
  },
  {
    id: "c4",
    source: "ai_feed",
    title: "SQL vs NoSQL Trade-offs",
    concept: "When to choose relational vs document databases",
    explanation:
      "SQL databases (PostgreSQL, MySQL) enforce a fixed schema and ACID transactions — ideal for financial data, user accounts, and relational data. NoSQL (MongoDB, DynamoDB) offers flexible schemas and horizontal scaling — ideal for unstructured data, high write throughput, and rapid iteration. The choice isn't SQL vs NoSQL but picking the right tool for your access patterns.",
    example:
      "SQL: e-commerce orders (consistency critical, JOIN between users/products/orders)\nNoSQL: user activity logs (high write volume, flexible schema, no JOINs needed)",
    interviewTip:
      "Mention CAP theorem — SQL typically prioritizes CP (consistency + partition tolerance), NoSQL AP (availability + partition tolerance). Interviewers love this framing.",
    commonMistake:
      "Choosing MongoDB 'because it's faster' without understanding your query patterns. MongoDB without proper indexing is slower than PostgreSQL.",
    difficulty: "intermediate",
    readingTimeSeconds: 80,
    topic: "System Design",
    subtopic: "Databases",
    tags: ["databases", "sql", "nosql", "system-design"],
    upvotes: 4201,
    createdAt: new Date().toISOString(),
    isBookmarked: false,
    userStrength: "weak",
    confidenceScore: 31,
  },
  {
    id: "c5",
    source: "ai_feed",
    title: "Transformer Attention Mechanism",
    concept: "How self-attention enables LLMs to understand context",
    explanation:
      "Self-attention computes relationships between every token and every other token in the sequence. Each token becomes three vectors: Query (what I'm looking for), Key (what I offer), Value (what I provide). Attention score = softmax(QK^T / √d_k) × V. This lets the model capture long-range dependencies impossible with RNNs.",
    example:
      "In 'The bank by the river was steep' — attention lets 'bank' attend strongly to 'river' (geographic context) vs 'The bank approved the loan' where 'bank' attends to 'loan' (financial context).",
    interviewTip:
      "Multi-head attention = running attention h times with different learned projections. Mention positional encodings since attention itself has no notion of order.",
    commonMistake:
      "Confusing attention with memory. Attention is computed fresh every forward pass — it doesn't store information between calls.",
    difficulty: "advanced",
    readingTimeSeconds: 90,
    topic: "AI/ML",
    subtopic: "Transformers",
    tags: ["ai", "transformers", "llm", "attention"],
    upvotes: 5632,
    createdAt: new Date().toISOString(),
    isBookmarked: false,
    userStrength: "weak",
    confidenceScore: 28,
  },
  {
    id: "c6",
    source: "ai_feed",
    title: "Python GIL Explained",
    concept: "Why Python's Global Interpreter Lock limits true parallelism",
    explanation:
      "The GIL is a mutex that prevents multiple threads from executing Python bytecode simultaneously. Even with multiple CPU cores, Python threads can't run truly in parallel for CPU-bound tasks. The GIL exists to protect CPython's memory management (reference counting). For CPU-bound work: use multiprocessing. For I/O-bound work: threading or asyncio is fine since I/O releases the GIL.",
    example:
      "# CPU-bound → use multiprocessing\nfrom multiprocessing import Pool\nPool(4).map(cpu_heavy_fn, data)\n\n# I/O-bound → threading/asyncio is fine\nimport asyncio\nawait asyncio.gather(fetch(url1), fetch(url2))",
    interviewTip:
      "Python 3.13+ has an experimental 'free-threaded' mode that removes the GIL. Mentioning this shows you follow Python's evolution.",
    commonMistake:
      "Using threading for CPU-bound tasks expecting speedup — you'll often get SLOWER performance due to GIL contention overhead.",
    difficulty: "advanced",
    readingTimeSeconds: 70,
    topic: "Python",
    subtopic: "Concurrency",
    tags: ["python", "gil", "concurrency", "multiprocessing"],
    upvotes: 2987,
    createdAt: new Date().toISOString(),
    isBookmarked: false,
    userStrength: "medium",
    confidenceScore: 55,
  },
  {
    id: "c7",
    source: "ai_feed",
    title: "HTTPS & TLS Handshake",
    concept: "How TLS establishes a secure encrypted channel",
    explanation:
      "TLS handshake: 1) Client Hello (supported cipher suites, random nonce). 2) Server Hello (chosen cipher, certificate). 3) Client verifies certificate against trusted CA. 4) Key Exchange (ECDHE — ephemeral Diffie-Hellman for perfect forward secrecy). 5) Both sides derive session keys. 6) Handshake finished — all traffic encrypted symmetrically (AES-256-GCM).",
    example:
      "Browser → Server: 'I support TLS 1.3, here are my cipher suites'\nServer → Browser: 'Here's my certificate signed by DigiCert'\nBoth → derive shared session key without ever transmitting it",
    interviewTip:
      "Mention Perfect Forward Secrecy (ECDHE) — even if the server's private key is compromised later, past sessions remain encrypted since session keys are ephemeral.",
    commonMistake:
      "Thinking HTTPS encrypts the URL. The domain is visible in SNI (Server Name Indication) — only the path, headers, and body are encrypted.",
    difficulty: "intermediate",
    readingTimeSeconds: 85,
    topic: "Cybersecurity",
    subtopic: "Cryptography",
    tags: ["security", "tls", "https", "cryptography"],
    upvotes: 1654,
    createdAt: new Date().toISOString(),
    isBookmarked: false,
    userStrength: "forgotten",
    confidenceScore: 12,
  },
  {
    id: "c8",
    source: "ai_feed",
    title: "Big O Notation — Space Complexity",
    concept: "Measuring how memory usage scales with input size",
    explanation:
      "Space complexity counts auxiliary space used by an algorithm (excluding input). O(1) = constant space (iterative loops). O(n) = linear space (storing all elements). O(n²) = matrix. Recursion adds stack frames — a recursive DFS on a tree of height h uses O(h) stack space, which is O(log n) for balanced trees and O(n) worst case for skewed trees.",
    example:
      "# O(1) space — no extra storage\ndef sum_array(arr): return sum(arr)\n\n# O(n) space — creates new array\ndef double(arr): return [x*2 for x in arr]\n\n# O(h) space — recursive call stack\ndef dfs(node): return dfs(node.left) + dfs(node.right)",
    interviewTip:
      "Always state both time AND space complexity in interviews. Mention that in-place algorithms trade space for code complexity (QuickSort: O(log n) space vs MergeSort: O(n) space).",
    commonMistake:
      "Forgetting recursion stack space. A 'constant space' recursive solution isn't O(1) — it's O(depth) for the call stack.",
    difficulty: "beginner",
    readingTimeSeconds: 65,
    topic: "DSA",
    subtopic: "Complexity Analysis",
    tags: ["dsa", "algorithms", "big-o", "space-complexity"],
    upvotes: 3456,
    createdAt: new Date().toISOString(),
    isBookmarked: false,
    userStrength: "strong",
    confidenceScore: 91,
  },
];

// ─── Roadmaps ────────────────────────────────────────────────────────────────

export const MOCK_ROADMAPS: Roadmap[] = [
  {
    id: "java",
    name: "Java Mastery",
    description: "From Variables to JVM internals — structured Java progression",
    category: "Programming",
    isSystem: true,
    icon: "☕",
    totalNodes: 16,
    completedNodes: 5,
    estimatedHours: 80,
    nodes: [
      { id: "j1", title: "Variables & Data Types", description: "Primitive types, type casting, var keyword", orderIndex: 1, dependencies: [], estimatedHours: 2, status: "completed", masteryLevel: "mastered", completionPercent: 100, confidenceScore: 92 },
      { id: "j2", title: "Operators & Expressions", description: "Arithmetic, logical, bitwise, ternary", orderIndex: 2, dependencies: ["j1"], estimatedHours: 2, status: "completed", masteryLevel: "proficient", completionPercent: 100, confidenceScore: 85 },
      { id: "j3", title: "Control Flow", description: "if/else, switch, for, while, do-while, break, continue", orderIndex: 3, dependencies: ["j2"], estimatedHours: 3, status: "completed", masteryLevel: "mastered", completionPercent: 100, confidenceScore: 94 },
      { id: "j4", title: "Arrays", description: "1D/2D arrays, System.arraycopy, Arrays utility class", orderIndex: 4, dependencies: ["j3"], estimatedHours: 3, status: "completed", masteryLevel: "proficient", completionPercent: 100, confidenceScore: 78 },
      { id: "j5", title: "Strings & StringBuilder", description: "String pool, immutability, StringBuilder vs StringBuffer", orderIndex: 5, dependencies: ["j4"], estimatedHours: 3, status: "in_progress", masteryLevel: "learning", completionPercent: 60, confidenceScore: 58 },
      { id: "j6", title: "OOP — Classes & Objects", description: "Encapsulation, constructors, this, static, final", orderIndex: 6, dependencies: ["j5"], estimatedHours: 5, status: "available", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
      { id: "j7", title: "Inheritance & Polymorphism", description: "extends, super, method overriding, abstract classes", orderIndex: 7, dependencies: ["j6"], estimatedHours: 5, status: "locked", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
      { id: "j8", title: "Interfaces & Generics", description: "Functional interfaces, default methods, type parameters", orderIndex: 8, dependencies: ["j7"], estimatedHours: 4, status: "locked", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
      { id: "j9", title: "Collections Framework", description: "List, Set, Map, Queue — implementations and use cases", orderIndex: 9, dependencies: ["j8"], estimatedHours: 6, status: "locked", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
      { id: "j10", title: "HashMap Deep Dive", description: "Hashing, chaining, load factor, rehashing, TreeMap", orderIndex: 10, dependencies: ["j9"], estimatedHours: 3, status: "locked", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
      { id: "j11", title: "LinkedList & Trees", description: "Singly/doubly linked lists, BST, AVL trees in Java", orderIndex: 11, dependencies: ["j10"], estimatedHours: 5, status: "locked", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
      { id: "j12", title: "Exception Handling", description: "try/catch/finally, custom exceptions, checked vs unchecked", orderIndex: 12, dependencies: ["j11"], estimatedHours: 3, status: "locked", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
      { id: "j13", title: "Streams & Lambdas", description: "Functional programming, stream pipeline, collectors", orderIndex: 13, dependencies: ["j12"], estimatedHours: 5, status: "locked", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
      { id: "j14", title: "Multithreading", description: "Thread lifecycle, synchronized, volatile, ExecutorService", orderIndex: 14, dependencies: ["j13"], estimatedHours: 6, status: "locked", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
      { id: "j15", title: "JVM Internals", description: "Class loading, JIT, GC algorithms, heap/stack memory", orderIndex: 15, dependencies: ["j14"], estimatedHours: 4, status: "locked", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
      { id: "j16", title: "Spring Boot Essentials", description: "DI, IoC, REST APIs, JPA, Spring Security basics", orderIndex: 16, dependencies: ["j15"], estimatedHours: 10, status: "locked", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
    ],
  },
  {
    id: "python",
    name: "Python Mastery",
    description: "From basics to asyncio and CPython internals",
    category: "Programming",
    isSystem: true,
    icon: "🐍",
    totalNodes: 14,
    completedNodes: 8,
    estimatedHours: 60,
    nodes: [
      { id: "p1", title: "Python Basics & Syntax", description: "Variables, types, input/output, f-strings", orderIndex: 1, dependencies: [], estimatedHours: 2, status: "completed", masteryLevel: "mastered", completionPercent: 100, confidenceScore: 95 },
      { id: "p2", title: "Data Structures", description: "List, tuple, dict, set — operations and comprehensions", orderIndex: 2, dependencies: ["p1"], estimatedHours: 3, status: "completed", masteryLevel: "mastered", completionPercent: 100, confidenceScore: 92 },
      { id: "p3", title: "Functions & Closures", description: "args/kwargs, decorators, closures, lambda", orderIndex: 3, dependencies: ["p2"], estimatedHours: 4, status: "completed", masteryLevel: "proficient", completionPercent: 100, confidenceScore: 81 },
      { id: "p4", title: "OOP in Python", description: "Classes, inheritance, dunder methods, dataclasses", orderIndex: 4, dependencies: ["p3"], estimatedHours: 4, status: "completed", masteryLevel: "proficient", completionPercent: 100, confidenceScore: 76 },
      { id: "p5", title: "Error Handling", description: "try/except/finally, custom exceptions, context managers", orderIndex: 5, dependencies: ["p4"], estimatedHours: 2, status: "completed", masteryLevel: "mastered", completionPercent: 100, confidenceScore: 88 },
      { id: "p6", title: "Modules & Packages", description: "import system, __init__.py, virtual environments, pip", orderIndex: 6, dependencies: ["p5"], estimatedHours: 2, status: "completed", masteryLevel: "proficient", completionPercent: 100, confidenceScore: 82 },
      { id: "p7", title: "File I/O & OS Module", description: "Reading/writing files, pathlib, os.path, shutil", orderIndex: 7, dependencies: ["p6"], estimatedHours: 2, status: "completed", masteryLevel: "mastered", completionPercent: 100, confidenceScore: 90 },
      { id: "p8", title: "Iterators & Generators", description: "__iter__, __next__, yield, generator expressions", orderIndex: 8, dependencies: ["p7"], estimatedHours: 3, status: "completed", masteryLevel: "proficient", completionPercent: 100, confidenceScore: 74 },
      { id: "p9", title: "Concurrency — Threading", description: "threading module, GIL, thread-safe patterns", orderIndex: 9, dependencies: ["p8"], estimatedHours: 4, status: "in_progress", masteryLevel: "learning", completionPercent: 40, confidenceScore: 45 },
      { id: "p10", title: "Asyncio & Coroutines", description: "async/await, event loop, aiohttp, async generators", orderIndex: 10, dependencies: ["p9"], estimatedHours: 5, status: "available", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
      { id: "p11", title: "Type Hints & Pydantic", description: "typing module, Generic, Protocol, Pydantic v2", orderIndex: 11, dependencies: ["p10"], estimatedHours: 3, status: "locked", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
      { id: "p12", title: "Testing with pytest", description: "Unit tests, fixtures, mocks, coverage, parametrize", orderIndex: 12, dependencies: ["p11"], estimatedHours: 4, status: "locked", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
      { id: "p13", title: "CPython Internals", description: "Bytecode, GIL deep dive, memory management, gc module", orderIndex: 13, dependencies: ["p12"], estimatedHours: 5, status: "locked", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
      { id: "p14", title: "Python for ML/AI", description: "NumPy, pandas, scikit-learn, FastAPI patterns", orderIndex: 14, dependencies: ["p13"], estimatedHours: 8, status: "locked", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
    ],
  },
  {
    id: "dsa",
    name: "DSA for Placements",
    description: "Complete DSA roadmap optimized for FAANG interviews",
    category: "Interviews",
    isSystem: true,
    icon: "🧮",
    totalNodes: 15,
    completedNodes: 3,
    estimatedHours: 120,
    nodes: [
      { id: "d1", title: "Complexity Analysis", description: "Big O, Big Ω, Big Θ — time & space analysis", orderIndex: 1, dependencies: [], estimatedHours: 3, status: "completed", masteryLevel: "mastered", completionPercent: 100, confidenceScore: 91 },
      { id: "d2", title: "Arrays & Sliding Window", description: "Two pointers, prefix sum, Kadane's algorithm", orderIndex: 2, dependencies: ["d1"], estimatedHours: 6, status: "completed", masteryLevel: "proficient", completionPercent: 100, confidenceScore: 79 },
      { id: "d3", title: "Strings & Hashing", description: "Anagram, palindrome, rolling hash, KMP algorithm", orderIndex: 3, dependencies: ["d2"], estimatedHours: 5, status: "in_progress", masteryLevel: "learning", completionPercent: 50, confidenceScore: 52 },
      { id: "d4", title: "Linked Lists", description: "Fast/slow pointers, reversal, merge, cycle detection", orderIndex: 4, dependencies: ["d3"], estimatedHours: 5, status: "available", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
      { id: "d5", title: "Stacks & Queues", description: "Monotonic stack, deque, LRU cache implementation", orderIndex: 5, dependencies: ["d4"], estimatedHours: 4, status: "locked", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
      { id: "d6", title: "Binary Search", description: "Search space reduction, rotated arrays, bisect", orderIndex: 6, dependencies: ["d5"], estimatedHours: 4, status: "locked", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
      { id: "d7", title: "Recursion & Backtracking", description: "Tree of calls, memoization, N-Queens, permutations", orderIndex: 7, dependencies: ["d6"], estimatedHours: 6, status: "locked", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
      { id: "d8", title: "Trees & BST", description: "Traversals, LCA, diameter, BST operations", orderIndex: 8, dependencies: ["d7"], estimatedHours: 7, status: "locked", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
      { id: "d9", title: "Heaps & Priority Queue", description: "Min/max heap, heap sort, k-th largest", orderIndex: 9, dependencies: ["d8"], estimatedHours: 4, status: "locked", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
      { id: "d10", title: "Graphs — BFS & DFS", description: "Adjacency list, cycle detection, connected components", orderIndex: 10, dependencies: ["d9"], estimatedHours: 7, status: "locked", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
      { id: "d11", title: "Shortest Paths", description: "Dijkstra, Bellman-Ford, Floyd-Warshall", orderIndex: 11, dependencies: ["d10"], estimatedHours: 5, status: "locked", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
      { id: "d12", title: "Dynamic Programming", description: "Memoization, tabulation, knapsack, LCS, LIS", orderIndex: 12, dependencies: ["d11"], estimatedHours: 10, status: "locked", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
      { id: "d13", title: "Tries & Segment Trees", description: "Prefix tree, range queries, lazy propagation", orderIndex: 13, dependencies: ["d12"], estimatedHours: 6, status: "locked", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
      { id: "d14", title: "Greedy Algorithms", description: "Activity selection, Huffman, interval scheduling", orderIndex: 14, dependencies: ["d13"], estimatedHours: 4, status: "locked", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
      { id: "d15", title: "System Design for SDE", description: "Scalability, load balancing, caching, DB design patterns", orderIndex: 15, dependencies: ["d14"], estimatedHours: 10, status: "locked", masteryLevel: "none", completionPercent: 0, confidenceScore: 0 },
    ],
  },
];

// ─── Mentors ──────────────────────────────────────────────────────────────────

export const MOCK_MENTORS: Mentor[] = [
  {
    id: "java",
    name: "Java Guru",
    specialty: "Java & Spring Boot",
    description: "15+ years of enterprise Java expertise. Specializes in JVM internals, Spring ecosystem, and Java interview prep.",
    personality: "Precise, methodical, loves deep dives into internals",
    avatar: "☕",
    color: "#f59e0b",
    topics: ["Java", "Spring Boot", "JVM", "Concurrency", "Collections"],
    isAvailable: true,
  },
  {
    id: "python",
    name: "PyMaster",
    specialty: "Python & AI/ML",
    description: "Python ecosystem expert covering Django, FastAPI, NumPy, pandas, and ML engineering patterns.",
    personality: "Pythonic, loves clean code and elegant solutions",
    avatar: "🐍",
    color: "#22c55e",
    topics: ["Python", "Django", "FastAPI", "NumPy", "asyncio"],
    isAvailable: true,
  },
  {
    id: "devops",
    name: "DevOps Sage",
    specialty: "DevOps & Cloud",
    description: "Docker, Kubernetes, CI/CD, AWS, Terraform — turns infrastructure chaos into elegant pipelines.",
    personality: "No-nonsense, automation-first mindset",
    avatar: "⚙️",
    color: "#6366f1",
    topics: ["Docker", "Kubernetes", "AWS", "Terraform", "GitHub Actions"],
    isAvailable: true,
  },
  {
    id: "cybersecurity",
    name: "CyberSentinel",
    specialty: "Cybersecurity",
    description: "OWASP, penetration testing, cryptography, and security architecture. Makes security intuitive.",
    personality: "Cautious, systematic, thinks like an attacker",
    avatar: "🛡️",
    color: "#ef4444",
    topics: ["OWASP", "Cryptography", "Pentesting", "Network Security", "TLS"],
    isAvailable: true,
  },
  {
    id: "ai",
    name: "AI Oracle",
    specialty: "AI & LLMs",
    description: "Deep learning, transformers, prompt engineering, RAG, and LLM application architecture.",
    personality: "Curious, research-driven, connects theory to practice",
    avatar: "🧠",
    color: "#8b5cf6",
    topics: ["Transformers", "LLMs", "RAG", "Prompt Engineering", "Fine-tuning"],
    isAvailable: true,
  },
  {
    id: "system_design",
    name: "Architect X",
    specialty: "System Design",
    description: "Scales systems to millions of users. Specializes in distributed systems, CAP theorem, and trade-offs.",
    personality: "Big-picture thinker, loves trade-off discussions",
    avatar: "🏗️",
    color: "#0ea5e9",
    topics: ["Distributed Systems", "Databases", "Caching", "Message Queues", "Load Balancing"],
    isAvailable: true,
  },
  {
    id: "interview",
    name: "Interview Coach",
    specialty: "Technical Interviews",
    description: "Ex-FAANG interviewer who turns interview anxiety into confidence. Behavioral + technical mastery.",
    personality: "Encouraging but rigorous, gives actionable feedback",
    avatar: "🎯",
    color: "#f5c518",
    topics: ["FAANG Prep", "LeetCode", "Behavioral", "System Design Rounds", "HR Rounds"],
    isAvailable: true,
  },
  {
    id: "placement",
    name: "Placement Pro",
    specialty: "Campus Placements",
    description: "Knows every company's hiring pattern — TCS, Infosys, Wipro, Amazon, Microsoft, Google.",
    personality: "Strategic, knows hiring patterns inside-out",
    avatar: "🎓",
    color: "#f97316",
    topics: ["Resume Building", "Aptitude", "Company Patterns", "HR Prep", "Off-Campus"],
    isAvailable: true,
  },
  {
    id: "aptitude",
    name: "Aptitude Ace",
    specialty: "Aptitude & Reasoning",
    description: "Quantitative aptitude, logical reasoning, and verbal ability for competitive exams and placements.",
    personality: "Patient, step-by-step problem solver",
    avatar: "📐",
    color: "#10b981",
    topics: ["Quantitative", "Logical Reasoning", "Verbal", "Data Interpretation", "Puzzles"],
    isAvailable: true,
  },
  {
    id: "tech_news",
    name: "Tech Reporter",
    specialty: "Tech News & Trends",
    description: "Your daily AI/tech briefing — emerging tech, research papers, startup news, and industry shifts.",
    personality: "Energetic, concise, always current",
    avatar: "📡",
    color: "#06b6d4",
    topics: ["AI News", "Startup Ecosystem", "Research Papers", "Product Launches", "Industry Trends"],
    isAvailable: true,
  },
];

// ─── Memory ────────────────────────────────────────────────────────────────────

export const MOCK_MEMORY: ConceptMemory[] = [
  { id: "m1", topic: "Java", conceptKey: "HashMap Internals", confidenceScore: 42, strength: "weak", lastReviewed: new Date(Date.now() - 3 * 86400000).toISOString(), nextReview: new Date(Date.now() + 86400000).toISOString(), reviewCount: 4, correctStreak: 0, wrongStreak: 2, retentionRate: 0.45 },
  { id: "m2", topic: "Cybersecurity", conceptKey: "TLS Handshake", confidenceScore: 12, strength: "forgotten", lastReviewed: new Date(Date.now() - 14 * 86400000).toISOString(), nextReview: new Date().toISOString(), reviewCount: 2, correctStreak: 0, wrongStreak: 3, retentionRate: 0.22 },
  { id: "m3", topic: "DSA", conceptKey: "SQL vs NoSQL", confidenceScore: 31, strength: "weak", lastReviewed: new Date(Date.now() - 5 * 86400000).toISOString(), nextReview: new Date(Date.now() + 86400000).toISOString(), reviewCount: 3, correctStreak: 0, wrongStreak: 2, retentionRate: 0.38 },
  { id: "m4", topic: "React", conceptKey: "useEffect Cleanup", confidenceScore: 89, strength: "strong", lastReviewed: new Date(Date.now() - 1 * 86400000).toISOString(), nextReview: new Date(Date.now() + 21 * 86400000).toISOString(), reviewCount: 8, correctStreak: 5, wrongStreak: 0, retentionRate: 0.92 },
  { id: "m5", topic: "Python", conceptKey: "GIL Deep Dive", confidenceScore: 55, strength: "medium", lastReviewed: new Date(Date.now() - 2 * 86400000).toISOString(), nextReview: new Date(Date.now() + 3 * 86400000).toISOString(), reviewCount: 5, correctStreak: 2, wrongStreak: 1, retentionRate: 0.60 },
  { id: "m6", topic: "AI/ML", conceptKey: "Attention Mechanism", confidenceScore: 28, strength: "weak", lastReviewed: new Date(Date.now() - 7 * 86400000).toISOString(), nextReview: new Date().toISOString(), reviewCount: 3, correctStreak: 0, wrongStreak: 3, retentionRate: 0.30 },
];

// ─── Analytics ────────────────────────────────────────────────────────────────

export const MOCK_STREAK: StreakData = {
  currentStreak: 12,
  longestStreak: 28,
  lastActiveDate: new Date().toISOString(),
  dailyGoalMinutes: 30,
  minutesToday: 23,
  dailyStats: [],
};

export const MOCK_DAILY_STATS: DailyStats[] = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - i * 86400000).toISOString().split("T")[0],
  cardsViewed: Math.floor(Math.random() * 30) + 5,
  cardsSaved: Math.floor(Math.random() * 8),
  quizScoreAvg: Math.floor(Math.random() * 40) + 60,
  minutesActive: Math.floor(Math.random() * 45) + 5,
  weakConceptsReviewed: Math.floor(Math.random() * 5),
}));

// ─── Quiz Questions ────────────────────────────────────────────────────────────

export const MOCK_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question: "What is the default load factor of Java's HashMap?",
    type: "mcq",
    options: ["0.5", "0.75", "1.0", "0.25"],
    correctAnswer: "0.75",
    explanation: "HashMap's default load factor is 0.75, meaning rehashing occurs when 75% of the capacity is filled. This balances time vs space complexity.",
    difficulty: "intermediate",
    topic: "Java",
  },
  {
    id: "q2",
    question: "In Java 8+, at what size does a HashMap bucket's linked list convert to a red-black tree?",
    type: "mcq",
    options: ["4", "6", "8", "16"],
    correctAnswer: "8",
    explanation: "Java 8 introduced tree-ification: when a bucket has 8+ entries, the linked list converts to a balanced red-black tree, improving worst-case from O(n) to O(log n).",
    difficulty: "advanced",
    topic: "Java",
  },
  {
    id: "q3",
    question: "Which of these is thread-safe: HashMap, LinkedHashMap, ConcurrentHashMap, or TreeMap?",
    type: "mcq",
    options: ["HashMap", "LinkedHashMap", "ConcurrentHashMap", "TreeMap"],
    correctAnswer: "ConcurrentHashMap",
    explanation: "ConcurrentHashMap uses segment-level locking (Java 7) / CAS operations (Java 8+) for thread safety. The others are not thread-safe for concurrent modifications.",
    difficulty: "intermediate",
    topic: "Java",
  },
  {
    id: "q4",
    question: "What does Python's GIL stand for and what does it protect?",
    type: "mcq",
    options: ["Global Interface Layer — protects I/O", "Global Interpreter Lock — protects memory management", "General Interpreter Limit — limits thread count", "Global Instance Lock — protects class instances"],
    correctAnswer: "Global Interpreter Lock — protects memory management",
    explanation: "GIL = Global Interpreter Lock. It protects CPython's reference counting garbage collector from race conditions when multiple threads access Python objects simultaneously.",
    difficulty: "intermediate",
    topic: "Python",
  },
  {
    id: "q5",
    question: "Write a Python function to find the first non-repeating character in a string.",
    type: "coding",
    correctAnswer: "from collections import Counter\ndef first_unique(s):\n    count = Counter(s)\n    for c in s:\n        if count[c] == 1:\n            return c\n    return None",
    explanation: "Use Counter to count all characters in O(n), then iterate the string again to find the first character with count 1. Total: O(n) time, O(k) space where k = unique characters.",
    codeSnippet: "def first_unique(s: str) -> str | None:\n    # Your solution here\n    pass",
    difficulty: "beginner",
    topic: "Python",
  },
];

// ─── Uploads ──────────────────────────────────────────────────────────────────

export const MOCK_UPLOADS: UserUpload[] = [
  { id: "u1", filename: "OS_Notes_Unit3.pdf", fileType: "pdf", storageUrl: "#", processingStatus: "completed", extractedConceptsCount: 47, cardIds: [], createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: "u2", filename: "DBMS_Revision.docx", fileType: "docx", storageUrl: "#", processingStatus: "completed", extractedConceptsCount: 32, cardIds: [], createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: "u3", filename: "ML_Slides_Unit2.ppt", fileType: "ppt", storageUrl: "#", processingStatus: "processing", createdAt: new Date(Date.now() - 1 * 3600000).toISOString() },
];
