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
if (credit.getAttribute('href') !== 'https://greenshoegarage.com') {
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
if (!statusEl?.textContent?.includes('Click first point')) {
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

console.log('All measurement checks passed.')
