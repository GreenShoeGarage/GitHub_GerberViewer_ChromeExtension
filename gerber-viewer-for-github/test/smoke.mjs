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
if (!statusEl?.textContent?.includes('Click to start measuring')) {
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
// Chain measurement: a third click should extend the previous measurement
// rather than starting fresh, producing two segments and a running total.
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

// Click three points roughly forming an L: (200, 200), (400, 200), (400, 400)
// Distances should be screen-px*calibration apart
const ChainEvent = dom.window.PointerEvent || dom.window.MouseEvent
function chainClick(x, y) {
  chainSvg.dispatchEvent(new ChainEvent('pointerdown', {
    bubbles: true, cancelable: true, button: 0,
    clientX: x, clientY: y, pointerId: 1,
  }))
}

chainClick(200, 200)
await new Promise((r) => setTimeout(r, 30))
chainClick(400, 200)
await new Promise((r) => setTimeout(r, 30))
chainClick(400, 400)
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
console.log('PASS chain: 3 clicks ->', chainMarkers.length, 'markers,', chainSegments.length, 'segments,', chainLabels.length, 'labels')

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
if (kicadCredit?.textContent !== 'Green Shoe Garage' || kicadCredit?.getAttribute('href') !== 'https://greenshoegarage.com') {
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
if (!fbStageText.includes('KiCad preview unavailable')) {
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
