# Roadmap — Cric-Lab AI (mobile)

High-level features. Detail lives in `tasks/`.

Lab features (pose, overlay, PDF, Gemma) are **Done in CricLabMLReview**.
This table is what **this Expo repo** should have.

| ID | Feature | Status | Summary |
|----|---------|--------|---------|
| FEAT-M01 | Expo foundation | Done | Expo Router, brand, tabs, typed API client |
| FEAT-M02 | Analyze upload | Done | Required profile + library/camera video → POST /videos |
| FEAT-M03 | Processing | Done | Poll /jobs/:id with lab pipeline stages |
| FEAT-M04 | Results | Done | Overlay/original, tiles, sequence, scores, metrics, AI, PDF |
| FEAT-M05 | History | Done | GET /deliveries list → result |
| FEAT-M06 | API settings | Done | Persisted base URL + /health ping |
| FEAT-M07 | Honesty UI | Done | metricReady + camera-view quality banner |
| FEAT-M08 | Expo Go polish | Planned | Clearer LAN errors, upload progress, offline notice |
| FEAT-M09 | Auth | Planned | Only if the lab adds it — don’t invent accounts here |
| FEAT-M10 | On-device capture guide | Planned | Overlay tips while recording (side-on, full body) |

## Inherited lab roadmap (do not implement in this repo)

Done on the server: FEAT-001–014 (foundation through in-air ball speed).
Planned on the server: coaching memory (nomic), radar validation (FEAT-016).

If a prompt asks for “better km/h like Fulltrack / lidar”, that is **lab**
work (stump calibration, behind-bowler camera), not a mobile-only change.

## Change log

- **17 Aug 2026:** Greenfield Expo client at `~/Desktop/cric-lab-ai`, outside
  the CricLabMLReview git remote. Memory Bank copied and rewritten for mobile
  so agents do not rebuild the Python pipeline on the phone.
