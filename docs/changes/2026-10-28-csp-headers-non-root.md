---
status: done
---

# Security headers, strict CSP and non-root nginx

## Goal

The container sent no security headers at all and nginx ran as root. Now every response carries
a strict Content-Security-Policy and the usual hardening headers, nginx runs unprivileged, and the
build emits nothing the CSP would block.

## Plan

- [x] `nginx.conf`: security headers at server level with `always` (CSP, HSTS, nosniff,
      `X-Frame-Options DENY`, Referrer-Policy, Permissions-Policy, COOP and CORP `same-origin`)
- [x] Per-file caching moved to `map`s (`$cache_control`, `$pragma`, `$expires_header`), since
      an `add_header` inside a `location` drops every server-level one; `expires 1y` stays on
      assets, `/health` uses `default_type` so it keeps the headers too
- [x] `Dockerfile`: nginx runs as the image's `nginx` user (pid in `/tmp`, cache dir chowned)
- [x] `vite.config.ts`: webfonts load without the inline `onload` (`async: false`), the PWA
      registers through an external `registerSW.js` (`injectRegister: 'script'`), and the dev
      server / preview no longer send `cors: true`

## Decisions

- `script-src 'self'` without `'unsafe-inline'` · the main XSS defense; the two inline sources
  the build produced were removed instead of allowed · allowing inline scripts
- `frame-ancestors 'none'` and `X-Frame-Options DENY` · the template frames nothing (no MSAL
  bridge) · `'self'`
- `Vary` left to `gzip_vary` · the explicit header duplicated it
- Non-root on the official `nginx:1.31.8-alpine` · `nginxinc/nginx-unprivileged` has no 1.31.8
  tag · switching image

## Verification

- Gate: `pnpm lint && pnpm stylelint && pnpm exec tsc --noEmit && pnpm build:dev &&
pnpm test:dev --coverage --run` → 60 tests; `dist/index.html` has no inline script or handler
- Docker (`docker build --build-arg ENV=dev`): uid 101, `nginx -t` ok; `/`, a client route, a
  hashed asset, `/health` and a denied dotfile (403) all carry CSP and HSTS; HTML is
  `no-cache, no-store`, assets keep `max-age=31536000` + `public, immutable` and are gzipped
- Browser (Edge, headless) against the container: home, a client route and the links render, the
  Quicksand webfont loads, no `securitypolicyviolation`, no console error. Before the
  `async: false` fix the CSP blocked the font loader's `onload` and the font never applied
- Same, built with `SERVICE_WORKER: true` (temporary local override, reverted): `registerSW.js`
  is external, the service worker registers and activates, no CSP violation

## Not included / assumptions

- A project that calls an API on another origin, or loads third-party scripts, styles, images or
  frames, must extend the CSP (`connect-src`, `script-src`…)
