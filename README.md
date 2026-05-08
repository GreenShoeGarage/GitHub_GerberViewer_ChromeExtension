# Gerber Viewer for GitHub

A Chrome extension that renders Gerber and Excellon drill files inline on GitHub blob pages, with automatic top and bottom multi-layer composite views when sibling Gerber files are present in the same folder.

![Top side composite render of Arduino Uno](test/arduino-top.png)

## What it does

When you open a Gerber or Excellon file on GitHub at a URL like `https://github.com/{owner}/{repo}/blob/{ref}/{path}`, the extension fetches the raw file, parses it, and renders a preview panel above the raw text. The original raw text remains accessible below.

In v0.2, the panel shows three views via a tab group:

1. Layer: the single Gerber or drill file you opened, rendered on its own.
2. Top: a realistic composite of the front-side copper, soldermask, silkscreen, and drill holes, assembled from sibling files in the same folder.
3. Bottom: the equivalent composite for the back side.

Top and Bottom only enable once the sibling fetch completes and `pcb-stackup` has had a chance to build the composite. If the folder does not contain a recognizable layer set (fewer than two Gerber-shaped files), the multi-layer tabs stay disabled and the panel reports the reason in its toolbar.

v0.3 adds zoom and pan controls:

- Mouse wheel zooms in or out, anchored on the cursor position so the point under the cursor stays put.
- Click and drag to pan around the rendered board.
- Toolbar buttons: minus and plus for stepwise zoom, Fit to restore the initial view.

Zoom and pan reset to the initial fit whenever you switch between Layer, Top, and Bottom views. Each view stands on its own.

v0.4 adds an Outline toggle for messy boards. Some EDA tools mix fab markings, fiducials, and milled cutouts into the same file used for the board boundary, which can cause `pcb-stackup` to render a malformed edge with stray geometry extending past the real board. When the extension detects an outline layer, it builds a parallel render that ignores the outline file and uses the union of features for the boundary instead. The Outline button in the toolbar flips between the two. v0.4 also fixes a long-standing mis-classification of `.drd` drill files as outline layers (an upstream `whats-that-gerber` quirk), so drill holes now appear correctly on Eagle-style boards.

v0.5 adds rotation in 90 degree intervals via two toolbar buttons (counter-clockwise and clockwise). Rotation is implemented by wrapping the SVG content in an internal `<g>` element with a `rotate(deg cx cy)` transform and swapping the viewBox dimensions for 90 and 270 degree turns. This means the layout container reflows correctly to the new aspect ratio, and zoom and pan continue to work in the user's frame of reference (drag right pans right regardless of orientation). Rotation resets to zero on view switch.

v0.6.1 reverts a v0.6 attempt to render copper layers through `pcb-stackup` for a "more realistic" gold-on-FR4 look in the Layer view. The masking and side assignment that pcb-stackup applies when given a single layer caused some traces and pads to be clipped on dense ground-pour layers, so the Layer view is back to the simple `gerber-to-svg` flat-blue render that has worked correctly since v0.1. The Top and Bottom composite views still use `pcb-stackup` and remain unchanged.

The toolbar also exposes:

- Invert: flips colors for dark backgrounds.
- Download SVG: saves whichever view is currently displayed at the current zoom.
- Hide / Show: collapses the preview without affecting the raw view below.

All parsing and rendering happens client-side. No file content leaves your machine.

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

The extension is a single Manifest V3 content script. It runs at `document_idle` on `https://github.com/*/blob/*` and does the following:

1. Parses the URL to extract owner, repo, ref, file path, and parent directory.
2. Checks whether the filename plausibly identifies a Gerber or drill file using both an extension allowlist and `whats-that-gerber`.
3. Fetches the raw content from `raw.githubusercontent.com`.
4. For ambiguous extensions, sniffs the first 4 KB of content for Gerber (`%FS`, `%MO`, `%AD`, `G04`) or Excellon (`M48`) headers.
5. Renders the single layer as SVG via `gerber-to-svg` and inserts the panel above the raw text view.
6. In parallel, calls the GitHub Contents API for the parent directory, filters the listing to Gerber-shaped files, fetches each in parallel, and hands them to `pcb-stackup`. Once the stackup completes, the Top and Bottom buttons enable.

A module-scoped cache keyed by `owner/repo/ref/dir` keeps the directory listing and stackup result around across navigations, so clicking from one Gerber to another in the same folder swaps the single-layer SVG instantly without re-fetching the siblings.

A MutationObserver and listeners for `turbo:render`, `turbo:load`, and `popstate` re-trigger activation on GitHub's soft navigations.

### Project layout

```
gerber-viewer-for-github/
├── manifest.json         Manifest V3 declaration
├── src/content.js        Content script source
├── build.mjs             esbuild bundle script
├── dist/content.js       Bundled content script (generated)
├── icons/                Extension icons (16, 48, 128)
├── test/                 Smoke test, fixtures, and sample renders
├── package.json
├── README.md
└── LICENSE
```

### Dependencies

Runtime rendering is powered by tracespace v4:

- gerber-to-svg, for parsing and SVG generation of individual layers.
- pcb-stackup, for compositing top and bottom multi-layer views.
- whats-that-gerber, for filename-based layer identification.

These are bundled into `dist/content.js` along with browser polyfills for the Node stream APIs they depend on. The extension declares no remote code execution and no remotely hosted scripts.

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

This loads the bundled content script in jsdom against a synthetic GitHub blob page backed by Arduino Uno fixtures from the tracespace project, and asserts that the single-layer SVG, top composite, and bottom composite all render correctly.

## Known limitations

GitHub API rate limit. The Contents API allows 60 unauthenticated requests per hour per IP. Each unique folder you view counts as one request. If you hit the limit, the multi-layer tabs will stay disabled and the toolbar will display "GitHub API rate-limited (60/hr unauthenticated)". Authenticated requests would raise this to 5,000 per hour, but adding OAuth via `chrome.identity` is deferred to a later version.

LFS-tracked files. If a Gerber is stored via Git LFS, the raw fetch returns an LFS pointer rather than the file content. The content sniff catches this and the file is skipped, both for single-layer rendering and stackup inclusion.

Folder layout assumptions. v0.2 expects all layers of a board to live in the same directory. Boards with layers split across subdirectories (e.g. `gerbers/top/`, `gerbers/bottom/`) are not detected as a unit.

Render performance. Tracespace is reasonably fast in JS, but dense multi-layer boards can take several seconds to composite. A WASM port wrapping the Rust gerber-parser crate would be the path to making large boards feel instant.

Inner copper layers are loaded if their filenames are recognized, but only top and bottom views are exposed in the UI. Inner-layer browsing is a candidate for a future version.

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
