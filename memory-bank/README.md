# Memory Bank — Cric-Lab AI (mobile)

Structured source of truth the AI reads **first** in this repo.

This repo is the **Expo / React Native client** for Cric-Lab. The vision lab
(MediaPipe, metrics, overlay, Gemma, PDF, MongoDB) lives in the sibling project
`CricLabMLReview` (FastAPI). Do not reimplement that pipeline on the phone.

## Layout

```text
memory-bank/
├── productBrief.md      # What Cric-Lab is — users, features, success
├── techContext.md       # Expo RN client + FastAPI lab it talks to
├── systemPatterns.md    # Architecture rules — MOST IMPORTANT FILE
├── roadmap.md           # Mobile features + inherited lab features
├── tasks/               # Implementation / maintenance tasks
└── agent-rules/         # How the agent should behave in this repo
```

## Core files

| File | Role |
|------|------|
| `productBrief.md` | Cricket bowling lab: upload → analyze → metrics → PDF — on phone |
| `techContext.md` | Expo Router, typed API client, LAN FastAPI |
| `systemPatterns.md` | CV metrics first (on the server); phone displays the same JSON |
| `roadmap.md` | Mobile client + what the lab already does |

## Why this exists

Vague prompts force guessing (Next.js, on-device ML, batting, radar-gun claims).
The Memory Bank encodes product intent so the agent behaves like a teammate who
already knows Cric-Lab.

**Key lesson:** context changes output more than prompts.

## How to use

1. Ask: `Read all memory bank files.` — understanding before coding
2. Implement from a task under `tasks/` while obeying `systemPatterns.md`
3. To change architecture, update `systemPatterns.md` first, then code

## Sibling lab (do not merge)

| Repo | Path | Job |
|------|------|-----|
| **Cric-Lab AI** (this) | `~/Desktop/cric-lab-ai` | Mobile UI |
| **CricLabMLReview** | `~/Desktop/CricLabMLReview` | FastAPI + pose + PDF |

UX inspiration: SpinLab AI. Domain: cricket **bowling** only for v1.
