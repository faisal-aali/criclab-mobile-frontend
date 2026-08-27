# CricLab — agent instructions

This repository is **CricLab**, the Expo / React Native client for the CricLab
bowling laboratory.

## Read first

1. `memory-bank/README.md`
2. `memory-bank/productBrief.md`
3. `memory-bank/techContext.md`
4. `memory-bank/systemPatterns.md` — architecture; overrides vague prompts
5. `memory-bank/roadmap.md`
6. `memory-bank/agent-rules/agent.md`

If a user prompt conflicts with `systemPatterns.md`, follow the Memory Bank and say so.

## What to build

A phone UI that signs in to `criclab-web-backend`, uploads an **Action**
(side-on) clip or a **Ball flight** session, and shows the same metrics,
overlay, Gemma notes, and PDF as the web workspace.

Do **not** rebuild pose / ball tracking / overlay encode / ReportLab / Ollama
in this repo. That code lives in `/Users/macbookpro/Desktop/Cric-Lab/criclab-web-backend`.

Do not mix Action and Ball flight numbers. Do not invent km/h. Auth is required.

## Expo docs

Use the SDK version in `package.json` (not an assumed version). Versioned docs:
https://docs.expo.dev/
