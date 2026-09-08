# CricLab

Mobile client for the CricLab bowling laboratory. Sign in, film a side-on
**Action** clip or a behind-bowler **Ball flight** session, then view measured
metrics, overlay, Gemma coaching, and the PDF.

This is a **separate repo** from the Python lab. It does **not** run MediaPipe
on the phone. It talks to `Cric-Lab/criclab-web-backend`.

## Memory Bank (agents)

Read `memory-bank/` before changing this app — especially `systemPatterns.md`.
That folder is the product source of truth (two film modes, honest metrics,
auth required, Expo client vs Python pipeline).

## Stack

- Expo SDK 54 + React Native
- Expo Router (auth + Action / Flight / History / Train / More)
- Same API as the web workspace, called **directly** on port 8000 (no `/api` proxy)
- Bearer token on analysis calls; refresh token in AsyncStorage

## Run

```bash
cd ~/Desktop/cric-lab-ai
npm install
npx expo start
```

Then open in Expo Go (iPhone/Android) or a simulator.

## Point it at the backend

Copy `.env.example` to `.env`. `APP_ENV` chooses the lab:

| `APP_ENV` | API | How to run |
|---|---|---|
| `development` (default) | `EXPO_PUBLIC_API_BASE_DEV` or the Metro LAN IP `:8000` | `npm start` |
| `production` | `EXPO_PUBLIC_API_BASE_PROD` | `npm run start:prod` or EAS `preview` / `production` |

1. Start FastAPI so a phone can reach it:

```bash
cd ~/Desktop/Cric-Lab/criclab-web-backend
./run.sh
```

2. For a physical phone, set `EXPO_PUBLIC_API_BASE_DEV=http://YOUR-MAC-LAN-IP:8000` (`ipconfig getifaddr en0`). Same Wi-Fi as the Mac.

3. Create an account (or sign in), confirm email, then analyze.

Restart Expo after changing `.env` (`npx expo start -c`). Set `EXPO_PUBLIC_API_BASE_PROD` before an EAS store build.

## Film

**Action (side-on):** full body in frame, one delivery, ball visible after it leaves the hand. Height and bowling arm scale km/h.

**Ball flight (behind bowler):** both stump sets in frame, ~4 m behind the bowler. Empty clips return “no ball found” — never a fake speed.

Do not mix Action numbers with Ball flight numbers.
