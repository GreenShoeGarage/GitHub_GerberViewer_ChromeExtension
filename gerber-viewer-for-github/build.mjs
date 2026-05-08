// Build script using esbuild with Node polyfills
// (gerber-to-svg / gerber-parser depend on stream, buffer, events, etc.)

import { build } from 'esbuild'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

await build({
  entryPoints: ['src/content.js'],
  outfile: 'dist/content.js',
  bundle: true,
  format: 'iife',
  target: ['chrome110'],
  platform: 'browser',
  minify: false,
  sourcemap: false,
  define: {
    'process.env.NODE_ENV': '"production"',
    global: 'globalThis',
  },
  plugins: [
    NodeModulesPolyfillPlugin(),
    NodeGlobalsPolyfillPlugin({
      buffer: true,
      process: true,
    }),
  ],
  logLevel: 'info',
})

console.log('build ok')
