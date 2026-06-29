import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.stretchline",
  appName: "Stretchline",
  webDir: "dist",
  server: {
    // Hot-reload from the live Lovable preview while developing.
    // Remove `url` and rebuild (`bun run build && npx cap sync`) before
    // submitting to the App Store / Play Store so the bundled web assets
    // from `dist/` are used instead.
    url: "https://0c9cb1ac-c5f6-4265-b14a-e61b7762a248.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  ios: {
    contentInset: "always",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#0B0B14",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0B0B14",
    },
  },
};

export default config;
