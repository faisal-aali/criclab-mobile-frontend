# System Patterns — Cric-Lab AI (mobile)

> **Most important Memory Bank file.** Read before writing code. These rules
> override vague prompts.

## Architecture rule #1 — this phone does not measure

**Computer vision + physics produce measurements on the FastAPI lab.
This app only displays them.**

Never:

- Ask Gemma (or any on-device model) to estimate speed/angles from frames
- Port MediaPipe / OpenCV / ReportLab into Expo
- Talk to MongoDB or Ollama from the phone
- Recompute km/h, stride, or scores in a React Native component

Pipeline (lab — sibling repo `CricLabMLReview`):

```text
Upload → Extract → POSE (MediaPipe) → Action/release → Calibrate
  → Best-effort ball track → Metrics JSON → Slow-mo overlay
  → Cloudinary → Agent (gemma3:4b) → PDF → MongoDB
```

Phone flow:

```text
Analyze screen (profile + video)
  → POST /videos (multipart)
  → Processing screen polls GET /jobs/:id
  → Results screen GET /deliveries/:id
  → History GET /deliveries
```

## Architecture rule #2 — pose is the measurement engine; ball speed needs a real lock

(Inherited from the lab. The mobile UI must **honor** this JSON, not fight it.)

- **Ball speed** is headline only when the ball is tracked **in flight** after
  leave-hand. Wrist/torso/fence locks are not a ball — show "—" + the note.
- **Release = leave-hand**, not the highest wrist (cocking / MER).
- **Scale** from user-provided height. Never invent 1.7 m. No height → no km/h/m.
- **Truth contract**: measure or null+reason. Sanity gates **reject** — never
  clamp a bad number into a “nice” value.
- **`metricReady(m)`**: `m.value != null` AND (`m.status` missing or `'ok'`).
  If status is `unavailable` / `estimated` without ok, do not paint a number.
- **2D hip/trunk rotation** is advanced proxy only — not headline truth.
- **Front-on / poor view** (`quality.camera_view`, `speed_view_ok === false`):
  quality banner must say film side-on; do not display a fake km/h.

## Screens (Expo Router)

| Route | Role |
|-------|------|
| `app/(tabs)/index.tsx` | Analyze — profile + pick/record video |
| `app/(tabs)/history.tsx` | Past deliveries |
| `app/(tabs)/settings.tsx` | API base URL + health ping |
| `app/processing/[jobId].tsx` | Poll job; navigate to results on complete |
| `app/results/[deliveryId].tsx` | Overlay, tiles, scores, Gemma, PDF |

Results must feel SpinLab-like: analyzed video, metric cards, scores, AI summary,
PDF. Poll job status; never block without progress.

All writes go through FastAPI (`src/api/client.ts`).

## API client

- Base URL from Settings / `EXPO_PUBLIC_API_BASE` / platform default
  (`http://127.0.0.1:8000` iOS sim, `http://10.0.2.2:8000` Android emulator).
- Hit the lab **directly** (no `/api` Vite proxy). Paths: `/videos`, `/jobs/:id`,
  `/deliveries`, `/deliveries/:id`, `/health`.
- Upload `FormData` with RN file `{ uri, name, type }`.
- Relative artifact URLs (`/artifacts/...`) must be prefixed with the API base.
- Prefer Cloudinary playback URLs when present.

Required upload fields (same as web):

`file`, `player_name`, `first_name`, `last_name`, `date_of_birth`, `height_ft`,
`height_in`, `weight_lbs`, `bowling_arm`, `bowling_style`, optional
`meters_per_pixel`.

## Film guidance (show on Analyze)

- Side-on camera, tripod or stable phone
- Full body in frame from run-up through follow-through
- Ball visible in the air after it leaves the hand (needed for ball speed)

## Brand

- Name: **Cric-Lab AI** (not SpinLab, not Fulltrack, not Notera)
- Colors: pitch `#0B3D2E`, pitch-deep `#06261C`, seam `#C45C26`, ball `#B91C1C`,
  mist `#EDF3EF`
- Logo: cricket-ball mark + “Cric-Lab AI”

## Confidence & honesty (UI)

- Every physical metric: confidence + estimated badge when the lab says so
- Quality banner from `metrics.quality` (camera view, calibrated, tracking_ok)
- Prefer "—" over a convincing wrong km/h

## Anti-patterns (do not introduce)

- Using an LLM as the motion engine
- Reporting ball speed when `metricReady` is false
- Claiming radar-grade speed
- On-device pose / “we’ll just use Vision Camera + a model”
- Next.js, Vite, or copying `CricLabMLReview/frontend` CSS into this repo
- Fat components that reimplement backend metrics
- Hard-coding only `localhost` with no Settings override (physical phones break)
- Batting/fielding features before bowling MVP is solid
- Reintroducing Notera (notes/PWA)

## MVP checklist (this repo)

1. Bowler profile persisted (AsyncStorage)
2. Pick or record one delivery
3. Upload to lab → job id
4. Processing stages until complete / fail
5. Results: overlay, original, tiles, sequence, scores, metrics, AI, PDF
6. History list
7. Configurable API base + health check
