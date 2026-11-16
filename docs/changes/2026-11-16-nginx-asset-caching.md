---
status: done # planned | in-progress | done | dropped
---

# nginx caches what has a hash in its name, and only that

## Goal

A browser keeps the built assets (a hash in their name) for good, and asks again for every file
whose name never changes. Before, the rule went by extension: `ui-theme-init.js`, `sw.js` and the
icons were kept for a year as if they could not change, and so was the 404 of a chunk that is gone.

## Plan

- [x] `Cache-Control` by where the file is (`/assets/`) and only when it was served
- [x] A build file that is missing answers 404, never the page
- [x] A charset for text, and the type of the web manifest

Checked in a container: `nginx -t` and the headers of each kind of file.

## Decisions

- `immutable` for `/assets/` only, with `max-age=31536000` · the build names those files after
  their content, and no other · the rule by extension, which also covered the files of `public/`:
  a new `ui-theme-init.js` or service worker would never reach a browser that had the old one.
- Only on a 200, through a `map` on `$status` · the 404 of a chunk a deploy replaced, kept for a
  year, breaks the app for that browser · an `add_header` in a `location` of its own would drop
  the security headers of the `server` block.
- The files without a hash get no `Cache-Control` · the browser asks again with their `ETag`
  and gets a 304 · an explicit `no-cache` for them: not needed so far.
- A missing `/assets/*` or root `*.js`, `*.css`, `*.map`, `*.webmanifest` answers 404 · without
  the location by extension it would have fallen to the SPA route and got `index.html`: HTML read
  as a script. The location that denies dotfiles moved before it (the first regex wins).
- `charset utf-8` for the text types and `application/manifest+json` for the manifest · the build
  writes UTF-8 and nginx only said so for HTML; its `mime.types` has no entry for the manifest.
- `gzip` unchanged · it was already at level 6 from 1000 bytes.

## Verification

- `docker build --build-arg ENV=dev` built the image; in the container `nginx -t` is successful.
- Headers read with `curl` from the running container:
    - `/`, `/detail/123`, `/index.html` → 200, `no-cache, no-store, must-revalidate`;
    - `/assets/index-*.js`, `/assets/index-*.css`, a `/assets/*.woff2` → 200,
      `public, max-age=31536000, immutable`; the script and the style with `charset=utf-8`;
    - `/assets/missing-abc123.js`, `/missing.js`, `/missing.css.map` → 404, no `Cache-Control`;
    - `/ui-theme-init.js`, `/icons/favicon.svg`, `/icons/favicon.ico`, `/robots.txt` → 200, no
      `Cache-Control`; `/ui-theme-init.js` asked again with its `ETag` → 304;
    - `/site.webmanifest` → `application/manifest+json; charset=utf-8`;
    - `/health` → 200; `/.env` and `/assets/.hidden` → 403;
    - the CSP and the other security headers are on every one of them, the 404 and 403 included.
- The container and the image were removed afterwards.

## Not included / assumptions

- Serving under a base path: this `nginx.conf` expects the app at the root.
- Pre-compressed files (`gzip_static` is on, and the build writes none) and brotli.
- A service worker file was not in the image checked (`SERVICE_WORKER` is off in that build): by
  the rules above `sw.js` and `registerSW.js` get no `Cache-Control`, as `ui-theme-init.js`.
