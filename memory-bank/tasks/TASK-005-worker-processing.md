# TASK-005 — Align mobile with video workers + header jobs

## Goal

Match `criclab-web-frontend` after the dedicated worker split: the phone
queues analysis and stays usable. CV does not run in the Expo app or in the
website API process.

## Context

- Website API inserts `queued` jobs (`POST /videos`, `POST /balltrack/sessions`)
- `criclab-video-service` claims and measures
- Web uses signed **Cloudinary** upload (`source_url`), not S3
- Web header ring polls `GET /jobs/active`
- Quota: `expected_start_at` while queued; cancel only while `queued`

## Done in this repo

- `cloudinaryClipUrl` + `source_url` on Action and Ball flight (multipart fallback)
- `ProcessingJobsProvider` + `ProcessingIndicator` in AppHeader / drawer / analysis headers
- Upload stays on the tab; optional processing screen; “Keep using CricLab”
- `expected_start_at` + remove-from-queue
- `cloudinaryPlaybackUrl` for HEVC originals
