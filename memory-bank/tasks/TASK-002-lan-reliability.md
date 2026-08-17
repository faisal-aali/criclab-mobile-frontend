# TASK-002 — Expo Go / LAN reliability

**Repo:** `cric-lab-ai`  
**Status:** Planned

## Goal

Make first-run on a physical phone obvious when the lab is unreachable.

## Ideas

- Surface HTTP vs cleartext / wrong IP errors in Settings with the exact URL tried
- Upload progress (bytes) if fetch allows
- Banner on Analyze when `/health` fails
- Do not silently hang on poll

Obey `systemPatterns.md`: still no on-device measurement.
