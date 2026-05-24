# Gerber Viewer for GitHub

A Chrome extension that renders Gerber, Excellon drill, ZIP archives, and KiCad PCB files inline on GitHub. For Gerbers, produces realistic top and bottom multi-layer composites when a full layer set is available. For KiCad `.kicad_pcb` files, embeds the KiCanvas viewer for full interactive board exploration.

<img width="1280" height="800" alt="screenshot-1-blob" src="https://github.com/user-attachments/assets/855db16f-f4e8-49c5-b264-6d38c2ca81af" />


## What it does

The extension activates on these GitHub URLs:

1. **Blob pages** for individual Gerber or drill files. Renders the single layer immediately, then asynchronously fetches sibling files in the same folder and assembles Top and Bottom composite views.
2. **Tree pages** for folders that contain a recognizable layer set. Skips the single-layer view and shows the Top and Bottom composite directly. Common case for browsing a hardware repo's `gerbers/` folder.
3. **ZIP archives** committed as files in a repository. Downloads and extracts the archive entirely in the browser using `fflate`, finds the Gerber/drill entries, and assembles the same Top and Bottom composite views.
4. **`.kicad_pcb` and `.kicad_sch` files**. Loads KiCanvas in the page and embeds the file directly. KiCanvas is a full KiCad board and schematic viewer with proper layer handling, component visibility toggles, and net highlighting.
5. **GitHub Gists** that contain Gerber files. Uses the Gist API to fetch file content inline and renders the same single-layer or composite views.
6. **Pull request "Files changed" pages**. Finds the Gerber, drill, and KiCad files the pull request touches and renders a before/after preview for each one, so a reviewer can see what a board change looks like without checking out the branch.

In all cases, the original GitHub view (raw text, file listing, archive blob, diff) remains accessible below the preview panel.

## Toolbar controls

The panel shows up to several views via a tab group:

1. **Layer**: the single Gerber or drill file you opened, rendered on its own. (Blob pages only.)
2. **Top**: a realistic composite of the front-side copper, soldermask, silkscreen, and drill holes, assembled from sibling files.
3. **In1, In2, ...**: individual inner copper layers, when the board has more than 2 copper layers. Rendered as flat-blue traces (matching Layer view semantics) since the goal here is routing inspection rather than aesthetic preview. Tabs appear only when inner layers are detected in the source files.
4. **Bottom**: the equivalent composite for the back side.

Top and Bottom enable once sibling files (or zip entries) have been fetched and `pcb-stackup` has built the composites. Inner tabs appear alongside as soon as inner copper files are identified. If the folder does not contain a recognizable layer set (fewer than two Gerber-shaped files), the multi-layer tabs stay disabled and the panel reports the reason in its toolbar.

Zoom controls anchor on the cursor (mouse wheel) and offer step buttons plus Fit. Click and drag to pan. Two rotate buttons step the view in 90 degree intervals. The Measure button enters a chain-measurement mode: each click adds a point, with running total displayed in the status bar; Backspace undoes the last point, Escape exits. The unit button next to Measure toggles between mm and mil. The Outline toggle flips between using the board outline file and using the union of features for the boundary, which helps when an EDA tool has produced a messy outline file with disconnected segments. Other toolbar buttons cover invert (dark mode, button fills blue when active), SVG download (saves the current view at the current zoom), and show/hide.

All Gerber parsing and rendering happens client-side. For `.kicad_pcb` files, the bundled KiCanvas library renders the board directly in the page; no file content leaves your machine.

## Version history

**v1.0.0** The first stable release. The headline feature is pull request support: on a pull request's "Files changed" tab, the extension now finds the Gerber, drill, and KiCad files the pull request touches and renders a before/after preview for each one, so a reviewer can see what a board change actually looks like without checking out the branch. Added files show the new board, removed files show the old one, modified files show both side by side, and renamed files are handled across their old and new paths. This release also hardens the extension for everyday use. A continuous integration workflow now runs the full test suite and a bundle-size budget check on every change, so regressions and accidental bloat are caught before they ship. The DOM insertion logic that places the preview panel on GitHub pages has been centralized and made resilient: it tries an ordered list of known page layouts and, when GitHub changes its markup in a way the extension does not recognize, it records a diagnostic event instead of failing silently, so the breakage is visible in the Copy Diagnostics output. A corpus of deliberately awkward test boards (KiCad-style layer naming, boards with no outline file, single-sided boards, uppercase file extensions, X2 attribute files, and a malformed file) now runs as part of the test suite to keep the renderer honest against the messy variety of real-world boards. The test suite stands at over one hundred checks.

**v0.9.5** Adds a board color control. Real boards come in many soldermask colors, not just green, so the composite Top and Bottom views can now be rendered in green, red, blue, black, white, yellow, or purple. A Color button in the toolbar opens a small menu of these presets; picking one re-renders the board in that color. Dark presets (black) automatically pair with white silkscreen and light presets (white, yellow) with black silkscreen, so the legend stays readable. A matching "Default board color" option in the settings page lets you pick the color the extension uses on first render, so if most of your boards are a particular color you can set it once. The color only affects the composite views, where the soldermask is rendered; the raw single-layer view and inner copper layers are unaffected. Switching color re-runs the rendering pipeline on the already-loaded layer data, so it takes a moment but never re-downloads anything.

**v0.9.4** Reworks the measurement tool and the zoom behavior in response to user feedback. The measurement tool is now a two-click action: click a start point, click an end point, and the measurement completes and locks in place. It no longer auto-starts a new segment after the second click, which several people found surprising. To measure a multi-segment path, hold Shift while clicking to extend the current measurement into a chain; a plain click after a completed measurement starts fresh instead. Backspace still removes the last point and Escape exits. The zoom behavior over the board no longer hijacks the page scroll. Plain mouse-wheel and trackpad two-finger scrolling now pass through to the page so you can scroll past the board normally. To zoom, pinch on a trackpad or hold Cmd (Ctrl on Windows and Linux) while scrolling. The first time you scroll over the board without a zoom modifier, a brief hint reminds you of the key. Zoom steps now scale with scroll intensity so pinch zooming feels smooth.

**v0.9.3** Adds Excel BOM support to complement the v0.9.2 CSV BOM detection. When a folder, ZIP archive, or Gist contains a `bom.xlsx` or `bom.xls` file, the extension now parses and displays it in the same sortable table panel used for CSV BOMs. Excel parsing is delegated to a vendored, lazy-loaded build of SheetJS (Apache 2.0, around 245 KB) which is fetched from the extension's own package the first time an Excel BOM is opened, and never paid for on pages without one. Multi-sheet workbooks gain a sheet-picker dropdown that re-renders the table when the user switches sheets; if a sheet named "BOM" (or "Bill of Materials") exists, it is selected by default. Numeric and date cells are coerced to their display values so a date column reads as "2024-03-15" rather than as Excel's serial number 45366. No new permissions are required; SheetJS is bundled inside the extension and runs entirely in the browser, in keeping with the no-remote-code policy.

**v0.9.2** A feature pass that rounds out KiCad coverage and adds a few interaction improvements. KiCad schematic files (`.kicad_sch`) now render alongside `.kicad_pcb` via the same KiCanvas embed, with the title bar and metadata updated to differentiate boards from schematics. The extension now also activates on GitHub Gists (both named and anonymous) when the Gist contains Gerber-shaped files; the Gist API is used to fetch file content inline, so no extra requests are needed beyond the one API call. Keyboard shortcuts are wired in for the most common actions: `Z` for fit, `R` and `Shift+R` for rotation, `M` for measure, `U` for unit toggle, `L`/`T`/`B` for view switching, `O` for outline, `I` for invert, `H` for hide, and `?` for a help overlay that lists every shortcut and explains the measurement tool. Bill-of-materials extraction recognizes `bom.csv` files (and similar names) in folders, ZIP archives, and Gist file sets; the parsed table mounts below the Gerber panel with sortable columns and a Copy-as-TSV button. Finally, the stackup views now have a Layers button that opens a popover for toggling silkscreen, soldermask, solderpaste, copper, substrate, and outline visibility independently; the state persists across Top/Bottom switches so a design review can hide silkscreen once and read traces freely.

**v0.9.1** Updates project URLs to point at the public source repository at `github.com/GreenShoeGarage/GitHub_GerberViewer_ChromeExtension`, sets `homepage_url` in the manifest, and updates the in-page Green Shoe Garage credit link to match. No code changes affecting behavior.

**v0.9.0** A robustness pass. Introduces structured error handling: every failure mode now produces a categorized error object (network, parse, format-too-old, capability, detection, render) with a user-facing summary, a detail line, an actionable suggestion, and a "View raw file" fallback link where applicable. A 404 reports "File not found" with a hint about repository visibility or rate limits, instead of "Fetch failed: 404". A KiCad-too-old file points at the option to open it locally. A ZIP with too few candidates explains what the extension was looking for. The new error UI replaces the old single-line red text with a heading, body, suggestion, and link. Also adds a settings page (open via the Extensions menu, "Options") with toggles for default measurement unit, default theme (light or dark), default outline mode, default panel collapsed state, and an optional cap on GitHub API calls per page. Settings persist across sessions via `chrome.storage.local`. Finally, a "Copy diagnostics" button on the settings page writes a JSON blob to the clipboard containing the extension version, the browser's user-agent, and the most recent 50 events (activations, file loads, errors). This makes bug reports much easier without ever touching the network. The diagnostic blob is purely local and is built from a session-scoped event log stored in `chrome.storage.session`.

**v0.8.1** Adds two refinements to v0.8. First, a graceful WebGL2 fallback for `.kicad_pcb` files: the handler now probes `canvas.getContext('webgl2')` before loading KiCanvas, and if the context is unavailable (kiosk modes, hardware-acceleration disabled, missing GPU drivers, enterprise policy restrictions) it shows an informative panel with the file's parsed metadata and a link to download the raw `.kicad_pcb` for opening in KiCad locally, instead of letting KiCanvas fail silently inside its embed. Second, inner copper layer browsing for multi-layer Gerber sets: when the directory or archive contains files identified as inner copper (`In1_Cu`, `In2_Cu` for KiCad, `.g1`, `.g2` for Altium, `.in1`, `.in2` for some tools), the panel adds tabs between Top and Bottom for each one. Inner layers render via `gerber-to-svg` in flat blue, matching the existing Layer tab's semantics, since the goal is routing inspection rather than aesthetic preview.

**v0.8.0** Adds KiCad `.kicad_pcb` file support via a vendored copy of the KiCanvas library. KiCanvas is shipped as a `web_accessible_resource` and injected into the page's main world via a loader stub, so no remote code execution is involved. The blob handler dispatches to a stripped-down panel when the file is a `.kicad_pcb`, since KiCanvas owns its own canvas, layer selection, and zoom/pan/measurement controls. Also adds Gerber X2/X3 attribute parsing: when a Gerber file declares its role via `%TF.FileFunction*%`, `%TF.GenerationSoftware*%`, etc., the panel header shows that file-declared role instead of a filename-based guess. And extends measurement to chain mode: each click after the first extends the chain, with per-segment distances and a running total shown in the status bar. Backspace undoes the last point.

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
│   │   ├── github.js          URL parsing, raw fetch, Contents API, Gist API
│   │   ├── render.js          gerber-to-svg + pcb-stackup pipeline
│   │   ├── panel.js           Toolbar/stage UI, zoom/pan/rotate
│   │   ├── measure.js         Chain dimension measurement tool
│   │   ├── x2attr.js          Gerber X2/X3 attribute parser
│   │   ├── errors.js          Structured error categories
│   │   ├── eventlog.js        In-memory event log for diagnostics
│   │   ├── settings.js        User preference loader (chrome.storage)
│   │   ├── shortcuts.js       Keyboard shortcuts and help overlay
│   │   ├── colors.js          Soldermask color presets
│   │   ├── insertion.js       Resilient panel insertion-target finder
│   │   ├── bom.js             CSV and XLSX BOM parsers
│   │   ├── bom-panel.js       Sortable BOM table UI with sheet picker
│   │   ├── bom-mount.js       Handler-agnostic BOM mount orchestrator
│   │   ├── xlsx-loader.js     Lazy loader for the SheetJS bundle
│   │   ├── layer-toggles.js   Stackup layer visibility controller
│   │   ├── kicad-panel.js     Stripped-down panel for KiCanvas embeds
│   │   └── kicanvas-loader.js Injects KiCanvas into the page main world
│   └── handlers/
│       ├── blob.js            Single-file Gerber/drill handler
│       ├── tree.js            Folder handler
│       ├── zip.js             ZIP archive handler
│       ├── kicad.js           .kicad_pcb and .kicad_sch handler (KiCanvas)
│       ├── gist.js            GitHub Gist handler
│       └── pull.js            Pull request before/after diff handler
├── options/
│   ├── options.html           Settings page rendered in its own tab
│   ├── options.css
│   └── options.js
├── vendor/
│   ├── kicanvas/              KiCanvas bundle (MIT-licensed, vendored)
│   │   ├── kicanvas.js
│   │   └── loader-stub.js
│   └── sheetjs/               SheetJS mini build (Apache 2.0, vendored)
│       ├── xlsx.mini.min.js
│       └── LICENSE
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

KiCad `.kicad_pcb` and `.kicad_sch` rendering uses KiCanvas (MIT-licensed), vendored into `vendor/kicanvas/`. The bundle is declared as a `web_accessible_resource` and loaded into the page's main world via a small loader stub, so the `<kicanvas-embed>` custom element registers in the document's main realm where it can render via WebGL.

Excel BOM parsing (`.xlsx` and `.xls`) uses the SheetJS Community Edition (Apache 2.0), vendored into `vendor/sheetjs/`. SheetJS is lazy-loaded: the 245 KB bundle is only fetched and parsed when an Excel BOM is actually opened, so pages without one pay no cost. Loading happens through `chrome.runtime.getURL` and an eval inside a Function closure that contains the library's global to our content-script realm rather than the page's.

All six are bundled into the extension along with browser polyfills for the Node stream APIs they depend on. The extension declares no remote code execution and no remotely hosted scripts.

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

This loads the bundled content script in jsdom and runs a series of passes covering blob pages (single-layer and multi-layer), tree folders, ZIP archives, KiCad PCB and schematic embeds, GitHub Gists, BOM extraction (CSV and XLSX), keyboard shortcuts, layer visibility toggles, soldermask color presets, pull request before/after diffs, and a corpus of awkward real-world boards. Every pass asserts that panels mount and views render correctly.

To run the full continuous-integration sequence locally (build, test, and bundle-size budget):

```
npm run ci
```

The same sequence runs automatically on every push and pull request via GitHub Actions (see `.github/workflows/ci.yml`). The bundle-size budget in `scripts/check-bundle-size.mjs` fails the build if the content script or a vendored library grows past its budget, so any size increase is a deliberate, reviewable change.

The real-world test corpus is generated by `node test/fixtures/generate-corpus.mjs`, which writes a set of edge-case boards (KiCad layer naming, no outline file, single-sided, uppercase extensions, X2 attributes, and a malformed file) under `test/fixtures/corpus/`.

## Known limitations

GitHub API rate limit. The Contents API allows 60 unauthenticated requests per hour per IP. Each unique folder you view counts as one request, and tree-view detection now means folder visits also count. If you hit the limit, the multi-layer tabs will stay disabled and the toolbar will display "GitHub API rate-limited (60/hr unauthenticated)". Authenticated requests would raise this to 5,000 per hour, but adding OAuth via `chrome.identity` is deferred to a later version.

LFS-tracked files. If a Gerber is stored via Git LFS, the raw fetch returns an LFS pointer rather than the file content. The content sniff catches this and the file is skipped.

Folder layout assumptions. The extension expects all layers of a board to live in the same directory (or a single nested folder inside a zip). Boards with layers split across subdirectories (e.g. `gerbers/top/`, `gerbers/bottom/`) are not detected as a unit.

Render performance. Tracespace is reasonably fast in JS, but dense multi-layer boards can take several seconds to composite. A WASM port wrapping the Rust gerber-parser crate would be the path to making large boards feel instant.

Inner copper layers are exposed as additional tabs between Top and Bottom. They render via `gerber-to-svg` in flat blue rather than going through the full pcb-stackup compositing pipeline, so they show traces against the checkerboard background instead of on simulated FR4. This matches the Layer tab's semantics and is more useful for routing inspection.

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
