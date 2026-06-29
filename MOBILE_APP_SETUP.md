# Stretchline — Mobile App (iOS + Android)

Your web app is now Capacitor-ready. This wraps the same site you already published into a real native app you can submit to the **App Store** and **Google Play**.

## One-time setup (on your computer)

You need a Mac for iOS (Xcode) and any computer for Android (Android Studio). Chromebooks can do Android only; for iOS use a cloud Mac (MacinCloud) or Codemagic.

1. **Push to GitHub** (already done if you used the + menu → GitHub).
2. On your computer, clone the repo and install:
   ```bash
   git clone <your-repo-url>
   cd <repo>
   npm install
   ```
3. **Add the native platforms** (run once):
   ```bash
   npx cap add ios
   npx cap add android
   ```
4. **Build the web bundle and sync into native projects:**
   ```bash
   npm run build
   npx cap sync
   ```

## Run it

- **iOS** (Mac required):
  ```bash
  npx cap run ios
  ```
  Or open in Xcode: `npx cap open ios`
- **Android**:
  ```bash
  npx cap run android
  ```
  Or open in Android Studio: `npx cap open android`

## Before submitting to the stores

Open `capacitor.config.ts` and **delete the `server` block** (it points at the Lovable preview for hot-reload during dev). Then:

```bash
npm run build
npx cap sync
```

This bundles the production web assets inside the app.

## App Store (iOS) checklist

- Apple Developer account ($99/year)
- App icon (1024×1024) + launch screen — set in Xcode under `App > Assets`
- In Xcode → Signing & Capabilities → add **Sign in with Apple** (already wired in the auth screen)
- Privacy Policy URL: `https://stretch-streak-studio.lovable.app/privacy`
- Account Deletion is already implemented (Profile → Delete account)
- Archive → Distribute App → App Store Connect

## Google Play checklist

- Google Play Console account ($25 one-time)
- App icon (512×512) + feature graphic (1024×500)
- Privacy Policy URL (same as above)
- In Android Studio → Build → Generate Signed App Bundle → upload `.aab` to Play Console

## Updating the app after launch

Any change you make in Lovable just needs:
```bash
git pull
npm run build
npx cap sync
```
Then re-archive/re-upload. Small JS-only changes don't always need a new store review if you keep the same version — but for safety, bump version in Xcode/Android Studio.
