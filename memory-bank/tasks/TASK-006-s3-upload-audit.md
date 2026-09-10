# TASK-006 — Audit: S3 upload contract and phone fixes

**Repo:** `cric-lab-ai` (Expo)
**Status:** Done (10 Sep 2026)

Part of one cross-system audit (web, API, worker, phone). Screens the product
hides `For Future` (ball-flight tab, tickets, coaching) were not changed.

## Fixed

| Where | Problem | Fix |
|---|---|---|
| `src/api/client.ts`, `src/api/nativeUpload.ts` | `cloudinaryClipUrl()` read `/videos/upload-params` as `{cloud_name, api_key, signature, …}`; the lab returns `{upload_url, method, headers, key}` (S3). It always returned `null`, so clips went multipart through FastAPI; the worker on the other EC2 then failed with "Clip has no S3 source_key" | `uploadOriginalKey()`: PUT bytes to the presigned URL (`nativeBinaryPut`, BINARY_CONTENT, signed headers only), then `POST /videos` with `source_key` |
| `src/balltrack/api.ts` | same dead flow for ball flight | same `uploadOriginalKey` + `source_key` |
| `app/results/[deliveryId].tsx` | `?download=1` appended to an absolute CloudFront-signed PDF URL → signature mismatch | query added only on relative `/artifacts/...` paths (mirrors web `downloadHref`) |
| `app/balltrack/processing/[jobId].tsx`, `app/balltrack/record.tsx` | `router.replace('/(tabs)/balltrack')` — no such path | `/balltrack` |
| `app/(auth)/verify.tsx` | `router.replace('/(tabs)')` | `/` |
| `app/(drawer)/(tabs)/profile.tsx` | health ping read `r.name`; the lab returns `service` | `service` |
| `app/action/record.tsx`, `app/balltrack/record.tsx` | `StyleSheet.absoluteFillObject` does not exist in RN 0.86 types (2 `tsc` errors) | `StyleSheet.absoluteFill` |
| `src/components/ClipUploadOverlay.tsx` + callers | progress phase `cloudinary` | `upload` |
| `.gitignore`, `README.md` | 89 MB `CricLab-debug.apk` tracked; README said SDK 54 | `*.apk` ignored (run `git rm --cached CricLab-debug.apk`); SDK 57 |

`npx tsc --noEmit` is clean.

## Blockers / recommendations (not changed)

- **`EXPO_PUBLIC_API_BASE_PROD` is empty** in `.env` and not set in any
  `eas.json` profile, so a production build resolves the API base to `''`.
  Set it (EAS secret or `env` block) to the deployed API origin.
- Refresh token lives in AsyncStorage; `expo-secure-store` is the better home.
- `NSAllowsArbitraryLoads` / `usesCleartextTraffic` are on in the shipped
  config (needed for the LAN lab; consider a dev-only override).
- Not on the phone (and not in its scope document): training trends page,
  assistant chat, ticket attachments, account name edit / device list, clip
  trimming, admin.
- `expo-sharing`, `expo-document-picker`, `buffer` are unused dependencies;
  `src/shimmer/MetricsShimmer.tsx` and `assets/splash-icon.png` are unused.
