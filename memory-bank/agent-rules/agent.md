# Agent Rules — CricLab Memory Bank

How the agent should behave in **this** repo (`cric-lab-ai`).

## Session start (mandatory)

1. Read **all** Memory Bank files before non-trivial work:
   - `productBrief.md`
   - `techContext.md`
   - `systemPatterns.md` (highest priority for architecture)
   - `roadmap.md`
   - Relevant `tasks/`
   - These `agent-rules/`
2. Summarize goals, constraints, and gaps **before** coding when the task is large.
3. This product is **CricLab** (Expo client). Do **not** invent Notera notes/PWA,
   Hybrid CRM, Next.js, a second MediaPipe stack, or point at `CricLabMLReview`.

## Context over prompts

- Prefer Memory Bank over assumptions
- If a prompt conflicts with `systemPatterns.md`, follow `systemPatterns.md` and say so
- Domain remains cricket **bowling** for v1
- Fulltrack.ai is a *different* product. Ball flight (behind-bowler, stump-calibrated)
  already exists on the lab — do not copy its numbers onto Action screens.
- The measurement lab is `/Users/macbookpro/Desktop/Cric-Lab/criclab-web-backend`
  (Python 3.12). The web UI is `criclab-web-frontend`. This repo only displays.

## Planning before coding

For non-trivial work:

1. Restate requirements against `productBrief.md` + task
2. Outline approach against `systemPatterns.md`
3. List files in **this** repo (`app/`, `src/`). If the change needs pose/PDF/metrics
   formulas, say so and stop — that belongs in `criclab-web-backend`.
4. Implement

## Implementation rules

- Expo Router screens only; typed `src/api/client.ts` + `src/api/http.ts`
- Display lab JSON honestly (`metricReady`)
- Persist profile + API URL + refresh token in AsyncStorage; access token in memory
- Label physical metrics as estimates unless the lab marked `status: ok`
- Prefer reliable bowling MVP over batting or on-device ML
- Match installed Expo SDK in `package.json` (read it; don’t guess)
- Auth on every analysis call. Public only: `/health`, `/auth/*` signup/login/refresh

## Demo prompts

| Prompt | Expected behavior |
|--------|-------------------|
| `Read all memory bank files.` | Explain CricLab mobile vs the Python lab — no code yet |
| Add a metric card | Read it from existing JSON; do not compute it on device |
| Make speed radar-accurate | Explain that is lab/hardware; don’t fake it in RN |
| Combine Action and Flight | Refuse; two modes must not mix numbers |

## Updates

When asked to **update the memory bank**:

- Sync `roadmap.md` and `tasks/` with reality
- Record architecture decisions in `systemPatterns.md`
- Keep files concise — this is the agent’s persistent project memory
