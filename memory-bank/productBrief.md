# Product Brief — Cric-Lab AI (mobile)

## Purpose

Cric-Lab is an **AI Cricket Bowling Laboratory**: capture or pick a bowling
video, get measurable bowling insights, and open a professional PDF analysis
report. Inspired by SpinLab AI’s video-analysis experience, focused on cricket
bowling for v1.

**This repo is the phone app.** Display name: **Cric-Lab AI**.

**Core promise:** Video → (lab) Pose Motion Analysis → Biomechanics Metrics →
Slow-motion Overlay Clip → On-device Results → AI Summary → SpinLab-style PDF.

Like **SpinLab AI** for quarterbacks, but for **cricket bowling**.

## Users

- Individual bowlers / athletes analyzing their own action
- Coaches reviewing bowling sessions
- Single-user or small coaching workflows first (auth can be light for MVP)

## What this mobile app must do (v1)

Mirror the web lab screens. Do **not** invent a different product.

1. **Analyze (upload)** — required bowler profile (name, DOB, height ft/in,
   weight lbs, bowling arm, style) + one delivery video (library or camera)
2. **Processing** — poll job status; show pipeline stages; never pretend analysis
   is instant
3. **Results** — overlay + original video, headline ball/arm speed, quality
   banner, kinematic sequence, action scores, metric cards, Gemma sections, PDF
4. **History** — list past deliveries from the lab API; open a result
5. **Settings** — API base URL (simulator vs LAN phone) + health check

The phone **uploads a file** and **renders JSON + media URLs**. Pose, ball
track, overlay encode, Gemma, and PDF still run on the FastAPI lab.

## Inherited lab features (server — already built)

Do not rebuild these in React Native. Display their outputs honestly.

1. Pose pipeline — MediaPipe BlazePose
2. Release & phases — BFC → FFC → MER → REL → FT
3. Metrics — ball speed (in-air lock only), arm speed, release height/angle/time,
   joint angles, stride, 2D rotation proxies, scores, confidence
4. Slow-motion overlay — grayscale HUD, Cloudinary URL when available
5. AI analysis — Gemma from structured metrics only
6. PDF — SpinLab-style cricket report
7. History — MongoDB deliveries

## Success Metrics (mobile)

| Metric | Target |
|--------|--------|
| End-to-end: pick clip → results → PDF | Works against a running local lab |
| Profile required before Analyze | Height + bowling arm cannot be skipped |
| Metrics shown with confidence | `status !== ok` → "—" never a fake km/h |
| Job progress visible | Stages poll until completed/failed |
| Physical phone can hit the lab | Settings URL + uvicorn `--host 0.0.0.0` |

## Out of Scope (v1)

- Batting, fielding, wicket-keeping
- On-device MediaPipe / TensorFlow Lite pose
- Claiming radar-gun accuracy (Fulltrack-style stump calibration is a *future*
  lab feature, not a phone-only trick)
- Multi-tenant SaaS / team billing
- Frame-by-frame measurement by any LLM (on device or server)
- Merging this repo into `CricLabMLReview`

## Product Principles

- **CV + physics first, LLM second** — measurements are structured; Gemma narrates
- **Estimates until calibrated** — label them; never clamp a bad number
- **Bowling-only MVP**
- **Same metrics JSON as the web app** — `metricReady` = value present AND `status === 'ok'`
- **SpinLab-like clarity** — video, cards, scores, AI notes, PDF
- **Film side-on** — front-on cannot yield truthful 2D km/h; the lab will reject it
