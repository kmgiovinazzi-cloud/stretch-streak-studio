# Stretchline — Mobile App (iOS + Android)

Stretchline is a TanStack Start app with SSR, server functions, Supabase auth, and the Lovable AI gateway. That stack **cannot** be exported as a fully static bundle, so the Capacitor shell loads the live hosted web app (`https://stretch-streak-studio.lovable.app`) inside a native WebView. The `dist/` folder is just a tiny offline-fallback shell that satisfies `cap sync`.

## One-time setup (on your computer)

You need a Mac for iOS (Xcode). Android works from any OS (Android Studio).

```bash
git clone <your-repo-url>
cd <repo>
npm install
npm run cap:build      # generates the dist/ shell
npx cap add ios        # Mac only
npx cap add android
npx cap sync
```

## Run it

- iOS: `npm run cap:open:ios` (then Run in Xcode)
- Android: `npm run cap:open:android` (then Run in Android Studio)

## Pointing the shell at a different URL

Open `capacitor.config.ts` and change `server.url`, then:

```bash
npm run cap:sync
```

## App Store (iOS) checklist

- Apple Developer account ($99/year)
- App icon (1024×1024) + launch screen in Xcode → `App > Assets`
- Signing & Capabilities → enable **Sign in with Apple**
- Privacy Policy URL: `https://stretch-streak-studio.lovable.app/privacy`
- Account deletion already implemented (Profile → Delete account)
- Archive → Distribute App → App Store Connect

## Google Play checklist

- Google Play Console account ($25 one-time)
- App icon (512×512) + feature graphic (1024×500)
- Privacy Policy URL (same as above)
- Android Studio → Build → Generate Signed App Bundle → upload `.aab`

## Updating after launch

```bash
git pull
npm run cap:sync
```

JS/UI changes go live automatically because the shell loads the hosted URL. You only need to re-submit to the stores when you change native config (icon, name, permissions, plugins, version).
