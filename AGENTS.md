# Cric-Lab AI — agent instructions

This repository is **Cric-Lab AI**, the Expo / React Native client for the
Cric-Lab bowling laboratory.

## Read first

1. `memory-bank/README.md`
2. `memory-bank/productBrief.md`
3. `memory-bank/techContext.md`
4. `memory-bank/systemPatterns.md` — architecture; overrides vague prompts
5. `memory-bank/roadmap.md`
6. `memory-bank/agent-rules/agent.md`

If a user prompt conflicts with `systemPatterns.md`, follow the Memory Bank and say so.

## What to build

A phone UI that uploads a **side-on bowling** clip to the FastAPI lab and shows
the same metrics, overlay, Gemma notes, and PDF as the web app.

Do **not** rebuild pose / ball tracking / overlay encode / ReportLab / Ollama
in this repo. That code lives in `CricLabMLReview`.

## Expo docs

Use the SDK version in `package.json` (not an assumed version). Versioned docs:
https://docs.expo.dev/
