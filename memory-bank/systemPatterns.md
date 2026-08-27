# System Patterns — CricLab (mobile)

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
- Mix Action numbers into a Ball flight screen (or the reverse)

Pipeline (lab — sibling repo `Cric-Lab/criclab-web-backend`, Python 3.12):

```text
Upload → Extract → POSE (MediaPipe) → Action/release → Calibrate
  → Best-effort ball track → Metrics JSON → Slow-mo overlay
  → Cloudinary → Agent (gemma3:4b) → PDF → MongoDB
```

Ball flight is a **separate** pipeline (stump calibration → trajectories →
pitch map). Jobs are immutable.

Phone flow (Action):

```text
Sign in (verified)
  → Action screen (profile + video)
  → POST /videos (multipart, Bearer)
  → Processing polls GET /jobs/:id
  → Results GET /deliveries/:id
  → History GET /deliveries
```

Phone flow (Ball flight):

```text
Align stumps → POST /balltrack/detect-stumps
  → Film session → POST /balltrack/sessions
  → Poll GET /balltrack/jobs/:id
  → Session / delivery screens
```

## Architecture rule #2 — pose is the measurement engine; ball speed needs a real lock

(Inherited from the lab. The mobile UI must **honor** this JSON, not fight it.)

- **Action ball speed** is headline only when the ball is tracked **in flight**
  after leave-hand. Wrist/torso/fence locks are not a ball — show "—" + the note.
- **Release = leave-hand**, not the highest wrist (cocking / MER).
- **Scale** from user-provided height. Never invent 1.7 m. No height → no km/h/m.
- **Truth contract**: measure or null+reason. Sanity gates **reject** — never
  clamp a bad number into a “nice” value.
- **`metricReady(m)`**: `m.value != null` AND `m.status === 'ok'`.
  If status is `unavailable` / `estimated` without ok, do not paint a number.
- **2D hip/trunk rotation** is advanced proxy only — not headline truth.
- **Front-on / poor view** (`quality.camera_view`, `speed_view_ok === false`):
  quality banner must say film side-on; do not display a fake km/h.
- **Ball flight** with no ball in the air → “no ball found”, never a guessed speed.

## Architecture rule #3 — auth is mandatory

The lab requires a verified user for `/videos`, `/deliveries`, `/balltrack/*`
(except health). This app must:

- `POST /auth/signup`, `/login`, `/refresh`, `/logout`, `GET /auth/me`, OTP verify
- Keep the **access token in memory**; persist only the **refresh token**
- Attach `Authorization: Bearer …` on authenticated calls
- On 401: refresh once (shared in-flight promise), retry; if refresh fails, end
  the session and route to sign-in
- Do not log tokens

Frontend gates are UX. The backend is the boundary.

## Screens (Expo Router)

| Route | Role |
|-------|------|
| `app/(auth)/login.tsx` | Sign in |
| `app/(auth)/signup.tsx` | Create account |
| `app/(auth)/verify.tsx` | Email OTP |
| `app/(auth)/forgot.tsx` | Password recovery |
| `app/(drawer)/(tabs)/index.tsx` | Action — profile + pick/record video |
| `app/(drawer)/(tabs)/balltrack.tsx` | Ball flight hub |
| `app/(drawer)/(tabs)/history.tsx` | Past Action deliveries |
| `app/(drawer)/(tabs)/train.tsx` | Drill library |
| `app/(drawer)/(tabs)/profile.tsx` | Account, bowling profile, lab URL |
| `app/(drawer)/leaderboard.tsx` | Top measured Action throws |
| `app/(drawer)/tickets/*` | Support tickets (list, thread, reply) |
| `app/(drawer)/notifications.tsx` | Lab notifications |
| `app/(drawer)/coaching.tsx` | Book / cancel coaching sessions |
| `app/processing/[jobId].tsx` | Poll Action job |
| `app/results/[deliveryId].tsx` | Action report |
| `app/balltrack/*` | Record, process, session, delivery |

The side drawer (hamburger on the lab tabs) holds Leaderboard, Tickets,
Notifications, and Coaching. Bottom tabs stay the film workflow: Action,
Flight, History, Train, More. Analysis routes sit on the root stack so they
cover the tabs; their back control must pop if possible and otherwise return
to `/` (processing uses `replace` onto results, which can leave no history).

Results must show: analyzed video, metric cards, scores, AI summary, PDF. Poll
job status; never block without progress.

All writes go through FastAPI (`src/api/http.ts` + `src/api/client.ts`).

## API client

- Base URL from Profile / `EXPO_PUBLIC_API_BASE` / platform default
  (`http://127.0.0.1:8000` iOS sim, `http://10.0.2.2:8000` Android emulator).
- Hit the lab **directly** (no `/api` Vite proxy). Port 8000.
- Upload `FormData` with RN file `{ uri, name, type }`. Do not set Content-Type
  on multipart (boundary must be generated).
- Relative artifact URLs (`/artifacts/...`) must be prefixed with the API base.
- Prefer Cloudinary playback URLs when present.

Required Action upload fields (same as web):

`file`, `player_name`, `first_name`, `last_name`, `date_of_birth`, `height_ft`,
`height_in`, `weight_lbs`, `bowling_arm`, `bowling_style`, optional
`meters_per_pixel`.

## Film guidance

**Action:** side-on camera, tripod or stable phone, full body from run-up through
follow-through, ball visible in the air after it leaves the hand.

**Ball flight:** ~4 m behind the bowler, ~1.5 m high, both stump sets in frame,
20.12 m pitch. Do not reuse Action footage here.

## Brand

- Name: **CricLab**
- Night `#05090a`, charcoal `#0b1113`, lime `#b6f24a`, chalk `#f6f9f7`,
  seam `#d9743c`
- Dark UI. Lime is the accent / primary button (night text on lime).
- Logo: CricLab mark + wordmark “CricLab”

## Confidence & honesty (UI)

- Every physical metric: confidence + estimated badge when the lab says so
- Quality banner from `metrics.quality` (camera view, calibrated, tracking_ok)
- Prefer "—" over a convincing wrong km/h
- Leaderboard ranks **measured** (`status === 'ok'`) Action ball speed only

## Anti-patterns (do not introduce)

- Using an LLM as the motion engine
- Reporting ball speed when `metricReady` is false
- Claiming radar-grade speed
- On-device pose / “we’ll just use Vision Camera + a model”
- Next.js, Vite, or copying web CSS into this repo
- Fat components that reimplement backend metrics
- Hard-coding only `localhost` with no Settings override (physical phones break)
- Calling the lab without a Bearer token
- Mixing Action and Ball flight numbers
- Batting/fielding features before bowling MVP is solid
- Reintroducing Notera (notes/PWA) or the retired `CricLabMLReview` path

## MVP checklist (this repo)

1. Auth: signup, verify, login, refresh, sign out
2. Bowler profile persisted (AsyncStorage)
3. Pick or record one Action delivery (authenticated upload)
4. Processing stages until complete / fail
5. Results: overlay, original, tiles, sequence, scores, metrics, AI, PDF
6. History list (own deliveries)
7. Ball flight session flow
8. Train drills + leaderboard
9. Configurable API base + health check
10. Side drawer: tickets, notifications, coaching
