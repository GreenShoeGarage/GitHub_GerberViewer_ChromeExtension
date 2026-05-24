// Bundle-size budget check. Fails (exit 1) if any tracked artifact exceeds
// its budget, so CI catches accidental bloat before it ships. When a size
// increase is intentional (a real feature, a dependency bump), raise the
// budget here in the same commit. That makes every size jump a deliberate,
// reviewable decision rather than a silent drift.
//
// Run after `node build.mjs`. Used by CI and runnable locally:
//   node build.mjs && node scripts/check-bundle-size.mjs

import { statSync } from 'node:fs'

// Budgets in bytes. Keep a little headroom above the current size so small
// changes don't trip the check, but not so much that real bloat slips by.
//
// content.js is the esbuild output that ships as the content script. It is
// the one that grows as we add features, so it gets the most attention.
//
// The vendored bundles (KiCanvas, SheetJS) change only when we deliberately
// update the dependency, so they get a tight tolerance: a change here should
// be a conscious vendor update, not an accident.
const BUDGETS = [
  { path: 'dist/content.js', label: 'content script', maxBytes: 620 * 1024 },
  { path: 'vendor/kicanvas/kicanvas.js', label: 'KiCanvas (vendored)', maxBytes: 500 * 1024 },
  { path: 'vendor/sheetjs/xlsx.mini.min.js', label: 'SheetJS (vendored)', maxBytes: 270 * 1024 },
]

let failed = false
const kb = (n) => (n / 1024).toFixed(1) + ' KB'

console.log('Bundle size budget check:')
for (const b of BUDGETS) {
  let size
  try {
    size = statSync(b.path).size
  } catch (e) {
    console.error(`  MISSING  ${b.label} (${b.path}) not found. Did you run the build?`)
    failed = true
    continue
  }
  const pct = ((size / b.maxBytes) * 100).toFixed(0)
  if (size > b.maxBytes) {
    console.error(`  OVER     ${b.label}: ${kb(size)} exceeds budget ${kb(b.maxBytes)} (${pct}%)`)
    console.error(`           If this increase is intentional, raise the budget in scripts/check-bundle-size.mjs`)
    failed = true
  } else {
    console.log(`  ok       ${b.label}: ${kb(size)} / ${kb(b.maxBytes)} (${pct}%)`)
  }
}

if (failed) {
  console.error('\nBundle size budget check FAILED.')
  process.exit(1)
}
console.log('\nAll bundles within budget.')
