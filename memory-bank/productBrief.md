# Product Brief — CricLab (mobile)

## Purpose

CricLab is a **cricket bowling analysis lab**. Film a delivery, get measured
biomechanics (or an honest “—”), then a coaching narrative and PDF. Pose
(MediaPipe) is the measurement engine. Gemma never measures. Never invent km/h.

**This repo is the phone app.** Display name: **CricLab**.

**Core promise:** Video → (lab) Pose Motion Analysis → Biomechanics Metrics →
Slow-motion Overlay → Results → AI Summary → PDF. Same JSON as the web workspace.

## Two film modes (must not mix numbers)

| Mode | Camera | What it measures |
|------|--------|------------------|
| **Action** | Side-on, full body | Mechanics: release, sequence, arm speed, stride. Ball km/h only with an in-air lock. |
| **Ball flight** | Behind the bowler, stump-calibrated | Speed, line, length, pitch map. Empty clips → “no ball found”, never a fake speed. |

Action results and Ball flight results are separate jobs. Do not show a Ball
flight km/h on an Action report, or Action joint angles on a Ball flight ball.

## Users

- Individual bowlers analyzing their own action
- Coaches reviewing bowling sessions
- Signed-in, **email-verified** accounts (same as the web workspace)

## What this mobile app must do

1. **Auth** — sign up, verify email (OTP), sign in, refresh, sign out. Access
   token in memory; refresh token in AsyncStorage. Bearer on every analysis call.
2. **Action** — bowler profile + one side-on clip → `POST /videos`
3. **Processing** — poll `GET /jobs/:id`; never pretend analysis is instant
4. **Results** — overlay + original, headline speeds only when `metricReady`,
   quality banner, sequence, scores, Gemma, PDF
5. **History** — this user’s Action deliveries (`GET /deliveries`)
6. **Ball flight** — stump alignment → session film → `POST /balltrack/sessions`
7. **Train** — drill catalog (`GET /coaching/drills`)
8. **Leaderboard** — top measured Action ball speeds (`GET /leaderboard`); other
   players’ reports stay private (`result_id` only when `mine`)
9. **Account / lab URL** — profile, API base (simulator vs LAN), health ping

The phone **uploads a clip** (S3 presigned PUT when the lab has object storage,
else multipart through the API) and **renders JSON + media URLs**. Pose, ball track, overlay, Gemma, and PDF run in
`criclab-video-service`. The website API only queues and serves. Leaving a
screen does not stop a job.

## Inherited lab features (server — already built)

Do not rebuild these in React Native. Display their outputs honestly.

1. Pose pipeline — MediaPipe BlazePose
2. Release & phases — BFC → FFC → MER → REL → FT
3. Metrics — ball speed (in-air lock only on Action), arm speed, release, joints,
   stride, 2D rotation proxies, scores, confidence
4. Ball flight — stump calibration, trajectory, pitch map
5. Slow-motion overlay + PDF served as CloudFront signed URLs
6. AI analysis — Gemma from structured metrics only
7. PDF — bowling report
8. Auth, notifications, bookings, drill catalog, leaderboard

## Success metrics (mobile)

| Metric | Target |
|--------|--------|
| Signed-in upload → results → PDF | Works against a running local lab |
| Unverified account cannot analyze | Routed to OTP verify |
| Metrics shown with confidence | `status !== ok` → "—" never a fake km/h |
| Two modes stay separate | No mixed numbers on one screen |
| Physical phone can hit the lab | Settings URL + uvicorn `--host 0.0.0.0` |

## Out of scope

- Batting, fielding, wicket-keeping
- On-device MediaPipe / TensorFlow Lite pose
- Claiming radar-gun accuracy
- Mixing Action and Ball flight into one “super report”
- Porting the Vite web CSS; this is Expo
- Talking to MongoDB or Ollama from the phone
- Admin UI (that is the web `/admin` shell)

## Product principles

- **CV + physics first, LLM second** — measurements are structured; Gemma narrates
- **Measure or null + reason** — never clamp a bad number into a nice value
- **Bowling-only MVP**
- **Same metrics JSON as the web app** — `metricReady` = value present AND `status === 'ok'`
- **Film Action side-on** — front-on cannot yield truthful 2D km/h
- **Auth is required** — frontend guards are not a security boundary; the lab enforces it
