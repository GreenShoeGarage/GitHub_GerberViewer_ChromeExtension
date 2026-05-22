// Smoke test: load the bundled content script in jsdom and verify both
// the single-layer fast path and the multi-layer top/bottom flow.

import fs from 'node:fs'
import path from 'node:path'
import jsdomPkg from 'jsdom'
const { JSDOM } = jsdomPkg

const FIXTURE_DIR = path.join('test', 'fixtures', 'arduino-uno')
const bundle = fs.readFileSync(path.join('dist', 'content.js'), 'utf8')

// Build an in-memory map of "rawUrl -> content" for the Arduino Uno fixtures
const fixtureFiles = fs.readdirSync(FIXTURE_DIR)
const RAW_BASE = 'https://raw.githubusercontent.com/example/repo/main/boards/'
const rawContent = new Map()
for (const f of fixtureFiles) {
  const text = fs.readFileSync(path.join(FIXTURE_DIR, f), 'utf8')
  rawContent.set(RAW_BASE + f, text)
}

// Build the synthetic Contents API response for /boards/
const dirListing = fixtureFiles.map((name) => ({
  name,
  type: 'file',
  size: fs.statSync(path.join(FIXTURE_DIR, name)).size,
  download_url: RAW_BASE + name,
}))

const html = `<!doctype html><html><head><title>test</title></head>
<body>
  <main>
    <div class="repository-content">
      <div class="Box mt-3">
        <pre>raw text would be here</pre>
      </div>
    </div>
  </main>
</body></html>`

const dom = new JSDOM(html, {
  url: 'https://github.com/example/repo/blob/main/boards/arduino-uno.cmp',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
})

dom.window.fetch = (url) => {
  if (rawContent.has(url)) {
    return Promise.resolve({
      ok: true,
      status: 200,
      text: () => Promise.resolve(rawContent.get(url)),
    })
  }
  if (url.startsWith('https://api.github.com/repos/example/repo/contents/boards')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(dirListing),
    })
  }
  return Promise.reject(new Error('unexpected fetch ' + url))
}

dom.window.eval(bundle)

// Wait long enough for the multi-layer flow to complete. The Arduino Uno
// fixtures are non-trivial: parsing 6 Gerbers + 1 drill takes a few seconds.
await new Promise((r) => setTimeout(r, 15000))

const panel = dom.window.document.querySelector('[data-ghgv="1"]')
if (!panel) {
  console.error('FAIL: no preview panel mounted')
  console.error(dom.window.document.body.innerHTML.slice(0, 800))
  process.exit(1)
}

const stage = panel.querySelector('.ghgv-stage')
const layerSvg = stage?.querySelector('svg')
if (!layerSvg) {
  console.error('FAIL: single-layer SVG missing')
  console.error(stage?.innerHTML?.slice(0, 800))
  process.exit(1)
}
console.log('PASS single-layer: SVG length =', layerSvg.outerHTML.length)

// Check that Top and Bottom buttons enabled (means stackup completed)
const buttons = Array.from(panel.querySelectorAll('button'))
const topBtn = buttons.find((b) => b.dataset.view === 'top')
const bottomBtn = buttons.find((b) => b.dataset.view === 'bottom')
if (!topBtn || !bottomBtn) {
  console.error('FAIL: top/bottom buttons not present')
  process.exit(1)
}

const status = panel.querySelector('.ghgv-status')?.textContent
console.log('Status text after wait:', JSON.stringify(status))

if (topBtn.disabled || bottomBtn.disabled) {
  console.error('FAIL: top/bottom buttons still disabled after wait')
  console.error('status:', status)
  process.exit(1)
}

// Click the Top button and confirm the stage updates
topBtn.click()
await new Promise((r) => setTimeout(r, 100))
const topSvg = stage.querySelector('svg')
if (!topSvg || topSvg.outerHTML === layerSvg.outerHTML) {
  console.error('FAIL: clicking Top did not change stage SVG')
  process.exit(1)
}
console.log('PASS top view: SVG length =', topSvg.outerHTML.length)

bottomBtn.click()
await new Promise((r) => setTimeout(r, 100))
const bottomSvg = stage.querySelector('svg')
if (!bottomSvg || bottomSvg.outerHTML === topSvg.outerHTML) {
  console.error('FAIL: clicking Bottom did not change stage SVG')
  process.exit(1)
}
console.log('PASS bottom view: SVG length =', bottomSvg.outerHTML.length)

// --- Zoom tests ---
// Switch back to single layer for zoom tests since it has the simplest viewBox
const layerBtn = buttons.find((b) => b.dataset.view === 'layer')
layerBtn.click()
await new Promise((r) => setTimeout(r, 100))

const zoomInBtn = buttons.find((b) => b.title === 'Zoom in')
const zoomOutBtn = buttons.find((b) => b.title === 'Zoom out')
const fitBtn = buttons.find((b) => b.title === 'Reset zoom and pan')

if (!zoomInBtn || !zoomOutBtn || !fitBtn) {
  console.error('FAIL: zoom controls missing')
  process.exit(1)
}

const svgEl = stage.querySelector('svg')
const initialVb = svgEl.getAttribute('viewBox')
if (!initialVb) {
  console.error('FAIL: SVG has no viewBox after zoom setup')
  process.exit(1)
}
const [, , initialW] = initialVb.split(/\s+/).map(Number)

// Click zoom in - viewBox width should decrease
zoomInBtn.click()
const afterZoomInVb = svgEl.getAttribute('viewBox')
const [, , afterZoomInW] = afterZoomInVb.split(/\s+/).map(Number)
if (!(afterZoomInW < initialW)) {
  console.error('FAIL: viewBox width did not decrease on zoom in', { initialW, afterZoomInW })
  process.exit(1)
}
console.log('PASS zoom in: viewBox width', initialW, '->', afterZoomInW)

// Click zoom out twice - viewBox width should now exceed initial
zoomOutBtn.click()
zoomOutBtn.click()
const afterZoomOutVb = svgEl.getAttribute('viewBox')
const [, , afterZoomOutW] = afterZoomOutVb.split(/\s+/).map(Number)
if (!(afterZoomOutW > initialW)) {
  console.error('FAIL: viewBox width did not exceed initial after zoom out', { initialW, afterZoomOutW })
  process.exit(1)
}
console.log('PASS zoom out: viewBox width', afterZoomInW, '->', afterZoomOutW)

// Click Fit - viewBox should match initial
fitBtn.click()
const afterFitVb = svgEl.getAttribute('viewBox')
if (afterFitVb !== initialVb) {
  console.error('FAIL: Fit did not restore initial viewBox', { initialVb, afterFitVb })
  process.exit(1)
}
console.log('PASS fit: viewBox restored to', afterFitVb)

console.log('All checks passed for arduino-uno fixtures.')

// =============================================================================
// Second pass: SurreyEARS PCB-Workshop fixtures, which have a messy outline.
// Verify that the Outline toggle is enabled (both variants present) and that
// toggling it produces different SVG output for the top view.
// =============================================================================

const PCBW_DIR = path.join('test', 'fixtures', 'pcb-workshop')
const pcbwFiles = fs.readdirSync(PCBW_DIR)
const PCBW_BASE = 'https://raw.githubusercontent.com/example/pcbw/master/'
const pcbwContent = new Map()
for (const f of pcbwFiles) {
  pcbwContent.set(PCBW_BASE + f, fs.readFileSync(path.join(PCBW_DIR, f), 'utf8'))
}
const pcbwListing = pcbwFiles.map((name) => ({
  name,
  type: 'file',
  size: fs.statSync(path.join(PCBW_DIR, name)).size,
  download_url: PCBW_BASE + name,
}))

const dom2 = new JSDOM(html, {
  url: 'https://github.com/example/pcbw/blob/master/main.GTL',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
})
dom2.window.fetch = (url) => {
  if (pcbwContent.has(url)) {
    return Promise.resolve({
      ok: true, status: 200,
      text: () => Promise.resolve(pcbwContent.get(url)),
    })
  }
  // Match both /contents and /contents/<dir>, with or without ?ref=
  if (/^https:\/\/api\.github\.com\/repos\/example\/pcbw\/contents/.test(url)) {
    return Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve(pcbwListing),
    })
  }
  return Promise.reject(new Error('unexpected fetch ' + url))
}
dom2.window.eval(bundle)
await new Promise((r) => setTimeout(r, 15000))

const panel2 = dom2.window.document.querySelector('[data-ghgv="1"]')
if (!panel2) {
  console.error('FAIL pcbw: no panel mounted')
  process.exit(1)
}
const buttons2 = Array.from(panel2.querySelectorAll('button'))
const outlineBtn = buttons2.find((b) => b.textContent === 'Outline')
const topBtn2 = buttons2.find((b) => b.dataset.view === 'top')

if (!outlineBtn) {
  console.error('FAIL pcbw: Outline button missing')
  process.exit(1)
}
if (outlineBtn.disabled) {
  console.error('FAIL pcbw: Outline button still disabled (both variants should be available)')
  console.error('status:', panel2.querySelector('.ghgv-status')?.textContent)
  process.exit(1)
}
console.log('PASS pcbw: Outline button enabled,', panel2.querySelector('.ghgv-status')?.textContent)

// Switch to Top view, capture the with-outline render
topBtn2.click()
await new Promise((r) => setTimeout(r, 100))
const stage2 = panel2.querySelector('.ghgv-stage')
const topWith = stage2.querySelector('svg').outerHTML

// Toggle outline off, capture the no-outline render
outlineBtn.click()
await new Promise((r) => setTimeout(r, 100))
const topWithout = stage2.querySelector('svg').outerHTML

if (topWith === topWithout) {
  console.error('FAIL pcbw: toggling Outline did not change the SVG')
  process.exit(1)
}
console.log('PASS pcbw: outline-on length =', topWith.length, ', outline-off length =', topWithout.length)

// --- Rotation tests ---
const rotateLeftBtn = buttons2.find((b) => b.title?.includes('counter-clockwise'))
const rotateRightBtn = buttons2.find((b) => b.title?.includes('clockwise') && !b.title.includes('counter'))
if (!rotateLeftBtn || !rotateRightBtn) {
  console.error('FAIL: rotate buttons missing', { left: !!rotateLeftBtn, right: !!rotateRightBtn })
  process.exit(1)
}

// Switch back to Top, capture original viewBox
topBtn2.click()
await new Promise((r) => setTimeout(r, 100))
const beforeRotateSvg = stage2.querySelector('svg')
const originalVb = beforeRotateSvg.getAttribute('viewBox')

// Rotate right 90 degrees: viewBox should swap dimensions
rotateRightBtn.click()
await new Promise((r) => setTimeout(r, 100))
const afterRotateSvg = stage2.querySelector('svg')
const rotatedVb = afterRotateSvg.getAttribute('viewBox')
const [, , origW, origH] = originalVb.split(/\s+/).map(Number)
const [, , rotW, rotH] = rotatedVb.split(/\s+/).map(Number)
if (Math.abs(rotW - origH) > 0.01 || Math.abs(rotH - origW) > 0.01) {
  console.error('FAIL: viewBox dimensions did not swap on 90 deg rotation')
  console.error('  original:', originalVb, '-> rotated:', rotatedVb)
  process.exit(1)
}
// Verify the rotation group exists and has a rotate transform
const rotGroup = afterRotateSvg.querySelector('g[data-ghgv-rot]')
if (!rotGroup || !rotGroup.getAttribute('transform')?.startsWith('rotate(90')) {
  console.error('FAIL: rotation group missing or wrong transform')
  console.error('  rotGroup:', !!rotGroup, 'transform:', rotGroup?.getAttribute('transform'))
  process.exit(1)
}
console.log('PASS rotate right: viewBox', origW + 'x' + origH, '->', rotW + 'x' + rotH)

// Rotate right three more times to wrap back to 0
rotateRightBtn.click()
rotateRightBtn.click()
rotateRightBtn.click()
await new Promise((r) => setTimeout(r, 100))
const wrappedSvg = stage2.querySelector('svg')
const wrappedVb = wrappedSvg.getAttribute('viewBox')
if (wrappedVb !== originalVb) {
  console.error('FAIL: viewBox did not return to original after 4x90 rotations')
  console.error('  original:', originalVb, ', after 4 rotations:', wrappedVb)
  process.exit(1)
}
console.log('PASS rotate full circle: viewBox restored')

// Rotate left should be inverse of rotate right
rotateLeftBtn.click()
await new Promise((r) => setTimeout(r, 100))
const afterLeftSvg = stage2.querySelector('svg')
const leftVb = afterLeftSvg.getAttribute('viewBox')
// Left from 0 = 270 degrees, which also swaps dimensions
const [, , leftW, leftH] = leftVb.split(/\s+/).map(Number)
if (Math.abs(leftW - origH) > 0.01 || Math.abs(leftH - origW) > 0.01) {
  console.error('FAIL: viewBox did not swap on rotate-left')
  process.exit(1)
}
const leftGroup = afterLeftSvg.querySelector('g[data-ghgv-rot]')
if (!leftGroup?.getAttribute('transform')?.startsWith('rotate(270')) {
  console.error('FAIL: rotate-left did not produce 270deg transform')
  process.exit(1)
}
console.log('PASS rotate left: 270deg transform applied')

// Verify Green Shoe Garage link is present
const credit = panel2.querySelector('.ghgv-credit a')
if (!credit) {
  console.error('FAIL: GSG credit link missing')
  process.exit(1)
}
if (credit.textContent !== 'Green Shoe Garage') {
  console.error('FAIL: GSG link text wrong:', credit.textContent)
  process.exit(1)
}
if (credit.getAttribute('href') !== 'https://github.com/GreenShoeGarage/GitHub_GerberViewer_ChromeExtension') {
  console.error('FAIL: GSG link href wrong:', credit.getAttribute('href'))
  process.exit(1)
}
console.log('PASS Green Shoe Garage link present')

console.log('All checks passed.')

// =============================================================================
// Third pass: tree-view (folder) detection. Open a tree URL pointing at a
// folder of Gerbers and verify a panel mounts with Top/Bottom enabled.
// =============================================================================

const TREE_BASE = 'https://raw.githubusercontent.com/example/treerepo/main/gerbers/'
const treeContent = new Map()
for (const f of pcbwFiles) {
  treeContent.set(TREE_BASE + f, fs.readFileSync(path.join(PCBW_DIR, f), 'utf8'))
}
const treeListing = pcbwFiles.map((name) => ({
  name,
  type: 'file',
  size: fs.statSync(path.join(PCBW_DIR, name)).size,
  download_url: TREE_BASE + name,
}))

const dom3 = new JSDOM(html, {
  url: 'https://github.com/example/treerepo/tree/main/gerbers',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
})
dom3.window.fetch = (url) => {
  if (treeContent.has(url)) {
    return Promise.resolve({
      ok: true, status: 200,
      text: () => Promise.resolve(treeContent.get(url)),
    })
  }
  if (/^https:\/\/api\.github\.com\/repos\/example\/treerepo\/contents/.test(url)) {
    return Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve(treeListing),
    })
  }
  return Promise.reject(new Error('unexpected fetch ' + url))
}
dom3.window.eval(bundle)
await new Promise((r) => setTimeout(r, 15000))

const treePanel = dom3.window.document.querySelector('[data-ghgv="1"]')
if (!treePanel) {
  console.error('FAIL tree: no panel mounted')
  console.error(dom3.window.document.body.innerHTML.slice(0, 800))
  process.exit(1)
}
const treeButtons = Array.from(treePanel.querySelectorAll('button'))
const treeTopBtn = treeButtons.find((b) => b.dataset.view === 'top')
const treeBottomBtn = treeButtons.find((b) => b.dataset.view === 'bottom')
if (!treeTopBtn || !treeBottomBtn) {
  console.error('FAIL tree: top/bottom buttons missing')
  process.exit(1)
}
if (treeTopBtn.disabled || treeBottomBtn.disabled) {
  console.error('FAIL tree: top/bottom still disabled')
  console.error('status:', treePanel.querySelector('.ghgv-status')?.textContent)
  process.exit(1)
}
const treeStage = treePanel.querySelector('.ghgv-stage')
const treeSvg = treeStage.querySelector('svg')
if (!treeSvg) {
  console.error('FAIL tree: stage has no SVG (auto-show should have selected Top)')
  process.exit(1)
}
console.log('PASS tree-view: panel mounted, SVG length =', treeSvg.outerHTML.length)
console.log('  status:', treePanel.querySelector('.ghgv-status')?.textContent)

// =============================================================================
// Fourth pass: ZIP archive on a blob page. Build a zip in memory containing
// the PCB-Workshop layers and verify the extension extracts and renders them.
// =============================================================================

// Build a zip in memory using fflate (matches what the extension uses)
import { zipSync, strToU8 } from 'fflate'
const zipFiles = {}
for (const f of pcbwFiles) {
  zipFiles[`gerbers/${f}`] = new Uint8Array(fs.readFileSync(path.join(PCBW_DIR, f)))
}
const zipBytes = zipSync(zipFiles).buffer

const ZIP_RAW_URL = 'https://raw.githubusercontent.com/example/ziprepo/main/gerbers.zip'
const dom4 = new JSDOM(html, {
  url: 'https://github.com/example/ziprepo/blob/main/gerbers.zip',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
})
// Build an ArrayBuffer in jsdom's realm so JSZip's instanceof check passes
const zipBytesInDom = new dom4.window.Uint8Array(new Uint8Array(zipBytes)).buffer
dom4.window.fetch = (url) => {
  if (url === ZIP_RAW_URL) {
    return Promise.resolve({
      ok: true, status: 200,
      arrayBuffer: () => Promise.resolve(zipBytesInDom),
    })
  }
  return Promise.reject(new Error('unexpected fetch ' + url))
}
dom4.window.eval(bundle)
await new Promise((r) => setTimeout(r, 25000))

const zipPanel = dom4.window.document.querySelector('[data-ghgv="1"]')
if (!zipPanel) {
  console.error('FAIL zip: no panel mounted')
  process.exit(1)
}
const zipButtons = Array.from(zipPanel.querySelectorAll('button'))
const zipTopBtn = zipButtons.find((b) => b.dataset.view === 'top')
const zipBottomBtn = zipButtons.find((b) => b.dataset.view === 'bottom')
if (!zipTopBtn || zipTopBtn.disabled) {
  console.error('FAIL zip: top button missing or still disabled')
  console.error('status:', zipPanel.querySelector('.ghgv-status')?.textContent)
  console.error('error:', zipPanel.querySelector('.ghgv-error')?.textContent)
  console.error('loading:', zipPanel.querySelector('.ghgv-loading')?.textContent)
  console.error('stage HTML preview:', zipPanel.querySelector('.ghgv-stage')?.innerHTML?.slice(0, 400))
  process.exit(1)
}
const zipStage = zipPanel.querySelector('.ghgv-stage')
const zipSvg = zipStage.querySelector('svg')
if (!zipSvg) {
  console.error('FAIL zip: stage has no SVG')
  process.exit(1)
}
console.log('PASS zip archive: panel mounted, SVG length =', zipSvg.outerHTML.length)
console.log('  status:', zipPanel.querySelector('.ghgv-status')?.textContent)

console.log('All extended checks passed.')

// =============================================================================
// Fifth pass: measurement tool. Verify the Measure button is present, that
// activating it injects an overlay group, and that simulating two pointer
// events produces a distance label whose value matches what we'd compute
// from the underlying file's known physical dimensions.
// =============================================================================

// Use the arduino-uno fixtures because they have a clean, known geometry
// and the SVG output has explicit width/height in inches.
const measureButtons = Array.from(panel.querySelectorAll('button'))
const measureBtn = measureButtons.find((b) => b.textContent === 'Measure')
const unitBtn = measureButtons.find((b) => b.textContent === 'mm' || b.textContent === 'mil')
if (!measureBtn) {
  console.error('FAIL measure: Measure button missing')
  process.exit(1)
}
if (!unitBtn) {
  console.error('FAIL measure: unit button missing')
  process.exit(1)
}
console.log('PASS measure: buttons present')

// Switch to layer view (simpler SVG, well-known calibration) and verify
// the button is enabled.
const measureLayerBtn = measureButtons.find((b) => b.dataset.view === 'layer')
measureLayerBtn.click()
await new Promise((r) => setTimeout(r, 200))
if (measureBtn.disabled) {
  console.error('FAIL measure: button disabled on layer view (calibration should be available)')
  process.exit(1)
}
console.log('PASS measure: button enabled on layer view')

// Activate measure mode and confirm the SVG gets a crosshair cursor and
// status changes to the prompt.
measureBtn.click()
await new Promise((r) => setTimeout(r, 100))
const measureSvg = panel.querySelector('svg')
if (!measureSvg) {
  console.error('FAIL measure: no SVG after activation')
  process.exit(1)
}
const statusEl = panel.querySelector('.ghgv-status')
if (!statusEl?.textContent?.includes('Click the start point')) {
  console.error('FAIL measure: status did not update on activation:', statusEl?.textContent)
  process.exit(1)
}
console.log('PASS measure: activated, status =', JSON.stringify(statusEl.textContent))

// Simulate two clicks at known viewBox coordinates by dispatching pointer
// events. We need to compute screen coordinates from viewBox coords using
// the SVG's bounding rect, but jsdom's getBoundingClientRect returns zeros
// by default. Patch it to return realistic dimensions matching the
// original viewBox aspect.
const origVb = measureSvg.dataset.ghgvOriginalViewBox.split(/\s+/).map(Number)
const [vbX, vbY, vbW, vbH] = origVb
const fakeWidthPx = 800
const fakeHeightPx = 800 * (vbH / vbW)
measureSvg.getBoundingClientRect = () => ({
  left: 0, top: 0, right: fakeWidthPx, bottom: fakeHeightPx,
  width: fakeWidthPx, height: fakeHeightPx, x: 0, y: 0,
})
// Mock getScreenCTM to return the identity scale matching our fake rect.
// jsdom doesn't implement getScreenCTM, so we provide a minimal one that
// matches what real browsers do for an unrotated, unscaled SVG.
const sx = fakeWidthPx / vbW
const sy = fakeHeightPx / vbH
measureSvg.getScreenCTM = () => ({
  a: sx, b: 0, c: 0, d: sy, e: -vbX * sx, f: -vbY * sy,
  inverse() {
    return {
      a: 1 / sx, b: 0, c: 0, d: 1 / sy, e: vbX, f: vbY,
      // Method on the inverse matrix that matrixTransform expects to call
    }
  },
})
// Provide createSVGPoint and matrixTransform shim
measureSvg.createSVGPoint = () => {
  const p = { x: 0, y: 0 }
  p.matrixTransform = (m) => ({ x: p.x * m.a + p.y * m.c + m.e, y: p.x * m.b + p.y * m.d + m.f })
  return p
}

// Pick two points 10mm apart along the X axis, in viewBox space
// Arduino uno: viewBox is 5918.2 wide for a 2.7-inch board, so:
//   units per mm = 5918.2 / (2.7 * 25.4) = ~86.27
// 10mm should be 862.7 units.
const widthAttr = measureSvg.dataset.ghgvOriginalWidth // e.g. "2.7in"
const widthMatch = widthAttr.match(/([\d.]+)/)
const physWidthIn = parseFloat(widthMatch[1])
const physWidthMm = physWidthIn * 25.4
const unitsPerMm = vbW / physWidthMm
console.log('  calibration: vbW =', vbW, ', physWidth =', physWidthMm, 'mm, unitsPerMm =', unitsPerMm.toFixed(2))

const targetDistMm = 10
const p1Vb = { x: vbX + vbW * 0.3, y: vbY + vbH * 0.5 }
const p2Vb = { x: p1Vb.x + targetDistMm * unitsPerMm, y: p1Vb.y }

// Convert to screen pixels via the fake CTM
const p1Px = { x: (p1Vb.x - vbX) * sx, y: (p1Vb.y - vbY) * sy }
const p2Px = { x: (p2Vb.x - vbX) * sx, y: (p2Vb.y - vbY) * sy }

function dispatchPointerDown(target, x, y) {
  const Event = dom.window.PointerEvent || dom.window.MouseEvent
  const ev = new Event('pointerdown', {
    bubbles: true, cancelable: true,
    button: 0, clientX: x, clientY: y, pointerId: 1,
  })
  target.dispatchEvent(ev)
}

dispatchPointerDown(measureSvg, p1Px.x, p1Px.y)
await new Promise((r) => setTimeout(r, 50))
dispatchPointerDown(measureSvg, p2Px.x, p2Px.y)
await new Promise((r) => setTimeout(r, 50))

const overlay = measureSvg.querySelector('g[data-ghgv-measure]')
if (!overlay) {
  console.error('FAIL measure: overlay group not created')
  process.exit(1)
}
const labels = overlay.querySelectorAll('text')
if (labels.length === 0) {
  console.error('FAIL measure: no distance label rendered')
  console.error('  overlay children:', overlay.childNodes.length)
  console.error('  status:', statusEl.textContent)
  process.exit(1)
}
const labelText = labels[labels.length - 1].textContent
console.log('PASS measure: label rendered =', JSON.stringify(labelText))
// Expect ~10.000 mm (allow tolerance for rounding)
const m = labelText.match(/([\d.]+)\s*mm/)
if (!m) {
  console.error('FAIL measure: label not in mm format:', labelText)
  process.exit(1)
}
const reportedMm = parseFloat(m[1])
if (Math.abs(reportedMm - targetDistMm) > 0.05) {
  console.error('FAIL measure: distance off, expected ~10mm got', reportedMm)
  process.exit(1)
}
console.log('PASS measure: 10mm separation reported as', reportedMm, 'mm')

// Toggle to mil and verify the label updates without re-clicking
unitBtn.click()
await new Promise((r) => setTimeout(r, 50))
const labelsAfter = overlay.querySelectorAll('text')
const milText = labelsAfter[labelsAfter.length - 1].textContent
const milMatch = milText.match(/([\d.]+)\s*mil/)
if (!milMatch) {
  console.error('FAIL measure: unit toggle did not switch to mil:', milText)
  process.exit(1)
}
const reportedMil = parseFloat(milMatch[1])
const expectedMil = (targetDistMm / 25.4) * 1000  // ~393.7
if (Math.abs(reportedMil - expectedMil) > 1) {
  console.error('FAIL measure: mil conversion wrong, expected ~', expectedMil, 'got', reportedMil)
  process.exit(1)
}
console.log('PASS measure: unit toggle works,', reportedMil, 'mil ≈', expectedMil.toFixed(1), 'mil')

// =============================================================================
// Sixth pass: rotation + measurement regression. Verify markers land at the
// click position when the board has been rotated. v0.7.1 had a bug where the
// measurement overlay group could end up swept into the rotation transform,
// so markers appeared at rotated positions instead of where the user clicked.
// =============================================================================

// Reset: deactivate measure, return to a freshly rotated state.
if (measureBtn.classList.contains('ghgv-active')) {
  measureBtn.click()
  await new Promise((r) => setTimeout(r, 50))
}
const rotateRightBtnM = measureButtons.find((b) => b.title?.includes('clockwise') && !b.title.includes('counter'))
rotateRightBtnM.click()
await new Promise((r) => setTimeout(r, 100))

// Re-derive CTM for the now-rotated SVG
const rSvg = panel.querySelector('svg')
const rVb = rSvg.getAttribute('viewBox').split(/\s+/).map(Number)
const [rVbX, rVbY, rVbW, rVbH] = rVb
const rWidthPx = 800
const rHeightPx = 800 * (rVbH / rVbW)
rSvg.getBoundingClientRect = () => ({
  left: 0, top: 0, right: rWidthPx, bottom: rHeightPx,
  width: rWidthPx, height: rHeightPx, x: 0, y: 0,
})
const rSx = rWidthPx / rVbW
const rSy = rHeightPx / rVbH
rSvg.getScreenCTM = () => ({
  a: rSx, b: 0, c: 0, d: rSy, e: -rVbX * rSx, f: -rVbY * rSy,
  inverse() { return { a: 1/rSx, b: 0, c: 0, d: 1/rSy, e: rVbX, f: rVbY } },
})
rSvg.createSVGPoint = () => {
  const p = { x: 0, y: 0 }
  p.matrixTransform = (m) => ({ x: p.x * m.a + p.y * m.c + m.e, y: p.x * m.b + p.y * m.d + m.f })
  return p
}

measureBtn.click()
await new Promise((r) => setTimeout(r, 50))

// Click at an off-center position
const rClickX = rWidthPx * 0.3
const rClickY = rHeightPx * 0.4
const PointerEvtM = dom.window.PointerEvent || dom.window.MouseEvent
rSvg.dispatchEvent(new PointerEvtM('pointerdown', {
  bubbles: true, cancelable: true, button: 0,
  clientX: rClickX, clientY: rClickY, pointerId: 1,
}))
await new Promise((r) => setTimeout(r, 50))

const rOverlay = rSvg.querySelector('g[data-ghgv-measure]')
if (!rOverlay || rOverlay.parentNode !== rSvg) {
  console.error('FAIL rotated-measure: overlay not at SVG root')
  process.exit(1)
}
const rMarker = rOverlay.querySelector('circle')
if (!rMarker) {
  console.error('FAIL rotated-measure: no marker drawn')
  process.exit(1)
}
const rMx = parseFloat(rMarker.getAttribute('cx'))
const rMy = parseFloat(rMarker.getAttribute('cy'))
const rExpX = rVbX + (rClickX / rWidthPx) * rVbW
const rExpY = rVbY + (rClickY / rHeightPx) * rVbH
if (Math.abs(rMx - rExpX) > 1 || Math.abs(rMy - rExpY) > 1) {
  console.error(`FAIL rotated-measure: marker at (${rMx.toFixed(1)},${rMy.toFixed(1)}), expected (${rExpX.toFixed(1)},${rExpY.toFixed(1)})`)
  process.exit(1)
}
console.log('PASS rotated-measure: marker lands at click position in rotated view')

// Toggle measure off and confirm overlay is fully removed (so future
// rotations cannot capture it).
measureBtn.click()
await new Promise((r) => setTimeout(r, 50))
if (rSvg.querySelector('g[data-ghgv-measure]')) {
  console.error('FAIL rotated-measure: overlay element survived deactivate')
  process.exit(1)
}
console.log('PASS rotated-measure: overlay removed on deactivate')

// =============================================================================
// Discrete two-click measurement: clicking a start point then an end point
// completes a measurement that locks. A subsequent PLAIN click should clear
// and start a fresh measurement (one marker), not extend a chain.
// =============================================================================

// Activate measure again on the (now-restored) view
measureBtn.click()
await new Promise((r) => setTimeout(r, 100))
const chainStage = panel.querySelector('.ghgv-stage')
const chainSvg = chainStage.querySelector('svg')
// Re-derive CTM since this is the post-rotation SVG (which may have been
// replaced; values restored from the latest state)
const chainVb = chainSvg.getAttribute('viewBox').split(/\s+/).map(Number)
const [cVbX, cVbY, cVbW, cVbH] = chainVb
const cWidthPx = 800
const cHeightPx = 800 * (cVbH / cVbW)
chainSvg.getBoundingClientRect = () => ({
  left: 0, top: 0, right: cWidthPx, bottom: cHeightPx,
  width: cWidthPx, height: cHeightPx, x: 0, y: 0,
})
const cSx = cWidthPx / cVbW
const cSy = cHeightPx / cVbH
chainSvg.getScreenCTM = () => ({
  a: cSx, b: 0, c: 0, d: cSy, e: -cVbX * cSx, f: -cVbY * cSy,
  inverse() { return { a: 1/cSx, b: 0, c: 0, d: 1/cSy, e: cVbX, f: cVbY } },
})
chainSvg.createSVGPoint = () => {
  const p = { x: 0, y: 0 }
  p.matrixTransform = (m) => ({ x: p.x * m.a + p.y * m.c + m.e, y: p.x * m.b + p.y * m.d + m.f })
  return p
}

const ChainEvent = dom.window.PointerEvent || dom.window.MouseEvent
function chainClick(x, y, shiftKey = false) {
  chainSvg.dispatchEvent(new ChainEvent('pointerdown', {
    bubbles: true, cancelable: true, button: 0,
    clientX: x, clientY: y, pointerId: 1, shiftKey,
  }))
}

// Two plain clicks complete a measurement (2 markers, 1 segment).
chainClick(200, 200)
await new Promise((r) => setTimeout(r, 30))
chainClick(400, 200)
await new Promise((r) => setTimeout(r, 30))

const discreteOverlay = chainSvg.querySelector('g[data-ghgv-measure]')
let discreteMarkers = discreteOverlay.querySelectorAll('circle')
if (discreteMarkers.length !== 2) {
  console.error('FAIL discrete-measure: expected 2 markers after two clicks, got', discreteMarkers.length)
  process.exit(1)
}
console.log('PASS discrete-measure: two clicks produce 2 markers')

// Status should indicate the measurement is complete and offer to chain.
let discreteStatus = panel.querySelector('.ghgv-status')?.textContent
if (!discreteStatus?.includes('Distance:') || !discreteStatus?.toLowerCase().includes('shift-click')) {
  console.error('FAIL discrete-measure: status should show Distance and mention Shift-click:', discreteStatus)
  process.exit(1)
}
console.log('PASS discrete-measure: status locks with Distance + chain hint,', JSON.stringify(discreteStatus))

// A THIRD plain click should start fresh: clear to a single marker.
chainClick(300, 300)
await new Promise((r) => setTimeout(r, 30))
discreteMarkers = discreteOverlay.querySelectorAll('circle')
if (discreteMarkers.length !== 1) {
  console.error('FAIL discrete-measure: plain click after complete should restart (1 marker), got', discreteMarkers.length)
  process.exit(1)
}
console.log('PASS discrete-measure: plain click after completion starts a fresh measurement')

// =============================================================================
// Opt-in chaining: Shift-click extends an existing measurement. Build an
// L-shape with the 2nd and 3rd clicks holding Shift, producing 3 markers,
// 2 segments, and a running total.
// =============================================================================

// Reset by toggling measure off and on
measureBtn.click()
await new Promise((r) => setTimeout(r, 30))
measureBtn.click()
await new Promise((r) => setTimeout(r, 50))

// First click plain (start), then Shift-click twice to chain.
chainClick(200, 200)
await new Promise((r) => setTimeout(r, 30))
chainClick(400, 200, true)
await new Promise((r) => setTimeout(r, 30))
chainClick(400, 400, true)
await new Promise((r) => setTimeout(r, 30))

const chainOverlay = chainSvg.querySelector('g[data-ghgv-measure]')
if (!chainOverlay) {
  console.error('FAIL chain: overlay not created')
  process.exit(1)
}
const chainSegments = chainOverlay.querySelectorAll('line')
const chainMarkers = chainOverlay.querySelectorAll('circle')
const chainLabels = chainOverlay.querySelectorAll('text')
if (chainMarkers.length !== 3) {
  console.error('FAIL chain: expected 3 markers, got', chainMarkers.length)
  process.exit(1)
}
if (chainSegments.length < 2) {
  console.error('FAIL chain: expected at least 2 segment lines, got', chainSegments.length)
  process.exit(1)
}
if (chainLabels.length < 2) {
  console.error('FAIL chain: expected at least 2 distance labels, got', chainLabels.length)
  process.exit(1)
}
console.log('PASS chain: 1 click + 2 shift-clicks ->', chainMarkers.length, 'markers,', chainSegments.length, 'segments,', chainLabels.length, 'labels')

// Status should now report total + segment info
const chainStatus = panel.querySelector('.ghgv-status')?.textContent
if (!chainStatus?.includes('Total') || !chainStatus?.includes('Segment 2')) {
  console.error('FAIL chain: status missing Total/Segment info:', chainStatus)
  process.exit(1)
}
console.log('PASS chain: status reports total,', JSON.stringify(chainStatus))

// Backspace should undo the last point
const backspaceEvt = new (dom.window.KeyboardEvent || dom.window.Event)('keydown', {
  bubbles: true, cancelable: true, key: 'Backspace',
})
dom.window.document.dispatchEvent(backspaceEvt)
await new Promise((r) => setTimeout(r, 30))
const markersAfterBack = chainOverlay.querySelectorAll('circle')
if (markersAfterBack.length !== 2) {
  console.error('FAIL chain: Backspace did not remove one marker, got', markersAfterBack.length)
  process.exit(1)
}
console.log('PASS chain: Backspace undid last point,', markersAfterBack.length, 'markers remain')

// Deactivate
measureBtn.click()
await new Promise((r) => setTimeout(r, 30))

console.log('All measurement checks passed.')

// =============================================================================
// Seventh pass: KiCad .kicad_pcb handler. Verify the panel mounts in
// KiCad mode, metadata is parsed correctly, and a <kicanvas-embed>
// element is inserted with the file content as an inline source.
// Note: jsdom can't actually execute KiCanvas's WebGL renderer, so we only
// validate the wiring up to the point KiCanvas would take over.
// =============================================================================

const KICAD_FIXTURE = path.join('test', 'fixtures', 'kicad', 'starfish.kicad_pcb')
const kicadContent = fs.readFileSync(KICAD_FIXTURE, 'utf8')
const KICAD_RAW_URL = 'https://raw.githubusercontent.com/example/kirepo/main/starfish.kicad_pcb'

// chrome.runtime.getURL is referenced by the KiCanvas loader; mock it so
// the bundle can build a URL even though the chrome API doesn't exist in
// Node. We stub the script-injection too: when the loader appends a
// <script>, instead of fetching the bundle we immediately mark the loader
// dataset flag set, so the handler proceeds.
const domK = new JSDOM(html, {
  url: 'https://github.com/example/kirepo/blob/main/starfish.kicad_pcb',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
})
domK.window.chrome = {
  runtime: {
    getURL: (path) => `chrome-extension://fake/${path}`,
  },
}
domK.window.fetch = (url) => {
  if (url === KICAD_RAW_URL) {
    return Promise.resolve({
      ok: true, status: 200,
      text: () => Promise.resolve(kicadContent),
    })
  }
  return Promise.reject(new Error('unexpected fetch ' + url))
}

// Watch for the loader stub being inserted. As soon as it is, set the
// ready flag so the loader resolves. (We're not actually loading KiCanvas
// in jsdom; we just need the handler to get past the loader gate.)
const origAppend = domK.window.HTMLHeadElement.prototype.appendChild
domK.window.HTMLHeadElement.prototype.appendChild = function(node) {
  const result = origAppend.call(this, node)
  if (node.id === 'ghgv-kicanvas-loader') {
    // The loader polls dataset; set the flag a microtask later.
    setTimeout(() => {
      domK.window.document.documentElement.dataset.ghgvKicanvasReady = '1'
    }, 10)
  }
  return result
}

// jsdom throws "not implemented" from HTMLCanvasElement.getContext, which
// makes our WebGL2 probe report unavailable and triggers the fallback
// path. To exercise the KiCanvas success path here, stub getContext to
// return a minimal fake WebGL2 context. (A separate test below verifies
// the fallback path explicitly.)
domK.window.HTMLCanvasElement.prototype.getContext = function (type) {
  if (type === 'webgl2') {
    return {
      isContextLost: () => false,
      getExtension: () => null,
    }
  }
  return null
}

domK.window.eval(bundle)
await new Promise((r) => setTimeout(r, 3000))

const kicadPanel = domK.window.document.querySelector('[data-ghgv="1"]')
if (!kicadPanel) {
  console.error('FAIL kicad: panel not mounted')
  process.exit(1)
}
console.log('PASS kicad: panel mounted')

const kicadTitle = kicadPanel.querySelector('.ghgv-title')?.textContent
if (!kicadTitle?.includes('starfish.kicad_pcb')) {
  console.error('FAIL kicad: title missing filename:', kicadTitle)
  process.exit(1)
}
console.log('PASS kicad: title contains filename')

const kicadStatus = kicadPanel.querySelector('.ghgv-status')?.textContent
if (!kicadStatus?.includes('layers') || !kicadStatus?.includes('pcbnew')) {
  console.error('FAIL kicad: status missing parsed metadata:', kicadStatus)
  process.exit(1)
}
console.log('PASS kicad: metadata parsed,', JSON.stringify(kicadStatus))

const embed = kicadPanel.querySelector('kicanvas-embed')
if (!embed) {
  console.error('FAIL kicad: kicanvas-embed not inserted')
  console.error('stage html (first 500 chars):', kicadPanel.querySelector('.ghgv-stage')?.innerHTML?.slice(0, 500))
  process.exit(1)
}
const embedSource = embed.querySelector('kicanvas-source')
if (!embedSource) {
  console.error('FAIL kicad: kicanvas-source not found inside embed')
  process.exit(1)
}
const embedSourceText = embedSource.textContent
if (!embedSourceText?.includes('(kicad_pcb') || embedSourceText.length < kicadContent.length * 0.9) {
  console.error('FAIL kicad: source textContent too short:', embedSourceText?.length, 'vs', kicadContent.length)
  process.exit(1)
}
console.log('PASS kicad: embed has source with', embedSourceText.length, 'bytes of kicad_pcb content')

// Verify Hide/Show still works in the KiCad panel
const kicadButtons = Array.from(kicadPanel.querySelectorAll('button'))
const kicadToggle = kicadButtons.find((b) => b.textContent === 'Hide')
if (!kicadToggle) {
  console.error('FAIL kicad: Hide button missing')
  process.exit(1)
}
kicadToggle.click()
if (kicadToggle.textContent !== 'Show') {
  console.error('FAIL kicad: Hide button did not toggle to Show')
  process.exit(1)
}
console.log('PASS kicad: Hide/Show toggle works')

// Verify the Green Shoe Garage credit link is present
const kicadCredit = kicadPanel.querySelector('.ghgv-credit a')
if (kicadCredit?.textContent !== 'Green Shoe Garage' || kicadCredit?.getAttribute('href') !== 'https://github.com/GreenShoeGarage/GitHub_GerberViewer_ChromeExtension') {
  console.error('FAIL kicad: GSG link missing or wrong')
  process.exit(1)
}
console.log('PASS kicad: Green Shoe Garage credit link present')

console.log('All KiCad checks passed.')

// =============================================================================
// WebGL-unavailable fallback path. When the browser reports WebGL2 as
// unavailable (kiosk mode, hardware acceleration disabled, missing
// drivers), the handler should bail before loading KiCanvas and show an
// informative message with the file's metadata and a raw-file download
// link. We exercise this by leaving HTMLCanvasElement.getContext as
// jsdom's default (which throws "not implemented" -> probe reports
// unavailable).
// =============================================================================

const domKfb = new JSDOM(html, {
  url: 'https://github.com/example/kirepo/blob/main/starfish.kicad_pcb',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
})
domKfb.window.chrome = {
  runtime: {
    getURL: (path) => `chrome-extension://fake/${path}`,
  },
}
domKfb.window.fetch = (url) => {
  if (url === KICAD_RAW_URL) {
    return Promise.resolve({
      ok: true, status: 200,
      text: () => Promise.resolve(kicadContent),
    })
  }
  return Promise.reject(new Error('unexpected fetch ' + url))
}
// Intentionally NOT mocking getContext — jsdom throws "not implemented",
// which the checkWebGL2 helper catches and reports as unavailable.

// Watch for the loader stub being inserted. If WebGL fallback is working
// correctly the stub should NEVER be appended, because the handler bails
// before reaching loadKiCanvas().
let stubInserted = false
const origAppendFb = domKfb.window.HTMLHeadElement.prototype.appendChild
domKfb.window.HTMLHeadElement.prototype.appendChild = function(node) {
  if (node.id === 'ghgv-kicanvas-loader') {
    stubInserted = true
  }
  return origAppendFb.call(this, node)
}

domKfb.window.eval(bundle)
await new Promise((r) => setTimeout(r, 2000))

const fbPanel = domKfb.window.document.querySelector('[data-ghgv="1"]')
if (!fbPanel) {
  console.error('FAIL webgl-fallback: panel not mounted')
  process.exit(1)
}

if (stubInserted) {
  console.error('FAIL webgl-fallback: KiCanvas loader stub was inserted; handler should have bailed before load')
  process.exit(1)
}
console.log('PASS webgl-fallback: KiCanvas loader stub not inserted')

const fbStatus = fbPanel.querySelector('.ghgv-status')?.textContent || ''
if (!fbStatus.includes('WebGL2 unavailable')) {
  console.error('FAIL webgl-fallback: status does not mention WebGL2:', fbStatus)
  process.exit(1)
}
console.log('PASS webgl-fallback: status reports WebGL2 unavailable')

const fbStage = fbPanel.querySelector('.ghgv-stage')
const fbStageText = fbStage?.textContent || ''
if (!fbStageText.includes('KiCad PCB preview unavailable')) {
  console.error('FAIL webgl-fallback: stage missing KiCad preview heading')
  process.exit(1)
}
// Metadata should still be parsed and displayed
if (!fbStageText.includes('22') || !fbStageText.includes('pcbnew')) {
  console.error('FAIL webgl-fallback: stage missing layer count or generator:', fbStageText.slice(0, 300))
  process.exit(1)
}
console.log('PASS webgl-fallback: stage includes preview heading and parsed metadata')

// Raw-file download link
const fbLink = fbStage?.querySelector('a[href]')
if (!fbLink || fbLink.getAttribute('href') !== KICAD_RAW_URL) {
  console.error('FAIL webgl-fallback: raw-file link missing or wrong href')
  process.exit(1)
}
console.log('PASS webgl-fallback: raw-file download link present')

// Stage should not have the kicad-specific class (which is for canvas
// sized layouts); fallback uses plain layout
if (fbStage?.classList.contains('ghgv-stage-kicad')) {
  console.error('FAIL webgl-fallback: stage still has ghgv-stage-kicad class')
  process.exit(1)
}
console.log('PASS webgl-fallback: stage removed kicad-canvas class')

console.log('All WebGL fallback checks passed.')

// =============================================================================
// Inner layer browsing. Synthesize a 4-layer board by reusing the Arduino
// top-copper file under KiCad-style inner-layer filenames, plus a bottom
// copper layer and an outline. Verify that:
//   1. The panel exposes In1 and In2 tabs between Top and Bottom.
//   2. Clicking an inner tab swaps the stage SVG to the corresponding
//      inner-layer render.
//   3. Tab ordering is Top -> In1 -> In2 -> Bottom (numeric order).
// =============================================================================

const arduinoTopCopper = fs.readFileSync(path.join('test', 'fixtures', 'arduino-uno', 'arduino-uno.cmp'), 'utf8')
const arduinoBottomCopper = fs.readFileSync(path.join('test', 'fixtures', 'arduino-uno', 'arduino-uno.sol'), 'utf8')
const arduinoOutline = fs.readFileSync(path.join('test', 'fixtures', 'arduino-uno', 'arduino-uno.gko'), 'utf8')

// 4-layer fixture: top copper, two inner copper layers (both reusing the top
// copper geometry; the test doesn't care about the geometry, only that
// detection and rendering succeed), bottom copper, outline.
const FOUR_LAYER_BASE = 'https://raw.githubusercontent.com/example/4layer/main/'
const fourLayerFiles = {
  'board-F_Cu.gbr':  arduinoTopCopper,
  'board-In1_Cu.gbr': arduinoTopCopper,
  'board-In2_Cu.gbr': arduinoTopCopper,
  'board-B_Cu.gbr':  arduinoBottomCopper,
  'board-Edge_Cuts.gbr': arduinoOutline,
}
const fourLayerListing = Object.entries(fourLayerFiles).map(([name, content]) => ({
  name, type: 'file', size: content.length,
  download_url: FOUR_LAYER_BASE + name,
}))

const dom4l = new JSDOM(html, {
  url: 'https://github.com/example/4layer/tree/main/boards',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
})
dom4l.window.fetch = (url) => {
  for (const [name, content] of Object.entries(fourLayerFiles)) {
    if (url === FOUR_LAYER_BASE + name) {
      return Promise.resolve({
        ok: true, status: 200,
        text: () => Promise.resolve(content),
      })
    }
  }
  if (/^https:\/\/api\.github\.com\/repos\/example\/4layer\/contents/.test(url)) {
    return Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve(fourLayerListing),
    })
  }
  if (url === 'https://api.github.com/repos/example/4layer') {
    return Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve({ default_branch: 'main' }),
    })
  }
  return Promise.reject(new Error('unexpected fetch ' + url))
}
dom4l.window.eval(bundle)
await new Promise((r) => setTimeout(r, 15000))

const innerPanel = dom4l.window.document.querySelector('[data-ghgv="1"]')
if (!innerPanel) {
  console.error('FAIL inner: panel not mounted on 4-layer tree')
  process.exit(1)
}
console.log('PASS inner: panel mounted')

// Verify the tab strip now reads Top, In1, In2, Bottom (in that order)
const innerTabs = Array.from(innerPanel.querySelectorAll('.ghgv-tabs button'))
const innerTabLabels = innerTabs.map((b) => b.textContent)
// Tree mode: no Layer tab, so we expect [Top, In1, In2, Bottom]
const expected = ['Top', 'In1', 'In2', 'Bottom']
if (JSON.stringify(innerTabLabels) !== JSON.stringify(expected)) {
  console.error('FAIL inner: tab labels =', innerTabLabels, ', expected', expected)
  process.exit(1)
}
console.log('PASS inner: tab order is', innerTabLabels.join(' -> '))

// Click In1 and verify the stage gets a fresh SVG
const in1Btn = innerTabs.find((b) => b.textContent === 'In1')
in1Btn.click()
await new Promise((r) => setTimeout(r, 100))
if (!in1Btn.classList.contains('ghgv-active')) {
  console.error('FAIL inner: In1 tab not marked active after click')
  process.exit(1)
}
const innerStage = innerPanel.querySelector('.ghgv-stage')
const innerSvg = innerStage?.querySelector('svg')
if (!innerSvg) {
  console.error('FAIL inner: no SVG in stage after In1 click')
  process.exit(1)
}
console.log('PASS inner: In1 active, SVG length =', innerSvg.outerHTML.length)

// In1's title should include the source filename (for the user to confirm
// which file is being shown)
if (!in1Btn.title.includes('board-In1_Cu.gbr')) {
  console.error('FAIL inner: In1 tooltip missing filename, got:', in1Btn.title)
  process.exit(1)
}
console.log('PASS inner: In1 tooltip identifies source file')

// Click In2 and verify only one tab is active at a time
const in2Btn = innerTabs.find((b) => b.textContent === 'In2')
in2Btn.click()
await new Promise((r) => setTimeout(r, 100))
const activeTabs = innerTabs.filter((b) => b.classList.contains('ghgv-active'))
if (activeTabs.length !== 1 || activeTabs[0] !== in2Btn) {
  console.error('FAIL inner: expected exactly In2 active, got:', activeTabs.map((b) => b.textContent))
  process.exit(1)
}
console.log('PASS inner: switching tabs deactivates the previous one')

console.log('All inner-layer checks passed.')

// =============================================================================
// Eighth pass: X2 attribute parsing. A modern Gerber file declares its
// role via %TF.FileFunction,...*% attributes. Verify that when present,
// the panel's meta line shows this summary instead of the filename-based
// fallback from whats-that-gerber.
// =============================================================================

const X2_GERBER = `G04 X2 test file *
%FSLAX36Y36*%
%MOMM*%
%TF.FileFunction,Copper,L1,Top,Signal*%
%TF.Part,Single*%
%TF.GenerationSoftware,KiCad,Pcbnew,7.0.5*%
%TF.CreationDate,2025-01-15T10:30:00+02:00*%
%TF.SameCoordinates,Original*%
%ADD10C,0.500*%
D10*
X0Y0D02*
X10000000Y0D01*
X10000000Y10000000D01*
X0Y10000000D01*
X0Y0D01*
M02*
`

const X2_RAW_URL = 'https://raw.githubusercontent.com/example/x2repo/main/board.gbr'
const dom5 = new JSDOM(html, {
  url: 'https://github.com/example/x2repo/blob/main/board.gbr',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
})
dom5.window.fetch = (url) => {
  if (url === X2_RAW_URL) {
    return Promise.resolve({
      ok: true, status: 200,
      text: () => Promise.resolve(X2_GERBER),
    })
  }
  if (/^https:\/\/api\.github\.com\/repos\/example\/x2repo\/contents/.test(url)) {
    return Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve([]),  // no siblings; only the single file matters here
    })
  }
  return Promise.reject(new Error('unexpected fetch ' + url))
}
dom5.window.eval(bundle)
await new Promise((r) => setTimeout(r, 5000))

const x2Panel = dom5.window.document.querySelector('[data-ghgv="1"]')
if (!x2Panel) {
  console.error('FAIL x2: panel not mounted')
  process.exit(1)
}
const x2Meta = x2Panel.querySelector('.ghgv-meta')?.textContent
if (!x2Meta?.includes('Top copper') || !x2Meta?.includes('KiCad')) {
  console.error('FAIL x2: meta line missing X2-derived summary:', x2Meta)
  process.exit(1)
}
console.log('PASS x2: meta line shows X2-derived summary,', JSON.stringify(x2Meta))

// =============================================================================
// Ninth pass: structured error rendering. When a handler hits an error,
// it should render the structured layout (heading + detail + suggestion +
// raw file link) instead of a one-line message. We exercise this by
// pointing the blob handler at a 404 raw URL.
// =============================================================================

const ERR_RAW_URL = 'https://raw.githubusercontent.com/example/missing/main/board.gtl'
const domErr = new JSDOM(html, {
  url: 'https://github.com/example/missing/blob/main/board.gtl',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
})
// First fetch (pre-panel) succeeds with Gerber-shaped content so the panel
// mounts. The sibling-fetch returns 404 to drive the stackup into an error.
let errFetchCount = 0
domErr.window.fetch = (url) => {
  if (url === ERR_RAW_URL && errFetchCount === 0) {
    errFetchCount++
    // Return a minimal valid Gerber so single-layer render works but
    // the panel does exist for us to inspect.
    return Promise.resolve({
      ok: true, status: 200,
      text: () => Promise.resolve('G04 test*\n%FSLAX36Y36*%\n%MOMM*%\n%ADD10C,0.5*%\nD10*\nX0Y0D02*\nX1000000Y0D01*\nM02*\n'),
    })
  }
  if (/^https:\/\/api\.github\.com\/repos\/example\/missing\/contents/.test(url)) {
    // Sibling fetch fails with 404
    return Promise.resolve({ ok: false, status: 404, text: () => Promise.resolve('Not Found') })
  }
  return Promise.reject(new Error('unexpected fetch ' + url))
}
domErr.window.eval(bundle)
await new Promise((r) => setTimeout(r, 5000))

const errPanel = domErr.window.document.querySelector('[data-ghgv="1"]')
if (!errPanel) {
  console.error('FAIL error-render: panel did not mount')
  process.exit(1)
}
// The single-layer view rendered successfully, then the sibling-fetch
// failed. The blob handler demotes that to a status note rather than a
// full error replacement of the panel. Verify the status mentions the
// network problem instead of a raw exception string.
const errStatus = errPanel.querySelector('.ghgv-status')?.textContent || ''
if (!errStatus.toLowerCase().includes('multi-layer unavailable')) {
  console.error('FAIL error-render: status does not report multi-layer failure:', errStatus)
  process.exit(1)
}
console.log('PASS error-render: sibling-fetch failure surfaced via status,', JSON.stringify(errStatus))

// Now test the structured error rendering directly by invoking the
// detection error path (tree handler with no candidates).
const NO_LAYERS_BASE = 'https://raw.githubusercontent.com/example/nolayers/main/'
const domEmpty = new JSDOM(html, {
  url: 'https://github.com/example/nolayers/tree/main/boards',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
})
domEmpty.window.fetch = (url) => {
  if (/^https:\/\/api\.github\.com\/repos\/example\/nolayers\/contents/.test(url)) {
    return Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve([
        { name: 'readme.txt', type: 'file', size: 100, download_url: NO_LAYERS_BASE + 'readme.txt' },
      ]),
    })
  }
  return Promise.reject(new Error('unexpected fetch ' + url))
}
domEmpty.window.eval(bundle)
await new Promise((r) => setTimeout(r, 3000))

// The handler should bail without mounting a panel because there aren't
// enough Gerber-shaped candidates (the panel only mounts after the >=3
// threshold passes). So check that the panel does NOT exist.
const emptyPanel = domEmpty.window.document.querySelector('[data-ghgv="1"]')
if (emptyPanel) {
  console.error('FAIL error-render: panel mounted for folder with no Gerber candidates')
  process.exit(1)
}
console.log('PASS error-render: tree handler bails when no Gerber candidates present')

// =============================================================================
// Tenth pass: settings-driven defaults. When chrome.storage.local returns
// custom settings, the panel should reflect them. Specifically we test:
//   - defaultUnit: 'mil' makes the unit button start at "mil"
//   - defaultOutline: false makes the Outline button start inactive
//   - defaultInvert: true puts the stage in dark mode immediately
//   - startCollapsed: true makes the Hide button read "Show"
// =============================================================================

const SETTINGS_RAW_URL = 'https://raw.githubusercontent.com/example/settings/main/board.cmp'
const domSet = new JSDOM(html, {
  url: 'https://github.com/example/settings/blob/main/board.cmp',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
})
// Mock chrome.storage.local with our custom settings
domSet.window.chrome = {
  storage: {
    local: {
      get(keys, cb) {
        // Return our settings shape
        cb({
          ghgv_settings: {
            defaultUnit: 'mil',
            defaultOutline: false,
            defaultInvert: true,
            startCollapsed: true,
          },
        })
      },
      set(items, cb) { if (cb) cb() },
      remove(keys, cb) { if (cb) cb() },
    },
    session: {
      get(keys, cb) { cb({}) },
      set(items, cb) { if (cb) cb() },
    },
  },
  runtime: { getURL: (p) => `chrome-extension://fake/${p}` },
}
domSet.window.fetch = (url) => {
  if (url === SETTINGS_RAW_URL) {
    return Promise.resolve({
      ok: true, status: 200,
      text: () => Promise.resolve(arduinoTopCopper),  // reuse arduino fixture
    })
  }
  if (/^https:\/\/api\.github\.com\/repos\/example\/settings\/contents/.test(url)) {
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]) })
  }
  return Promise.reject(new Error('unexpected fetch ' + url))
}
domSet.window.eval(bundle)
await new Promise((r) => setTimeout(r, 5000))

const setPanel = domSet.window.document.querySelector('[data-ghgv="1"]')
if (!setPanel) {
  console.error('FAIL settings: panel did not mount')
  process.exit(1)
}

const setButtons = Array.from(setPanel.querySelectorAll('button'))
const setUnitBtn = setButtons.find((b) => b.textContent === 'mm' || b.textContent === 'mil')
if (setUnitBtn?.textContent !== 'mil') {
  console.error('FAIL settings: unit button not initialized from defaultUnit, got:', setUnitBtn?.textContent)
  process.exit(1)
}
console.log('PASS settings: defaultUnit applied (button reads "mil")')

const setOutlineBtn = setButtons.find((b) => b.textContent === 'Outline')
if (setOutlineBtn?.classList.contains('ghgv-active')) {
  console.error('FAIL settings: Outline button is active despite defaultOutline=false')
  process.exit(1)
}
console.log('PASS settings: defaultOutline=false applied (Outline button inactive)')

const setStage = setPanel.querySelector('.ghgv-stage')
if (!setStage?.classList.contains('ghgv-dark')) {
  console.error('FAIL settings: stage missing ghgv-dark class despite defaultInvert=true')
  process.exit(1)
}
console.log('PASS settings: defaultInvert applied (stage has ghgv-dark class)')

const setToggleBtn = setButtons.find((b) => b.textContent === 'Hide' || b.textContent === 'Show')
if (setToggleBtn?.textContent !== 'Show') {
  console.error('FAIL settings: Hide/Show button not in collapsed state, got:', setToggleBtn?.textContent)
  process.exit(1)
}
console.log('PASS settings: startCollapsed applied (button reads "Show", stage hidden)')

console.log('All v0.9 checks passed.')

// =============================================================================
// Eleventh pass: KiCad schematic (.kicad_sch) support. Same wiring as the
// .kicad_pcb path, but the embed should declare type="schematic" and the
// panel title and status should reflect the schematic kind.
// =============================================================================

const SCH_FIXTURE = path.join('test', 'fixtures', 'kicad', 'helium.kicad_sch')
const schContent = fs.readFileSync(SCH_FIXTURE, 'utf8')
const SCH_RAW_URL = 'https://raw.githubusercontent.com/example/schrepo/main/helium.kicad_sch'

const domSch = new JSDOM(html, {
  url: 'https://github.com/example/schrepo/blob/main/helium.kicad_sch',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
})
domSch.window.chrome = {
  runtime: { getURL: (p) => `chrome-extension://fake/${p}` },
  storage: {
    local: { get(k, cb) { cb({}) }, set(i, cb) { if (cb) cb() }, remove(k, cb) { if (cb) cb() } },
    session: { get(k, cb) { cb({}) }, set(i, cb) { if (cb) cb() } },
  },
}
domSch.window.fetch = (url) => {
  if (url === SCH_RAW_URL) {
    return Promise.resolve({
      ok: true, status: 200,
      text: () => Promise.resolve(schContent),
    })
  }
  return Promise.reject(new Error('unexpected fetch ' + url))
}

// Mock the loader stub append + WebGL2 success path so the embed actually
// gets wired up (matching the .kicad_pcb test setup).
const origAppendSch = domSch.window.HTMLHeadElement.prototype.appendChild
domSch.window.HTMLHeadElement.prototype.appendChild = function(node) {
  const result = origAppendSch.call(this, node)
  if (node.id === 'ghgv-kicanvas-loader') {
    setTimeout(() => {
      domSch.window.document.documentElement.dataset.ghgvKicanvasReady = '1'
    }, 10)
  }
  return result
}
domSch.window.HTMLCanvasElement.prototype.getContext = function(type) {
  if (type === 'webgl2') return { isContextLost: () => false, getExtension: () => null }
  return null
}

domSch.window.eval(bundle)
await new Promise((r) => setTimeout(r, 2000))

const schPanel = domSch.window.document.querySelector('[data-ghgv="1"]')
if (!schPanel) {
  console.error('FAIL kicad-sch: panel not mounted')
  process.exit(1)
}
console.log('PASS kicad-sch: panel mounted')

const schTitle = schPanel.querySelector('.ghgv-title')?.textContent
if (!schTitle?.includes('schematic') || !schTitle?.includes('helium.kicad_sch')) {
  console.error('FAIL kicad-sch: title does not identify as schematic:', schTitle)
  process.exit(1)
}
console.log('PASS kicad-sch: title identifies as schematic,', JSON.stringify(schTitle))

const schMeta = schPanel.querySelector('.ghgv-meta')?.textContent
if (schMeta !== 'kicad_sch') {
  console.error('FAIL kicad-sch: meta does not read kicad_sch:', schMeta)
  process.exit(1)
}
console.log('PASS kicad-sch: meta reads kicad_sch')

const schStatus = schPanel.querySelector('.ghgv-status')?.textContent
if (!schStatus?.includes('symbols') || !schStatus?.includes('eeschema')) {
  console.error('FAIL kicad-sch: status missing symbol count or generator:', schStatus)
  process.exit(1)
}
console.log('PASS kicad-sch: status reports symbol count and generator,', JSON.stringify(schStatus))

const schEmbed = schPanel.querySelector('kicanvas-embed')
const schSource = schEmbed?.querySelector('kicanvas-source')
if (schSource?.getAttribute('type') !== 'schematic') {
  console.error('FAIL kicad-sch: embed source type is not "schematic":', schSource?.getAttribute('type'))
  process.exit(1)
}
console.log('PASS kicad-sch: embed source type set to "schematic"')

console.log('All schematic checks passed.')

// =============================================================================
// Twelfth pass: GitHub Gist support. When a user views a Gist that
// contains Gerber files, the extension should mount a preview panel on
// the gist page. We verify URL parsing recognizes gist.github.com, that
// the gist API is called, that Gerber-shaped files are detected, and
// that a panel mounts.
// =============================================================================

const GIST_ID = 'a1b2c3d4e5f60718293a4b5c6d7e8f90'
const GIST_FILE_CONTENT = arduinoTopCopper  // reuse the arduino fixture
const GIST_API_RESPONSE = {
  id: GIST_ID,
  description: 'Test board for review',
  owner: { login: 'someone' },
  files: {
    'board.gtl': {
      filename: 'board.gtl',
      content: GIST_FILE_CONTENT,
      raw_url: `https://gist.githubusercontent.com/someone/${GIST_ID}/raw/abc/board.gtl`,
    },
    'README.md': {
      filename: 'README.md',
      content: '# Test board\nSome notes here.',
      raw_url: `https://gist.githubusercontent.com/someone/${GIST_ID}/raw/abc/README.md`,
    },
  },
}

const domGist = new JSDOM(html, {
  url: `https://gist.github.com/someone/${GIST_ID}`,
  runScripts: 'outside-only',
  pretendToBeVisual: true,
})
let gistApiCalled = false
domGist.window.fetch = (url) => {
  if (url === `https://api.github.com/gists/${GIST_ID}`) {
    gistApiCalled = true
    return Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve(GIST_API_RESPONSE),
    })
  }
  return Promise.reject(new Error('unexpected fetch ' + url))
}
domGist.window.eval(bundle)
await new Promise((r) => setTimeout(r, 3000))

if (!gistApiCalled) {
  console.error('FAIL gist: Gist API was not called')
  process.exit(1)
}
console.log('PASS gist: Gist API called for gist URL')

const gistPanel = domGist.window.document.querySelector('[data-ghgv="1"]')
if (!gistPanel) {
  console.error('FAIL gist: panel not mounted on gist page')
  process.exit(1)
}
console.log('PASS gist: panel mounted on gist page')

const gistTitle = gistPanel.querySelector('.ghgv-title')?.textContent
if (!gistTitle?.includes('Test board for review')) {
  console.error('FAIL gist: title does not use gist description:', gistTitle)
  process.exit(1)
}
console.log('PASS gist: title uses gist description,', JSON.stringify(gistTitle))

// Anonymous gist (no user segment in URL)
const ANON_GIST_ID = '1234567890abcdef1234567890abcdef'
const domAnon = new JSDOM(html, {
  url: `https://gist.github.com/${ANON_GIST_ID}`,
  runScripts: 'outside-only',
  pretendToBeVisual: true,
})
let anonGistApiCalled = false
domAnon.window.fetch = (url) => {
  if (url === `https://api.github.com/gists/${ANON_GIST_ID}`) {
    anonGistApiCalled = true
    return Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve({ ...GIST_API_RESPONSE, id: ANON_GIST_ID, description: '' }),
    })
  }
  return Promise.reject(new Error('unexpected fetch ' + url))
}
domAnon.window.eval(bundle)
await new Promise((r) => setTimeout(r, 3000))
if (!anonGistApiCalled) {
  console.error('FAIL gist-anon: API not called for anonymous gist')
  process.exit(1)
}
console.log('PASS gist-anon: anonymous gist URL also routes to gist handler')

// Gist without any Gerber-shaped files should NOT mount a panel
const NO_GERBER_GIST_ID = 'fedcba0987654321fedcba0987654321'
const domNoGerb = new JSDOM(html, {
  url: `https://gist.github.com/someone/${NO_GERBER_GIST_ID}`,
  runScripts: 'outside-only',
  pretendToBeVisual: true,
})
domNoGerb.window.fetch = (url) => {
  if (url === `https://api.github.com/gists/${NO_GERBER_GIST_ID}`) {
    return Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve({
        id: NO_GERBER_GIST_ID,
        files: {
          'hello.py': { filename: 'hello.py', content: 'print("hi")' },
        },
      }),
    })
  }
  return Promise.reject(new Error('unexpected fetch ' + url))
}
domNoGerb.window.eval(bundle)
await new Promise((r) => setTimeout(r, 2000))
const noGerbPanel = domNoGerb.window.document.querySelector('[data-ghgv="1"]')
if (noGerbPanel) {
  console.error('FAIL gist-empty: panel mounted on gist with no Gerber files')
  process.exit(1)
}
console.log('PASS gist-empty: no panel mounted on gist without Gerber files')

console.log('All gist checks passed.')

// =============================================================================
// Thirteenth pass: keyboard shortcuts. Verify that:
//   - Pressing "?" opens the help overlay
//   - Pressing Escape closes the help overlay
//   - Pressing "t" / "b" switches between Top and Bottom views
//   - Shortcuts do NOT fire when typing into an input
// =============================================================================

// Reuse the existing arduino fixture set up from the earlier blob test.
// We need a fresh JSDOM so the page state is clean.
const KB_RAW_URL = 'https://raw.githubusercontent.com/example/kbrepo/main/board.cmp'
const KB_BASE = 'https://raw.githubusercontent.com/example/kbrepo/main/'
const arduinoFiles = fs.readdirSync(path.join('test', 'fixtures', 'arduino-uno'))
const kbContent = new Map()
for (const f of arduinoFiles) {
  kbContent.set(KB_BASE + f, fs.readFileSync(path.join('test', 'fixtures', 'arduino-uno', f), 'utf8'))
}
const kbListing = arduinoFiles.map((name) => ({
  name, type: 'file',
  size: fs.statSync(path.join('test', 'fixtures', 'arduino-uno', name)).size,
  download_url: KB_BASE + name,
}))
// Rename .cmp -> board.cmp in listing so the URL matches; actually leave as is
// and just use one of the existing files.

const domKb = new JSDOM(html, {
  url: 'https://github.com/example/kbrepo/blob/main/arduino-uno.cmp',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
})
domKb.window.fetch = (url) => {
  if (url === KB_BASE + 'arduino-uno.cmp') {
    return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(kbContent.get(KB_BASE + 'arduino-uno.cmp')) })
  }
  for (const [u, content] of kbContent) {
    if (url === u) return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(content) })
  }
  if (/^https:\/\/api\.github\.com\/repos\/example\/kbrepo\/contents/.test(url)) {
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(kbListing) })
  }
  return Promise.reject(new Error('unexpected fetch ' + url))
}

domKb.window.eval(bundle)
await new Promise((r) => setTimeout(r, 15000))

const kbPanel = domKb.window.document.querySelector('[data-ghgv="1"]')
if (!kbPanel) {
  console.error('FAIL kb: panel not mounted')
  process.exit(1)
}
console.log('PASS kb: panel mounted')

// Press "?" to open the help overlay
const KbdEvent = domKb.window.KeyboardEvent
domKb.window.document.dispatchEvent(new KbdEvent('keydown', { key: '?', bubbles: true, cancelable: true }))
await new Promise((r) => setTimeout(r, 50))

let helpOverlay = domKb.window.document.querySelector('.ghgv-help-overlay')
if (!helpOverlay) {
  console.error('FAIL kb: help overlay did not appear on "?"')
  process.exit(1)
}
console.log('PASS kb: help overlay opens on "?"')

// Verify the overlay actually contains shortcut listings
const helpKbds = helpOverlay.querySelectorAll('kbd')
if (helpKbds.length < 8) {
  console.error('FAIL kb: help overlay has too few shortcuts listed,', helpKbds.length)
  process.exit(1)
}
console.log('PASS kb: help overlay lists', helpKbds.length, 'shortcut keys')

// Press Escape to close the overlay
domKb.window.document.dispatchEvent(new KbdEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
await new Promise((r) => setTimeout(r, 50))
helpOverlay = domKb.window.document.querySelector('.ghgv-help-overlay')
if (helpOverlay) {
  console.error('FAIL kb: help overlay did not close on Escape')
  process.exit(1)
}
console.log('PASS kb: help overlay closes on Escape')

// Press "t" to switch to Top view
const kbButtons = Array.from(kbPanel.querySelectorAll('.ghgv-tabs button'))
const topBtnK = kbButtons.find((b) => b.dataset.view === 'top')
const layerBtnK = kbButtons.find((b) => b.dataset.view === 'layer')
// Before: Layer is active (default for blob)
if (!layerBtnK?.classList.contains('ghgv-active')) {
  console.error('FAIL kb: precondition - Layer should start active, but it is not')
  process.exit(1)
}
if (topBtnK?.disabled) {
  console.error('FAIL kb: precondition - Top button is disabled (stackup did not complete)')
  process.exit(1)
}
domKb.window.document.dispatchEvent(new KbdEvent('keydown', { key: 't', bubbles: true, cancelable: true }))
await new Promise((r) => setTimeout(r, 100))
if (!topBtnK.classList.contains('ghgv-active')) {
  console.error('FAIL kb: "t" did not activate Top tab')
  process.exit(1)
}
console.log('PASS kb: pressing "t" switches to Top view')

// Press "b" to switch to Bottom
const bottomBtnK = kbButtons.find((b) => b.dataset.view === 'bottom')
domKb.window.document.dispatchEvent(new KbdEvent('keydown', { key: 'b', bubbles: true, cancelable: true }))
await new Promise((r) => setTimeout(r, 100))
if (!bottomBtnK.classList.contains('ghgv-active')) {
  console.error('FAIL kb: "b" did not activate Bottom tab')
  process.exit(1)
}
console.log('PASS kb: pressing "b" switches to Bottom view')

// Shortcuts must NOT fire while typing into an input
const fakeInput = domKb.window.document.createElement('input')
domKb.window.document.body.appendChild(fakeInput)
fakeInput.focus()
const tabBefore = kbButtons.find((b) => b.classList.contains('ghgv-active'))
domKb.window.document.dispatchEvent(new KbdEvent('keydown', { key: 't', bubbles: true, cancelable: true, target: fakeInput }))
await new Promise((r) => setTimeout(r, 50))
const tabAfter = kbButtons.find((b) => b.classList.contains('ghgv-active'))
if (tabBefore !== tabAfter) {
  console.error('FAIL kb: shortcut fired while input was focused')
  process.exit(1)
}
console.log('PASS kb: shortcuts do not fire while typing into an input')

console.log('All keyboard shortcut checks passed.')

// =============================================================================
// Fourteenth pass: BOM detection. When a tree page contains a bom.csv
// next to the Gerber files, a BOM panel should mount below the Gerber
// panel with the rows from the CSV parsed and displayed.
// =============================================================================

const BOM_CSV = `Reference,Quantity,Value,Footprint,Description
R1,1,10k,Resistor_SMD:R_0805,1/8W 1% pull-up
R2,1,4.7k,Resistor_SMD:R_0805,1/8W 1% pull-up
C1,2,100nF,Capacitor_SMD:C_0805,X7R 50V decoupling
"C2,C3",2,10uF,Capacitor_SMD:C_1206,X7R 25V bulk
U1,1,ATMEGA328P-AU,Package_QFP:TQFP-32_7x7mm_P0.8mm,8-bit AVR MCU
J1,1,Pin_Header_2x5,PinHeader_2x5_P2.54mm_Vertical,2x5 ICSP header
`

const BOM_BASE = 'https://raw.githubusercontent.com/example/bom-test/main/'
const bomFiles = {
  'arduino-uno.cmp': arduinoTopCopper,
  'arduino-uno.sol': arduinoBottomCopper,
  'arduino-uno.gko': arduinoOutline,
  'bom.csv': BOM_CSV,
}
const bomListing = Object.entries(bomFiles).map(([name, content]) => ({
  name, type: 'file', size: content.length,
  download_url: BOM_BASE + name,
}))

const domBom = new JSDOM(html, {
  url: 'https://github.com/example/bom-test/tree/main/boards',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
})
domBom.window.fetch = (url) => {
  for (const [name, content] of Object.entries(bomFiles)) {
    if (url === BOM_BASE + name) {
      return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(content) })
    }
  }
  if (/^https:\/\/api\.github\.com\/repos\/example\/bom-test\/contents/.test(url)) {
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(bomListing) })
  }
  return Promise.reject(new Error('unexpected fetch ' + url))
}
domBom.window.eval(bundle)
await new Promise((r) => setTimeout(r, 15000))

const bomPanel = domBom.window.document.querySelector('[data-ghgv-bom="1"]')
if (!bomPanel) {
  console.error('FAIL bom: BOM panel did not mount')
  process.exit(1)
}
console.log('PASS bom: BOM panel mounted alongside Gerber preview')

const bomTitle = bomPanel.querySelector('.ghgv-bom-title')?.textContent
if (!bomTitle?.includes('bom.csv')) {
  console.error('FAIL bom: title does not name the BOM file:', bomTitle)
  process.exit(1)
}
console.log('PASS bom: title names the BOM file')

const bomMeta = bomPanel.querySelector('.ghgv-bom-meta')?.textContent
// 6 data rows, 5 columns (Reference, Quantity, Value, Footprint, Description)
if (!bomMeta?.includes('6 rows') || !bomMeta?.includes('5 columns')) {
  console.error('FAIL bom: row/column count wrong:', bomMeta)
  process.exit(1)
}
console.log('PASS bom: row/column count correct,', JSON.stringify(bomMeta))

// Verify the header row and at least one data row are rendered
const bomTable = bomPanel.querySelector('.ghgv-bom-table')
const bomHeaders = Array.from(bomTable.querySelectorAll('thead th')).map((th) => th.textContent)
if (JSON.stringify(bomHeaders) !== JSON.stringify(['Reference', 'Quantity', 'Value', 'Footprint', 'Description'])) {
  console.error('FAIL bom: header row wrong:', bomHeaders)
  process.exit(1)
}
console.log('PASS bom: header row matches CSV columns')

const firstRowCells = Array.from(bomTable.querySelectorAll('tbody tr:first-child td')).map((td) => td.textContent)
if (firstRowCells[0] !== 'R1' || firstRowCells[1] !== '1' || firstRowCells[2] !== '10k') {
  console.error('FAIL bom: first data row wrong:', firstRowCells)
  process.exit(1)
}
console.log('PASS bom: first data row parsed correctly')

// Verify the quoted-field (C2,C3) is handled correctly
const bomRows = Array.from(bomTable.querySelectorAll('tbody tr'))
const c23Row = bomRows.find((r) => r.querySelector('td')?.textContent === 'C2,C3')
if (!c23Row) {
  console.error('FAIL bom: quoted field "C2,C3" not parsed as a single cell')
  process.exit(1)
}
console.log('PASS bom: quoted field with embedded comma parsed correctly')

// Click a sortable header
const qtyHeader = Array.from(bomTable.querySelectorAll('thead th')).find((th) => th.textContent === 'Quantity')
qtyHeader.click()
await new Promise((r) => setTimeout(r, 50))
if (!qtyHeader.classList.contains('ghgv-bom-sorted-asc')) {
  console.error('FAIL bom: clicking a header did not mark it sorted')
  process.exit(1)
}
console.log('PASS bom: clicking a header sorts the table')

console.log('All BOM checks passed.')

// =============================================================================
// Fifteenth pass: layer visibility toggles. When the panel is showing a
// stackup (Top/Bottom) view, clicking the Layers button should open a
// menu of toggleable layer kinds. Unchecking one hides those <g>
// elements in the SVG; switching views preserves the hidden state.
// =============================================================================

const LT_BASE = 'https://raw.githubusercontent.com/example/lt-test/main/'
const ltFiles = {
  'arduino-uno.cmp': arduinoTopCopper,
  'arduino-uno.sol': arduinoBottomCopper,
  'arduino-uno.gko': arduinoOutline,
  'arduino-uno.plc': fs.readFileSync(path.join('test', 'fixtures', 'arduino-uno', 'arduino-uno.plc'), 'utf8'),
  'arduino-uno.stc': fs.readFileSync(path.join('test', 'fixtures', 'arduino-uno', 'arduino-uno.stc'), 'utf8'),
  'arduino-uno.sts': fs.readFileSync(path.join('test', 'fixtures', 'arduino-uno', 'arduino-uno.sts'), 'utf8'),
  'arduino-uno.drd': fs.readFileSync(path.join('test', 'fixtures', 'arduino-uno', 'arduino-uno.drd'), 'utf8'),
}
const ltListing = Object.entries(ltFiles).map(([name, content]) => ({
  name, type: 'file', size: content.length,
  download_url: LT_BASE + name,
}))

const domLt = new JSDOM(html, {
  url: 'https://github.com/example/lt-test/tree/main/boards',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
})
domLt.window.fetch = (url) => {
  for (const [name, content] of Object.entries(ltFiles)) {
    if (url === LT_BASE + name) {
      return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(content) })
    }
  }
  if (/^https:\/\/api\.github\.com\/repos\/example\/lt-test\/contents/.test(url)) {
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(ltListing) })
  }
  return Promise.reject(new Error('unexpected fetch ' + url))
}
domLt.window.eval(bundle)
await new Promise((r) => setTimeout(r, 20000))

const ltPanel = domLt.window.document.querySelector('[data-ghgv="1"]')
if (!ltPanel) {
  console.error('FAIL layers: panel not mounted')
  process.exit(1)
}

// The Layers button should exist and be enabled in Top view (tree mode
// auto-shows Top once the stackup is ready).
const ltButtons = Array.from(ltPanel.querySelectorAll('button'))
const layersBtnLt = ltButtons.find((b) => b.textContent === 'Layers')
if (!layersBtnLt) {
  console.error('FAIL layers: Layers button not in toolbar')
  process.exit(1)
}
console.log('PASS layers: Layers button present in toolbar')

if (layersBtnLt.disabled) {
  console.error('FAIL layers: Layers button is disabled in Top view (should be enabled)')
  process.exit(1)
}
console.log('PASS layers: Layers button enabled in Top view')

// Click to open the menu
layersBtnLt.click()
await new Promise((r) => setTimeout(r, 50))
const ltMenu = ltPanel.querySelector('.ghgv-layer-menu')
if (!ltMenu) {
  console.error('FAIL layers: menu did not appear on click')
  process.exit(1)
}
console.log('PASS layers: clicking Layers opens menu')

const ltMenuRows = ltMenu.querySelectorAll('.ghgv-layer-menu-row')
if (ltMenuRows.length < 2) {
  console.error('FAIL layers: menu has too few rows,', ltMenuRows.length)
  process.exit(1)
}
console.log('PASS layers: menu lists', ltMenuRows.length, 'toggleable layer kinds')

// Find the silkscreen row and uncheck it
const ssRow = Array.from(ltMenuRows).find((r) => r.textContent.includes('Silkscreen'))
const ssCheckbox = ssRow?.querySelector('input[type="checkbox"]')
if (!ssCheckbox) {
  console.error('FAIL layers: silkscreen row checkbox not found')
  process.exit(1)
}
ssCheckbox.click()
await new Promise((r) => setTimeout(r, 50))

// Verify the silkscreen <g> in the SVG is hidden (display:none)
const ltSvg = ltPanel.querySelector('.ghgv-stage svg')
const ssGroups = ltSvg.querySelectorAll('[class$="_ss"]')
if (ssGroups.length === 0) {
  console.error('FAIL layers: no silkscreen group found in SVG (test fixture issue)')
  process.exit(1)
}
const ssHidden = Array.from(ssGroups).every((g) => g.style.display === 'none')
if (!ssHidden) {
  console.error('FAIL layers: silkscreen groups not hidden after unchecking')
  process.exit(1)
}
console.log('PASS layers: unchecking Silkscreen hides matching SVG groups')

// Switch to Bottom view, then back to Top, and verify the hidden state
// persists (the silkscreen is still hidden because applyVisibility runs
// on each showView).
const ltBottomBtn = ltButtons.find((b) => b.dataset.view === 'bottom')
ltBottomBtn?.click()
await new Promise((r) => setTimeout(r, 100))
const ltTopBtn = ltButtons.find((b) => b.dataset.view === 'top')
ltTopBtn?.click()
await new Promise((r) => setTimeout(r, 100))
const ltSvgAfter = ltPanel.querySelector('.ghgv-stage svg')
const ssGroupsAfter = ltSvgAfter.querySelectorAll('[class$="_ss"]')
const ssStillHidden = Array.from(ssGroupsAfter).every((g) => g.style.display === 'none')
if (!ssStillHidden) {
  console.error('FAIL layers: hidden state did not persist across view switches')
  process.exit(1)
}
console.log('PASS layers: hidden state persists across Top/Bottom switches')

console.log('All layer toggle checks passed.')

// =============================================================================
// Sixteenth pass: XLSX BOM support. Verify the lazy-loaded SheetJS path
// works end-to-end on a real XLSX file, that the BOM panel shows the
// parsed table, and that the sheet picker appears for multi-sheet files
// and lets the user switch between sheets.
// =============================================================================

const XLSX_BOM_BASE = 'https://raw.githubusercontent.com/example/xlsx-bom/main/'
const xlsxFixturePath = path.join('test', 'fixtures', 'bom-sample.xlsx')
const xlsxBytes = fs.readFileSync(xlsxFixturePath)
const xlsxFiles = {
  'arduino-uno.cmp': arduinoTopCopper,
  'arduino-uno.sol': arduinoBottomCopper,
  'arduino-uno.gko': arduinoOutline,
  // The fixture is multi-sheet (BOM + Notes); we serve its bytes raw.
  'bom.xlsx': xlsxBytes,
}
const xlsxListing = Object.entries(xlsxFiles).map(([name, content]) => ({
  name, type: 'file',
  size: typeof content === 'string' ? content.length : content.length,
  download_url: XLSX_BOM_BASE + name,
}))

const domXlsx = new JSDOM(html, {
  url: 'https://github.com/example/xlsx-bom/tree/main/boards',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
})
domXlsx.window.chrome = {
  runtime: { getURL: (p) => `chrome-extension://fake/${p}` },
  storage: {
    local: { get(k, cb) { cb({}) }, set(i, cb) { if (cb) cb() }, remove(k, cb) { if (cb) cb() } },
    session: { get(k, cb) { cb({}) }, set(i, cb) { if (cb) cb() } },
  },
}

// Mock the page-world SheetJS bridge. In a real browser, the content
// script injects a <script src=loader-stub.js> tag that loads SheetJS
// into the page main world and listens for postMessage. Here we run
// SheetJS directly in Node and answer postMessage requests on its behalf.
// This sidesteps jsdom's lack of cross-realm script-execution support
// while still exercising the postMessage protocol end-to-end.
//
// jsdom quirk: same-window postMessage delivers events with source=null
// rather than the window object, which would trip the production code's
// `event.source !== window` guard. We work around this by dispatching
// the response event directly with source set, instead of routing
// through postMessage.
import { createRequire } from 'node:module'
const nodeReq = createRequire(import.meta.url)
const testXLSX = nodeReq('xlsx')  // npm package, separate from vendor/sheetjs

// Mark ready immediately so the content-script-side waitForReady resolves
domXlsx.window.document.documentElement.dataset.ghgvXlsxReady = '1'

// Listen for parse requests and respond
domXlsx.window.addEventListener('message', (event) => {
  const msg = event.data
  if (!msg || msg.source !== 'ghgv-xlsx-request' || !msg.id) return
  const respond = (result, error) => {
    // Build a real MessageEvent with source set to window so the
    // content-script-side `event.source !== window` filter passes.
    const responseData = {
      source: 'ghgv-xlsx-response',
      id: msg.id,
      result: result || null,
      error: error || null,
    }
    const responseEvent = new domXlsx.window.MessageEvent('message', {
      data: responseData,
      source: domXlsx.window,
      origin: domXlsx.window.location.origin,
    })
    domXlsx.window.dispatchEvent(responseEvent)
  }
  try {
    const binary = Buffer.from(msg.bytes, 'base64')
    const wb = testXLSX.read(binary, { type: 'buffer' })
    let chosen = msg.sheetName
    if (!chosen) {
      chosen = wb.SheetNames.find((n) => /^(bom|bill\s*of\s*materials)$/i.test(n.trim()))
    }
    if (!chosen) {
      chosen = wb.SheetNames.find((name) => wb.Sheets[name] && wb.Sheets[name]['!ref'])
    }
    if (!chosen) {
      respond(null, 'no usable sheet')
      return
    }
    const aoa = testXLSX.utils.sheet_to_json(wb.Sheets[chosen], {
      header: 1, raw: false, defval: '',
    })
    const COMMON = /^(reference|designator|designators|qty|quantity|value|footprint|package|part(\s|_)?(number|name)|manufacturer|mpn|description|comment|net)$/i
    let headerIdx = 0
    for (let i = 0; i < Math.min(aoa.length, 10); i++) {
      if (aoa[i].some((cell) => COMMON.test(String(cell || '').trim()))) {
        headerIdx = i
        break
      }
    }
    const headers = aoa[headerIdx].map((h) => String(h || '').trim())
    const dataRows = aoa.slice(headerIdx + 1).filter((r) =>
      r.some((c) => String(c || '').trim() !== '')
    )
    const rows = dataRows.map((r) => {
      const obj = {}
      for (let i = 0; i < headers.length; i++) {
        obj[headers[i] || `col_${i + 1}`] = r[i] !== undefined ? String(r[i]) : ''
      }
      return obj
    })
    respond({ headers, rows, sheetNames: wb.SheetNames, activeSheet: chosen })
  } catch (e) {
    respond(null, e.message)
  }
})

domXlsx.window.fetch = (url) => {
  if (url === XLSX_BOM_BASE + 'bom.xlsx') {
    return Promise.resolve({
      ok: true, status: 200,
      text: () => Promise.resolve('binary'),
      arrayBuffer: () => Promise.resolve(xlsxBytes.buffer.slice(
        xlsxBytes.byteOffset,
        xlsxBytes.byteOffset + xlsxBytes.byteLength
      )),
    })
  }
  // Other Gerber files
  for (const [name, content] of Object.entries(xlsxFiles)) {
    if (name === 'bom.xlsx') continue  // handled above
    if (url === XLSX_BOM_BASE + name) {
      return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(content) })
    }
  }
  if (/^https:\/\/api\.github\.com\/repos\/example\/xlsx-bom\/contents/.test(url)) {
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(xlsxListing) })
  }
  return Promise.reject(new Error('unexpected fetch ' + url))
}
domXlsx.window.eval(bundle)
await new Promise((r) => setTimeout(r, 20000))

const xlsxBomPanel = domXlsx.window.document.querySelector('[data-ghgv-bom="1"]')
if (!xlsxBomPanel) {
  console.error('FAIL xlsx-bom: BOM panel did not mount for XLSX file')
  process.exit(1)
}
console.log('PASS xlsx-bom: BOM panel mounted for XLSX file')

const xlsxBomTitle = xlsxBomPanel.querySelector('.ghgv-bom-title')?.textContent
if (!xlsxBomTitle?.includes('bom.xlsx')) {
  console.error('FAIL xlsx-bom: title does not name the XLSX file:', xlsxBomTitle)
  process.exit(1)
}
console.log('PASS xlsx-bom: title names the XLSX file')

// Verify the table has the expected rows (4 data rows from the fixture)
const xlsxTable = xlsxBomPanel.querySelector('.ghgv-bom-table')
const xlsxRows = xlsxTable.querySelectorAll('tbody tr')
if (xlsxRows.length !== 4) {
  console.error('FAIL xlsx-bom: expected 4 data rows, got', xlsxRows.length)
  process.exit(1)
}
console.log('PASS xlsx-bom: parsed', xlsxRows.length, 'data rows from XLSX')

// First row should be R1, 1, 10k, R_0805, pull-up
const xlsxFirstRow = Array.from(xlsxRows[0].querySelectorAll('td')).map((td) => td.textContent)
if (xlsxFirstRow[0] !== 'R1' || xlsxFirstRow[2] !== '10k') {
  console.error('FAIL xlsx-bom: first data row wrong:', xlsxFirstRow)
  process.exit(1)
}
console.log('PASS xlsx-bom: first data row parsed correctly')

// Sheet picker should exist because the fixture has 2 sheets
const xlsxSheetPicker = xlsxBomPanel.querySelector('.ghgv-bom-sheet-picker')
if (!xlsxSheetPicker) {
  console.error('FAIL xlsx-bom: sheet picker missing on multi-sheet workbook')
  process.exit(1)
}
const sheetOptions = Array.from(xlsxSheetPicker.querySelectorAll('option')).map((o) => o.value)
if (!sheetOptions.includes('BOM') || !sheetOptions.includes('Notes')) {
  console.error('FAIL xlsx-bom: sheet picker missing sheets:', sheetOptions)
  process.exit(1)
}
console.log('PASS xlsx-bom: sheet picker shows', sheetOptions.length, 'sheets')

// Switch to the Notes sheet
xlsxSheetPicker.value = 'Notes'
xlsxSheetPicker.dispatchEvent(new domXlsx.window.Event('change', { bubbles: true }))
await new Promise((r) => setTimeout(r, 200))

// After the switch, the table should now show the Notes sheet content
// (the fixture's Notes sheet has header "Notes" plus 1 data row).
const xlsxTableAfter = xlsxBomPanel.querySelector('.ghgv-bom-table')
const xlsxHeaderAfter = Array.from(xlsxTableAfter.querySelectorAll('thead th')).map((th) => th.textContent)
if (xlsxHeaderAfter[0] !== 'Notes') {
  console.error('FAIL xlsx-bom: header did not update on sheet switch:', xlsxHeaderAfter)
  process.exit(1)
}
console.log('PASS xlsx-bom: switching sheets re-renders the table')

console.log('All XLSX BOM checks passed.')

// =============================================================================
// Seventeenth pass: soldermask color presets. Verify the colors module
// produces the right pcb-stackup color maps, that the Color button mounts
// and is enabled on a Top view, that opening it shows the preset list, and
// that buildStackup honors a non-default preset.
// =============================================================================

import { colorsForPreset, COLOR_PRESETS, isValidPresetId, DEFAULT_PRESET_ID } from '../src/core/colors.js'
import { buildStackup as buildStackupForColor, stackupSvgs as stackupSvgsForColor } from '../src/core/render.js'

// Unit-level: preset resolution
if (!isValidPresetId('red') || isValidPresetId('chartreuse')) {
  console.error('FAIL colors: isValidPresetId wrong')
  process.exit(1)
}
console.log('PASS colors: isValidPresetId validates preset ids')

if (COLOR_PRESETS.length !== 7) {
  console.error('FAIL colors: expected 7 presets, got', COLOR_PRESETS.length)
  process.exit(1)
}
console.log('PASS colors: 7 presets defined')

const greenColors = colorsForPreset('green')
const redColors = colorsForPreset('red')
if (greenColors.sm === redColors.sm) {
  console.error('FAIL colors: green and red soldermask are identical')
  process.exit(1)
}
// Black should flip silkscreen to a light color; white to a dark color.
const blackColors = colorsForPreset('black')
const whiteColors = colorsForPreset('white')
if (blackColors.ss.toLowerCase() === '#ffffff' && false) { /* allow near-white */ }
if (!/^#[ef]/i.test(blackColors.ss)) {
  console.error('FAIL colors: black board silkscreen should be near-white, got', blackColors.ss)
  process.exit(1)
}
if (!/^#[012]/i.test(whiteColors.ss)) {
  console.error('FAIL colors: white board silkscreen should be near-black, got', whiteColors.ss)
  process.exit(1)
}
console.log('PASS colors: silkscreen auto-pairs (light on black, dark on white)')

// Integration: buildStackup with a red preset should bake a red-ish
// soldermask into the SVG style block.
const colorDir = path.join('test', 'fixtures', 'arduino-uno')
const colorFiles = fs.readdirSync(colorDir).map((f) => ({
  filename: f, content: fs.readFileSync(path.join(colorDir, f), 'utf8'),
}))
const redBuild = await buildStackupForColor(colorFiles, { colorPreset: 'red' })
const redTop = stackupSvgsForColor(redBuild.stackup).top
const redSmMatch = redTop.match(/_sm \{color: (#[0-9a-f]+)/i)
if (!redSmMatch || redSmMatch[1].toLowerCase() !== '#7a0000') {
  console.error('FAIL colors: red preset did not bake red soldermask, got', redSmMatch?.[1])
  process.exit(1)
}
console.log('PASS colors: buildStackup({colorPreset:"red"}) produces red soldermask', redSmMatch[1])

const greenBuild = await buildStackupForColor(colorFiles, { colorPreset: 'green' })
const greenTop = stackupSvgsForColor(greenBuild.stackup).top
const greenSmMatch = greenTop.match(/_sm \{color: (#[0-9a-f]+)/i)
if (!greenSmMatch || greenSmMatch[1].toLowerCase() !== '#004200') {
  console.error('FAIL colors: green preset wrong soldermask, got', greenSmMatch?.[1])
  process.exit(1)
}
console.log('PASS colors: green preset produces green soldermask', greenSmMatch[1])

// UI: Color button present, disabled before stackup, enabled on Top view.
// Reuse a tree-mode panel render via a fresh JSDOM.
const COLOR_BASE = 'https://raw.githubusercontent.com/example/color-test/main/'
const colorListing = fs.readdirSync(colorDir).map((name) => ({
  name, type: 'file', size: fs.statSync(path.join(colorDir, name)).size,
  download_url: COLOR_BASE + name,
}))
const domColor = new JSDOM(html, {
  url: 'https://github.com/example/color-test/tree/main/boards',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
})
domColor.window.fetch = (url) => {
  for (const f of colorFiles) {
    if (url === COLOR_BASE + f.filename) {
      return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(f.content) })
    }
  }
  if (/^https:\/\/api\.github\.com\/repos\/example\/color-test\/contents/.test(url)) {
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(colorListing) })
  }
  return Promise.reject(new Error('unexpected fetch ' + url))
}
domColor.window.eval(bundle)
await new Promise((r) => setTimeout(r, 15000))

const colorPanel = domColor.window.document.querySelector('[data-ghgv="1"]')
if (!colorPanel) {
  console.error('FAIL colors-ui: panel not mounted')
  process.exit(1)
}
const colorBtnEl = Array.from(colorPanel.querySelectorAll('button')).find((b) => b.textContent === 'Color')
if (!colorBtnEl) {
  console.error('FAIL colors-ui: Color button not in toolbar')
  process.exit(1)
}
console.log('PASS colors-ui: Color button present in toolbar')

if (colorBtnEl.disabled) {
  console.error('FAIL colors-ui: Color button disabled on Top view (should be enabled)')
  process.exit(1)
}
console.log('PASS colors-ui: Color button enabled on Top view')

colorBtnEl.click()
await new Promise((r) => setTimeout(r, 50))
const colorMenu = colorPanel.querySelector('.ghgv-layer-menu')
const colorRows = colorMenu ? colorMenu.querySelectorAll('.ghgv-color-row') : []
if (colorRows.length !== 7) {
  console.error('FAIL colors-ui: expected 7 color rows, got', colorRows.length)
  process.exit(1)
}
console.log('PASS colors-ui: color menu lists 7 presets')

// Click the red row and confirm the rendered soldermask changes.
const redRow = Array.from(colorRows).find((r) => r.textContent.includes('Red'))
redRow.click()
await new Promise((r) => setTimeout(r, 1500))
const colorTopSvg = colorPanel.querySelector('.ghgv-stage svg')
const uiSmMatch = colorTopSvg?.outerHTML.match(/_sm \{color: (#[0-9a-f]+)/i)
if (!uiSmMatch || uiSmMatch[1].toLowerCase() !== '#7a0000') {
  console.error('FAIL colors-ui: selecting Red did not recolor the board, got', uiSmMatch?.[1])
  process.exit(1)
}
console.log('PASS colors-ui: selecting Red recolors the rendered board', uiSmMatch[1])

console.log('All soldermask color checks passed.')
