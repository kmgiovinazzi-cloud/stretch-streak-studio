#!/usr/bin/env node
/**
 * Capacitor build helper.
 *
 * Stretchline is a TanStack Start SSR app (server functions, Supabase auth,
 * AI gateway) — it cannot run as a fully static bundle inside a Capacitor
 * WebView. The Capacitor shell instead loads the hosted web app via
 * `server.url` in capacitor.config.ts.
 *
 * However `npx cap sync` (and Xcode / Android Studio builds) require
 * `webDir` to exist with at least an index.html. This script generates
 * a minimal `dist/` shell that:
 *   1. Satisfies Capacitor's sync requirement.
 *   2. Acts as an offline fallback that redirects to the hosted URL when
 *      the device is online.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const HOSTED_URL = process.env.CAP_HOSTED_URL || "https://stretch-streak-studio.lovable.app";
const distDir = resolve(process.cwd(), "dist");

mkdirSync(distDir, { recursive: true });

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta http-equiv="refresh" content="0; url=${HOSTED_URL}" />
    <title>Stretchline</title>
    <style>
      html, body { margin: 0; height: 100%; background: #0B0B14; color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; }
      .wrap { display: flex; align-items: center; justify-content: center; height: 100%; }
      a { color: #a78bfa; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div style="text-align:center">
        <h1>Stretchline</h1>
        <p>Loading… If nothing happens, <a href="${HOSTED_URL}">tap here</a>.</p>
      </div>
    </div>
    <script>window.location.replace(${JSON.stringify(HOSTED_URL)});</script>
  </body>
</html>
`;

writeFileSync(resolve(distDir, "index.html"), html);
console.log(`[cap] Wrote dist/index.html (hosted url: ${HOSTED_URL})`);
