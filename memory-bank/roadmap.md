# Roadmap — CricLab (mobile)

High-level features. Detail lives in `tasks/`.

Lab features (pose, overlay, PDF, Gemma, auth) are **Done in
criclab-web-backend**. This table is what **this Expo repo** should have.

| ID | Feature | Status | Summary |
|----|---------|--------|---------|
| FEAT-M01 | Expo foundation | Done | Expo Router, brand, tabs, typed API client |
| FEAT-M02 | Action upload | Done | Required profile + library/camera video → POST /videos |
| FEAT-M03 | Processing | Done | Poll /jobs/:id with lab pipeline stages |
| FEAT-M04 | Results | Done | Overlay/original, tiles, sequence, scores, metrics, AI, PDF |
| FEAT-M05 | History | Done | GET /deliveries list → result |
| FEAT-M06 | API settings | Done | Persisted base URL + /health ping |
| FEAT-M07 | Honesty UI | Done | metricReady + camera-view quality banner |
| FEAT-M08 | Ball flight | Done | Stump align, session film, pitch map, per-ball metrics |
| FEAT-M09 | Auth | Done | Signup, OTP, login, refresh, sign out — required by the lab |
| FEAT-M10 | CricLab UI | Done | Night / lime / chalk, CricLab wordmark, dark tabs |
| FEAT-M11 | Train + leaderboard | Done | GET /coaching/drills, GET /leaderboard |
| FEAT-M12 | Expo Go polish | Planned | Clearer LAN errors, upload progress, offline notice |
| FEAT-M13 | On-device capture guide | Planned | Overlay tips while recording Action (side-on, full body) |
| FEAT-M14 | Drawer + tickets | Done | Side drawer: leaderboard, tickets, notifications, coaching |
| FEAT-M16 | Audit fixes | Done | S3 upload contract, signed PDF link, route strings, `/health` field, type errors (TASK-006) |
| FEAT-M15 | Worker-aligned processing | Done | S3 presigned ingest (`source_key`), `/jobs/active` header ring, leave-while-processing, quota start time / cancel |

## Inherited lab roadmap (do not implement in this repo)

Done on the server: pose pipeline, Action vs Ball flight, auth, drills,
leaderboard, bookings, notifications, admin, **dedicated video workers**,
**daily quota**, S3 presigned upload + CloudFront signed playback (Cloudinary
was retired on 31 Aug 2026).

If a prompt asks for “better km/h like Fulltrack / lidar”, that is **lab**
work (stump calibration is already Ball flight), not a mobile-only change and
not something to paste onto Action results.

## Change log

- **17 Aug 2026:** Greenfield Expo client at `~/Desktop/cric-lab-ai`.
- **27 Aug 2026:** Sibling lab is `Cric-Lab/criclab-web-backend` (not
  CricLabMLReview). Auth required. Brand CricLab. Dark/lime UI. Train +
  leaderboard. Two film modes stay separate.
- **3 Sep 2026:** Matched the web workspace: clips go to Cloudinary (not S3)
  then the website API queues a job for `criclab-video-service`. Header ring
  polls `/jobs/active` so leaving a tab does not hide progress. Queued jobs
  show `expected_start_at` and can be cancelled.
- **10 Sep 2026 (TASK-006, audit):** The lab moved from Cloudinary to S3 on
  31 Aug; the phone was still reading `GET /videos/upload-params` as
  Cloudinary parameters, so every upload silently fell back to multipart
  through FastAPI — a path the separate video worker cannot fetch from in
  production. Uploads now PUT to the presigned S3 URL and post `source_key`
  (Action and Ball flight). Also fixed: `?download=1` appended to a
  CloudFront-signed PDF URL (breaks the signature), `/(tabs)/balltrack` and
  `/(tabs)` route strings, `/health` reads `service`, two `StyleSheet`
  type errors, `*.apk` ignored. Still open: `EXPO_PUBLIC_API_BASE_PROD` is
  empty and not set in `eas.json`.
