# Android WebView demo wrapper

This `android/` folder contains a minimal Android project that wraps your deployed web app (Next.js) in a full‑screen WebView for quick demo APK builds.

## 1) Set your web URL

Edit:

- `app/src/main/java/com/alminkey/invoicemobile/MainActivity.kt`

Change:

```kotlin
private val startUrl = "https://YOUR-VERCEL-URL.vercel.app"
```

to your deployed URL (see Vercel steps below).

## 2) Build steps (Android Studio)

1. Open Android Studio → "Open" → select the `android/` folder
2. Let Android Studio download the Gradle wrapper and sync
3. Build → Build Bundle(s)/APK(s) → Build APK(s)
4. APK location: `android/app/build/outputs/apk/release/` (or `debug/` for debug)

Notes:
- Min SDK 26, Target SDK 34, Kotlin 1.9
- Release build is minified, debug is not

## 3) Vercel deployment (Next.js)

You need an HTTPS URL to load in WebView.

Steps:

1. Push your repo to GitHub (already done)
2. Go to https://vercel.com → "New Project" → Import your GitHub repo
3. Framework preset: Next.js; keep defaults; Deploy
4. After deploy, get the URL like `https://your-app.vercel.app`
5. Put that URL into `startUrl` in `MainActivity.kt`

## 4) Customizations

- Adjust `AndroidManifest.xml` label/icon as desired
- If your web app needs downloads/intent handling, hook it in `WebViewClient`
- For a more native PWA experience (TWA), consider Bubblewrap (requires domain verification)

