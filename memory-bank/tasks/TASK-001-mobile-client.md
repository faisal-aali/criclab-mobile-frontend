# TASK-001 — Mobile client foundation

**Repo:** `cric-lab-ai` (Expo)  
**Status:** Done (17 Aug 2026)

## Goal

Ship a phone client that can run the CricLab bowling workflow against the
FastAPI lab: profile → video → job poll → results → history.

## Done when

- [x] Expo Router tabs + stack (processing, results)
- [x] Typed API client aligned with lab JSON (`metricReady`)
- [x] Configurable API base (sim / emulator / LAN)
- [x] Pick or record video; multipart upload
- [x] Results: videos, tiles, sequence, scores, Gemma, PDF

## Out of scope

- MediaPipe on device
- Changing metric formulas (lab repo)

## Notes

Sibling lab is now `/Users/macbookpro/Desktop/Cric-Lab/criclab-web-backend`
(was CricLabMLReview). See TASK-003 for auth + UI alignment.
