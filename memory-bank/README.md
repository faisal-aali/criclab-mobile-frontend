# Memory Bank — CricLab (mobile)

Structured source of truth the AI reads **first** in this repo.

This repo is the **Expo / React Native client** for CricLab. Pose, metrics,
overlay, Gemma, PDF, MongoDB, and auth all live in the sibling lab
`Cric-Lab/criclab-web-backend` (FastAPI). Do not reimplement that pipeline on
the phone.

## Layout

```text
memory-bank/
├── productBrief.md      # What CricLab is — users, features, success
├── techContext.md       # Expo RN client + FastAPI lab it talks to
├── systemPatterns.md    # Architecture rules — MOST IMPORTANT FILE
├── roadmap.md           # Mobile features + inherited lab features
├── tasks/               # Implementation / maintenance tasks
└── agent-rules/         # How the agent should behave in this repo
```

## Core files

| File | Role |
|------|------|
| `productBrief.md` | Cricket bowling lab: two film modes, auth, results |
| `techContext.md` | Expo Router, authenticated API client, LAN FastAPI |
| `systemPatterns.md` | CV metrics first (on the server); phone displays the same JSON |
| `roadmap.md` | Mobile client + what the lab already does |

## Why this exists

Vague prompts force guessing (Next.js, on-device ML, batting, radar-gun claims,
mixing Action km/h with Ball flight). The Memory Bank encodes product intent so
the agent behaves like a teammate who already knows CricLab.

**Key lesson:** context changes output more than prompts.

## How to use

1. Ask: `Read all memory bank files.` — understanding before coding
2. Implement from a task under `tasks/` while obeying `systemPatterns.md`
3. To change architecture, update `systemPatterns.md` first, then code

## Sibling lab (do not merge)

| Repo | Path | Job |
|------|------|-----|
| **CricLab mobile** (this) | `~/Desktop/cric-lab-ai` | Phone UI |
| **CricLab backend** | `~/Desktop/Cric-Lab/criclab-web-backend` | FastAPI: auth, queue, reads |
| **CricLab workers** | `~/Desktop/Cric-Lab/criclab-video-service` | Pose, overlay, PDF, Gemma notes |
| **CricLab web** | `~/Desktop/Cric-Lab/criclab-web-frontend` | Vite web app (same API) |

The old sibling `CricLabMLReview` is retired. Point every API call at
`criclab-web-backend`. Pose / overlay / PDF run in `criclab-video-service`.
Python **3.12** only for those labs.

Brand: **CricLab** (not “Cric-Lab AI”, not SpinLab, not Fulltrack).
Domain: cricket **bowling** only for v1.
