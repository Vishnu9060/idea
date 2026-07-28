# Production Implementation TODO

## Phase 1: Foundation
- [x] Create User Auth Context (`src/lib/auth-context.tsx`)
- [x] Create API client layer (`src/lib/api.ts`)
- [x] Update providers to include AuthProvider

## Phase 2: New Backend Endpoints
- [x] `POST /api/cards` — create cards from uploaded content
- [x] `POST /api/flashcards` — create flashcard session
- [x] `POST /api/roadmaps/generate` — generate/update roadmap from concepts
- [x] `POST /api/upload/process` — full processing pipeline
- [x] `POST /api/memory/update` — batch memory update
- [x] `POST /api/flashcards/answer` — record flashcard answer
- [x] `GET /api/flashcards?userId=xxx` — get flashcards
- [x] `GET /api/uploads/history?userId=xxx` — upload history with generated outputs

## Phase 3: Frontend Rewrites
- [x] Rewrite Feed — real API + interactions
- [x] Rewrite Learn/Roadmaps — real data
- [x] Rewrite Upload — real backend pipeline
- [x] Rewrite Analytics — real memory data
- [x] Rewrite Practice/Quiz — real quiz sessions
- [x] Rewrite Mentors — real conversations
- [x] Rewrite Profile — real user data + sign out

## Phase 4: Polish
- [x] Loading states everywhere
- [x] Error states everywhere
- [x] Empty states everywhere
- [x] Optimistic updates
- [x] Cache invalidation

