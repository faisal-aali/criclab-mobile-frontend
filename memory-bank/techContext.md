# Tech Context — CricLab (mobile)

## This repo

Expo React Native app. Display name **CricLab**. Folder
`/Users/macbookpro/Desktop/cric-lab-ai`. Separate git remote from the web monorepo.

## Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| App | **Expo + React Native + TypeScript** | Phone / simulator client |
| Nav | **Expo Router** | Auth stack + drawer (Leaderboard, Tickets, Notifications, Coaching) + tabs (Action, Flight, History, Train, More) + analysis stacks |
| Video pick | `expo-image-picker` | Library + camera, videos only |
| Ball flight camera | `expo-camera` | Behind-bowler session film |
| Playback | `expo-video` | Original + overlay clips |
| Storage | `@react-native-async-storage/async-storage` | Refresh token, profile, API base |
| PDF / links | `expo-web-browser`, `expo-clipboard` | Open report, copy Cloudinary URL |
| Lab API | Fetch → FastAPI with Bearer | Auth, upload, jobs, deliveries, balltrack, drills, leaderboard, tickets, notifications, coaching |

Read **this project's** `package.json` for the exact Expo SDK. Do not assume
SDK from memory — use the installed version and
[docs.expo.dev](https://docs.expo.dev/).

## Sibling lab (required to analyze a clip)

Website API: `/Users/macbookpro/Desktop/Cric-Lab/criclab-web-backend`

Video workers: `/Users/macbookpro/Desktop/Cric-Lab/criclab-video-service`

| Layer | Technology | Purpose |
|-------|------------|---------|
| API | Python **3.12** FastAPI (`.venv312`) | Auth, signed upload params, queue insert, job/delivery reads |
| Workers | `python -m app.worker` | Pose, overlay, PDF, Gemma video notes |
| Pose | MediaPipe BlazePose | Measurement engine (worker only) |
| Overlay / PDF | OpenCV + ReportLab | Slow-mo HUD + report (worker only) |
| DB | MongoDB | Users, deliveries, sessions |
| Ingest | Cloudinary signed upload | Clip bytes skip the API when configured |
| LLM | Ollama `gemma3:4b` | Coaching narrative from metrics JSON only |

Start the API with `./run.sh` from the backend folder (`--host 0.0.0.0`). Start
the worker from `criclab-video-service` or jobs stay `queued`. Uploads fail if
the API is down. Analysis does not finish if the worker is down.

The Vite web app uses a `/api` proxy. **This app does not.** It calls port 8000
directly.

## Data flow

```text
CricLab (Expo)
  → POST http://<lab>:8000/auth/login
  → GET /videos/upload-params → Cloudinary (when configured)
  → POST http://<lab>:8000/videos   (Bearer, source_url or file)
    → FastAPI queues the job
      → criclab-video-service claims and measures
        → GET /jobs/active (header ring) + GET /jobs/:id
          → GET /deliveries/:id
            → Results screen (same JSON as the Vite web app)
```

## Repo layout

```text
cric-lab-ai/
├── app/                      # Expo Router
│   ├── _layout.tsx           # AuthProvider + root stack
│   ├── (auth)/               # login, signup, verify, forgot
│   ├── (drawer)/             # side menu + tabs
│   │   ├── (tabs)/           # Action, Flight, History, Train, More
│   │   ├── leaderboard.tsx
│   │   ├── tickets/
│   │   ├── notifications.tsx
│   │   └── coaching.tsx
│   ├── processing/[jobId].tsx
│   ├── results/[deliveryId].tsx
│   └── balltrack/            # record, processing, session, delivery
├── src/
│   ├── api/http.ts           # publicFetch + authFetch + refresh
│   ├── api/auth.ts           # auth endpoints
│   ├── api/client.ts         # videos, jobs, deliveries, drills, leaderboard
│   ├── api/support.ts
│   ├── api/notifications.ts
│   ├── api/coaching.ts
│   ├── api/config.ts         # API base URL
│   ├── auth/AuthProvider.tsx
│   ├── balltrack/api.ts
│   ├── processing/ProcessingJobs.tsx
│   ├── processing/stages.ts
│   ├── components/
│   ├── storage/profile.ts
│   └── theme.ts              # night / lime / chalk
├── memory-bank/
└── package.json
```

## API contract (do not drift)

Types in `src/api/client.ts` must stay aligned with
`Cric-Lab/criclab-web-frontend/src/api/client.ts` (Job including `eta_seconds`,
`expected_start_at`, `kind`, Metrics, MetricValue, Delivery, Artifacts,
LeaderboardRow, DrillCatalogItem).

`metricReady`: no display value unless `status === 'ok'` and value is present.

Auth types match `criclab-web-frontend/src/api/auth.ts`:
`AuthUser { id, email, name, role, email_verified, ... }`,
`TokenBundle { access_token, refresh_token, expires_at, expires_in, user }`.

## Local setup

```bash
# this app
cd ~/Desktop/cric-lab-ai
npm install
npx expo start

# lab (other repos)
cd ~/Desktop/Cric-Lab/criclab-web-backend
./run.sh
cd ~/Desktop/Cric-Lab/criclab-video-service
python -m app.worker
```

| Where the app runs | API base (More tab) |
|--------------------|---------------------|
| iOS Simulator | `http://127.0.0.1:8000` |
| Android emulator | `http://10.0.2.2:8000` |
| Physical phone | `http://MAC-LAN-IP:8000` (same Wi-Fi) |

`ipconfig getifaddr en0` on the Mac.

## Bowling metrics (display only)

Same list as the lab. Phone must not invent extras.

- Ball speed (km/h, m/s) — in-air path only on Action
- Arm/hand speed at leave-hand
- Release height, time, angle
- Elbow extension, front-knee flexion, hip/shoulder separation
- Arm-swing deg/s
- Stride % height
- Hip/trunk 2D proxies (advanced, not headline)
- Action scores 0–100 (heuristic, not clinical)
- Quality: camera_view, speed_view_ok, calibrated, tracking_ok
- Ball flight: speed, line, length, pitch map — never mixed into Action

## Calibration honesty

Pixel motion ≠ radar. Always show estimated / unavailable the way the JSON says.
Do not “fix” a null by showing `raw_computed`.

## Constraints

- Frontend here is **Expo**, not Vite and not Next.js
- Do not put frame measurement logic in the app or in Gemma
- MongoDB stays on the lab
- Keep Action → Processing → Results and Flight → Session separate
- Auth tokens: never log them; never put the access token in AsyncStorage
