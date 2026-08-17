# Tech Context — Cric-Lab AI (mobile)

## This repo

Expo React Native app. Display name **Cric-Lab AI**. Folder
`/Users/macbookpro/Desktop/cric-lab-ai`. Separate git remote from the lab.

## Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| App | **Expo + React Native + TypeScript** | Phone / simulator client |
| Nav | **Expo Router** | Tabs (Analyze, History, Settings) + stack (processing, results) |
| Video pick | `expo-image-picker` | Library + camera, videos only |
| Playback | `expo-video` | Original + overlay clips |
| Storage | `@react-native-async-storage/async-storage` | Profile + API base URL |
| PDF / links | `expo-web-browser`, `expo-clipboard` | Open report, copy Cloudinary URL |
| Lab API | Fetch → FastAPI | Upload, jobs, deliveries, health |

Read **this project's** `package.json` for the exact Expo SDK. Do not assume
SDK 54 vs 57 from memory — use the installed version and
[docs.expo.dev](https://docs.expo.dev/).

## Sibling lab (required to analyze a clip)

Path: `/Users/macbookpro/Desktop/CricLabMLReview`

| Layer | Technology | Purpose |
|-------|------------|---------|
| API | Python **FastAPI** (`backend/.venv312`) | Jobs, metrics, artifacts |
| Pose | MediaPipe BlazePose | Measurement engine |
| Overlay / PDF | OpenCV + ReportLab | Slow-mo HUD + SpinLab-style report |
| DB | MongoDB | Deliveries / history |
| LLM | Ollama `gemma3:4b` | Coaching narrative from metrics JSON only |
| Hosting | Cloudinary + local `/artifacts` | Shareable video + PDF |

Python **3.10–3.12** only for the lab (`backend/.venv312`). Not this app’s problem,
but uploads fail if that server is down.

## Data flow

```text
Cric-Lab AI (Expo)
  → POST http://<lab>:8000/videos
    → FastAPI job (pose → metrics → overlay → Gemma → PDF)
      → GET /jobs/:id (poll)
        → GET /deliveries/:id
          → Results screen (same JSON as the Vite web app)
```

The Vite web app in the lab uses a `/api` proxy. **This app does not.** It calls
port 8000 directly.

## Repo layout

```text
cric-lab-ai/
├── app/                      # Expo Router
│   ├── _layout.tsx           # root stack
│   ├── (tabs)/               # Analyze, History, Settings
│   ├── processing/[jobId].tsx
│   └── results/[deliveryId].tsx
├── src/
│   ├── api/client.ts         # typed FastAPI client + metricReady
│   ├── api/config.ts         # API base URL
│   ├── components/           # Logo, MetricCard, ClipPlayer, Screen
│   ├── storage/profile.ts
│   └── theme.ts
├── memory-bank/              # this folder — read first
└── package.json
```

## API contract (do not drift)

Types in `src/api/client.ts` must stay aligned with the lab’s
`frontend/src/api/client.ts` (Job, Metrics, MetricValue, Delivery, Artifacts).

`metricReady`: no display value unless `status === 'ok'` (or status omitted with
a real value — prefer requiring `ok`).

## Local setup

```bash
# this app
cd ~/Desktop/cric-lab-ai
npm install
npx expo start

# lab (other repo)
cd ~/Desktop/CricLabMLReview/backend
source .venv312/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

| Where the app runs | API base (Settings) |
|--------------------|---------------------|
| iOS Simulator | `http://127.0.0.1:8000` |
| Android emulator | `http://10.0.2.2:8000` |
| Physical phone | `http://MAC-LAN-IP:8000` (same Wi-Fi) |

`ipconfig getifaddr en0` on the Mac.

## Bowling metrics (display only)

Same list as the lab. Phone must not invent extras.

- Ball speed (km/h, m/s) — in-air path only
- Arm/hand speed at leave-hand
- Release height, time, angle
- Elbow extension, front-knee flexion, hip/shoulder separation
- Arm-swing deg/s
- Stride % height
- Hip/trunk 2D proxies (advanced, not headline)
- Action scores 0–100 (heuristic, not clinical)
- Quality: camera_view, speed_view_ok, calibrated, tracking_ok

## Calibration honesty

Pixel motion ≠ radar. Always show estimated / unavailable the way the JSON says.
Do not “fix” a null by showing `raw_computed`.

## Constraints

- Frontend here is **Expo**, not Vite and not Next.js
- Do not put frame measurement logic in the app or in Gemma
- MongoDB stays on the lab
- Keep Analyze → Processing → Results → History. Don’t replace with a feed/social app
