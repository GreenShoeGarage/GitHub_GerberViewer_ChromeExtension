# Gerber Viewer for GitHub

A Chrome extension that renders Gerber and Excellon drill files inline on GitHub blob pages, folder views, and ZIP archives, with realistic top and bottom multi-layer composite views when a full layer set is available.

<img width="1000" height="778" alt="measure-preview" src="https://github.com/user-attachments/assets/05e39d30-e07f-4fa5-a77f-da40c6bb2e41" />



## https://chromewebstore.google.com/detail/kjempphffigplmkbpjamikbfgpmdfbfn

## What it does

The extension activates on three kinds of GitHub URL:

1. **Blob pages** for individual Gerber or drill files. Renders the single layer immediately, then asynchronously fetches sibling files in the same folder and assembles Top and Bottom composite views.
2. **Tree pages** for folders that contain a recognizable layer set. Skips the single-layer view and shows the Top and Bottom composite directly. This is the common case for browsing a hardware repo's `gerbers/` folder.
3. **ZIP archives** committed as files in a repository (very common for hardware repos that don't commit individual layer files). Downloads and extracts the archive entirely in the browser, finds the Gerber/drill entries, and assembles the same Top and Bottom composite views.

In all three cases, the original GitHub view (raw text, file listing, archive blob) remains accessible below the preview panel.

## Toolbar controls

The panel shows up to three views via a tab group:

1. **Layer**: the single Gerber or drill file you opened, rendered on its own. (Blob pages only.)
2. **Top**: a realistic composite of the front-side copper, soldermask, silkscreen, and drill holes, assembled from sibling files.
3. **Bottom**: the equivalent composite for the back side.

Top and Bottom enable once sibling files (or zip entries) have been fetched and `pcb-stackup` has built the composites. If the folder does not contain a recognizable layer set (fewer than two Gerber-shaped files), the multi-layer tabs stay disabled and the panel reports the reason in its toolbar.

Zoom controls anchor on the cursor (mouse wheel) and offer step buttons plus Fit. Click and drag to pan. Two rotate buttons step the view in 90 degree intervals. The Measure button enters a click-two-points mode that reports the distance in mm or mil (toggleable via the unit button next to it). The Outline toggle flips between using the board outline file and using the union of features for the boundary, which helps when an EDA tool has produced a messy outline file with disconnected segments. Other toolbar buttons cover invert (dark mode), SVG download (saves the current view at the current zoom), and show/hide.

All parsing and rendering happens client-side. No file content leaves your machine.

## Version history

**v0.7.2** Fixes a measurement-tool bug where markers could land at the wrong position when the board was rotated. The empty overlay group was persisting across deactivations, and a subsequent rotation would sweep it into the rotation transform; on the next activation, markers got drawn at coordinates that were then visually rotated, putting them away from the click point. The fix is to remove the overlay element entirely on deactivate, and to defensively re-parent it to the SVG root if `ensureOverlay` ever finds it inside a rotation wrapper.

**v0.7.1** Adds a dimension measurement tool for design reviews. Click two points to measure the distance between them, with a unit toggle for mm and mil. The tool reads the SVG's physical-unit calibration from `width`/`height` attributes (in inches or mm, whichever the source file declares) and converts viewBox-space click coordinates to physical units. Markers and connecting lines are drawn into the SVG as an overlay group, so they track zoom and pan correctly. Measurement state clears on view switch and rotation since those replace or rewrite the SVG.

**v0.7** Tree-view detection for folder pages and ZIP archive support on blob pages. Both reuse the existing `pcb-stackup` rendering pipeline and the same panel UI, with the Layer tab disabled when there is no specific file to show. v0.7 also refactors the previously-monolithic content script into focused modules (`core/detect`, `core/render`, `core/github`, `core/panel`, plus three handlers under `handlers/`). Swapped the JSZip dependency for `fflate`, which is smaller, faster, and uses no streams.

**v0.6.1** Reverted a v0.6 attempt to render copper layers through `pcb-stackup` for a "more realistic" gold-on-FR4 look in the Layer view. The masking and side assignment that pcb-stackup applies when given a single layer caused some traces and pads to be clipped on dense ground-pour layers, so the Layer view is back to the simple `gerber-to-svg` flat-blue render that has worked correctly since v0.1.

**v0.5** 90 degree rotation via two toolbar buttons. Rotation wraps the SVG content in an internal `<g>` with a `rotate(deg cx cy)` transform and swaps the viewBox dimensions for 90 and 270 degree turns, so the layout container reflows correctly and zoom/pan continue to work in the user's frame of reference (drag right pans right regardless of orientation). Rotation resets to zero on view switch.

**v0.4** Outline toggle for boards whose edge files are messy. Some EDA tools mix fab markings, fiducials, and milled cutouts into the same file used for the board boundary, which can cause `pcb-stackup` to render a malformed edge with stray geometry extending past the real board. v0.4 also fixed a long-standing mis-classification of `.drd` drill files as outline layers (an upstream `whats-that-gerber` quirk), so drill holes now appear correctly on Eagle-style boards.

**v0.3** Zoom and pan: mouse wheel zoom anchored on the cursor, click-drag pan, plus minus/plus/Fit toolbar buttons. Implemented via SVG viewBox manipulation so renders stay vector-crisp at any zoom level.

**v0.2** Multi-layer Top/Bottom composite via `pcb-stackup`, with sibling fetch through the GitHub Contents API.

**v0.1** Single-file Gerber rendering on GitHub blob pages via tracespace v4 (`gerber-to-svg`). Manifest V3 content script bundled with esbuild.

## Supported files

Detection is by extension first, then by content sniffing for ambiguous extensions like `.txt` and `.nc`. Files matched by extension but failing the content sniff are skipped silently, so generic text files are not falsely flagged.

Recognized Gerber layer extensions: gbr, gbl, gtl, gbs, gts, gbo, gto, gbp, gtp, gko, gm1, gm2, gm3, gml, gpb, gpt, cmp, sol, plc, pls, stc, sts, gd1, gg1, gp1, gp2, gp3, gp4.

Recognized Excellon drill extensions: drl, drd, xln, txt, tap, nc.

The extension auto-detects which side (top, bottom, inner) and what type (copper, soldermask, silkscreen, paste, drill, outline) each file represents from its filename, using the `whats-that-gerber` library. This handles Eagle, KiCad, Altium, and Protel naming conventions.

## Install

The extension is not yet published to the Chrome Web Store. Install it as an unpacked extension:

1. Download or clone this folder.
2. If working from a source checkout, run `npm install` and then `npm run build` to produce `dist/content.js`. Release zips ship with `dist/content.js` already built.
3. Open Chrome and navigate to `chrome://extensions`.
4. Enable Developer Mode using the toggle at the top right.
5. Click "Load unpacked" and select the project folder.
6. Visit any GitHub blob page pointing at a Gerber or Excellon file. The preview should appear automatically.

## Architecture

The extension is a Manifest V3 content script. It runs at `document_idle` on `https://github.com/*/blob/*`, `https://github.com/*/tree/*`, and `https://github.com/*` (matching repo roots), and dispatches to one of three handlers based on the URL:

**Blob handler**: when the file is a Gerber/drill file
1. Parse the URL into owner, repo, ref, file path, parent directory.
2. Fetch the raw content from `raw.githubusercontent.com`.
3. For ambiguous extensions (`.txt`, `.nc`, `.tap`), sniff the first 4 KB for Gerber (`%FS`, `%MO`, `%AD`, `G04`) or Excellon (`M48`) headers. Reject if neither matches.
4. Render the single layer as SVG via `gerber-to-svg` and mount the panel.
5. In parallel, call the GitHub Contents API for the parent directory, filter to Gerber-shaped files, fetch each in parallel, and hand them to `pcb-stackup`. Once the stackup completes, the Top and Bottom buttons enable.

**Tree handler**: when the URL is a folder view
1. Parse the URL. If no ref is in the path (repo root case), resolve the default branch via the API.
2. Call the Contents API for the folder. If three or more entries look like Gerber/drill files, mount the panel.
3. Fetch each candidate in parallel, content-sniff to filter out non-Gerber files (LFS pointers, README artifacts, etc.), and build the composite views.

**Zip handler**: when the file is a `.zip` on a blob page
1. Fetch the archive bytes from `raw.githubusercontent.com`.
2. Extract entries in-memory using `fflate`'s synchronous `unzipSync`.
3. Strip a single common prefix folder if all entries share one (so `gerbers/main.GTL` is treated as `main.GTL`).
4. Filter, content-sniff, and build composites the same way as the tree handler.

A module-scoped cache keyed by location (folder URL or zip URL) keeps fetched data and built stackups around across navigations, so revisiting the same folder is instant.

A MutationObserver plus listeners for `turbo:render`, `turbo:load`, and `popstate` re-trigger activation on GitHub's soft navigations.

### Project layout

```
gerber-viewer-for-github/
├── manifest.json              Manifest V3 declaration
├── src/
│   ├── content.js             Entry point: dispatch to handler by URL
│   ├── core/
│   │   ├── detect.js          Filename + content-sniff helpers
│   │   ├── github.js          URL parsing, raw fetch, Contents API
│   │   ├── render.js          gerber-to-svg + pcb-stackup pipeline
│   │   ├── panel.js           Toolbar/stage UI, zoom/pan/rotate
│   │   └── measure.js         Two-click dimension measurement tool
│   └── handlers/
│       ├── blob.js            Single-file handler
│       ├── tree.js            Folder handler
│       └── zip.js             ZIP archive handler
├── build.mjs                  esbuild bundle script
├── dist/content.js            Bundled content script (generated)
├── icons/                     Extension icons (16, 48, 128)
├── test/                      Smoke test, fixtures, sample renders
├── package.json
├── README.md
└── LICENSE
```

### Dependencies

Runtime rendering is powered by tracespace v4:

- gerber-to-svg, for parsing and SVG generation of individual layers.
- pcb-stackup, for compositing top and bottom multi-layer views.
- whats-that-gerber, for filename-based layer identification.

ZIP archive support uses fflate, a small synchronous deflate/inflate library.

All four are bundled into `dist/content.js` along with browser polyfills for the Node stream APIs they depend on. The extension declares no remote code execution and no remotely hosted scripts.

## Build from source

```
npm install
npm run build
```

The build is a single esbuild pass producing `dist/content.js`. After rebuilding, reload the extension in `chrome://extensions`.

To run the smoke test:

```
npm test
```

This loads the bundled content script in jsdom and runs four passes: blob page with Arduino Uno fixtures (single-layer + multi-layer), blob page with PCB-Workshop fixtures (Outline toggle + rotation + GSG link), tree page (folder detection), and ZIP archive (in-memory zip extraction). All four assert that panels mount and views render correctly.

## Known limitations

GitHub API rate limit. The Contents API allows 60 unauthenticated requests per hour per IP. Each unique folder you view counts as one request, and tree-view detection now means folder visits also count. If you hit the limit, the multi-layer tabs will stay disabled and the toolbar will display "GitHub API rate-limited (60/hr unauthenticated)". Authenticated requests would raise this to 5,000 per hour, but adding OAuth via `chrome.identity` is deferred to a later version.

LFS-tracked files. If a Gerber is stored via Git LFS, the raw fetch returns an LFS pointer rather than the file content. The content sniff catches this and the file is skipped.

Folder layout assumptions. The extension expects all layers of a board to live in the same directory (or a single nested folder inside a zip). Boards with layers split across subdirectories (e.g. `gerbers/top/`, `gerbers/bottom/`) are not detected as a unit.

Render performance. Tracespace is reasonably fast in JS, but dense multi-layer boards can take several seconds to composite. A WASM port wrapping the Rust gerber-parser crate would be the path to making large boards feel instant.

Inner copper layers are loaded if their filenames are recognized, but only top and bottom views are exposed in the UI. Inner-layer browsing is a candidate for a future version.

ZIP archive size. Archives are decompressed entirely in memory. Multi-megabyte zips work fine, but very large archives may cause noticeable memory pressure.

## Troubleshooting

If the preview does not appear on a Gerber file you know is valid, open Chrome DevTools and check the console for messages prefixed with `[gerber-gh]`. The most common causes:

- GitHub has shifted its blob-page DOM. The script has multiple insertion fallbacks but the React-driven code view is a moving target. File an issue with the URL and a screenshot.
- The file is LFS-tracked. The fetched content is a short text pointer rather than Gerber data.
- An aperture macro or X3 attribute trips up tracespace v4's parser. Check the console for the parse error.

For multi-layer issues specifically:

- "GitHub API rate-limited" in the toolbar means the Contents API quota is exhausted. Wait an hour or sign in via a browser session that has a valid auth cookie (private repos require this anyway).
- "fewer than 2 Gerber-shaped files in folder" means the directory listing came back but the filename heuristics matched fewer than two files. Check the directory contents.
- "fewer than 2 layers passed content sniff" means files matched by name but their content did not look like Gerber or Excellon. LFS pointers are the usual culprit.

## License

GPL-3.0
