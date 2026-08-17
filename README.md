# Cric-Lab AI

Mobile client for the Cric-Lab bowling laboratory. Upload a side-on bowling clip from your phone, then view pose metrics, the slow-motion overlay, Gemma coaching, and the PDF report.

This is a **separate repo** from the Python/React web lab. It does **not** run MediaPipe on the phone. It talks to the existing FastAPI backend.

## Stack

- Expo SDK 57 + React Native
- Expo Router (Analyze / History / Settings)
- Same API as the web app: `POST /videos`, `GET /jobs/:id`, `GET /deliveries`

## Run

```bash
cd cric-lab-ai
npm install
npx expo start
```

Then open in Expo Go (iPhone/Android) or a simulator.

## Point it at the backend

1. In the **CricLabMLReview** project, start FastAPI on all interfaces so a phone can reach it:

```bash
cd backend
source .venv312/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. In **Cric-Lab AI → Settings**, set the API base URL:

| Where you run the app | URL |
|---|---|
| iOS Simulator | `http://127.0.0.1:8000` |
| Android emulator | `http://10.0.2.2:8000` |
| Physical phone | `http://YOUR-MAC-LAN-IP:8000` |

Find the Mac IP with `ipconfig getifaddr en0`. Phone and Mac must be on the same Wi-Fi.

3. Tap **Test connection**. You should see “Connected to Cric-Lab API”.

Optional: create `.env` with `EXPO_PUBLIC_API_BASE=http://192.168.x.x:8000` (restart Expo after changing it).

## Film

- Side-on camera, full body in frame
- One delivery, ball visible after it leaves the hand
- Enter real height and bowling arm — those scale km/h and metres

## Create a GitHub repo

This folder is already a git repo and is **not** inside CricLabMLReview.

```bash
cd ~/Desktop/cric-lab-ai
git add .
git commit -m "Initial Cric-Lab AI Expo client"
gh repo create cric-lab-ai --private --source=. --remote=origin --push
```

Or create an empty repo on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USER/cric-lab-ai.git
git push -u origin HEAD
```
