/**
 * Shim to fix @next/env CJS/ESM interop when running via tsx.
 * Payload's compiled code does `import nextEnvImport from '@next/env'`
 * which tsx transforms to `require('@next/env')`. But @next/env sets
 * __esModule: true without a .default export, so `nextEnvImport` is the
 * whole module object and `nextEnvImport.default` is undefined.
 *
 * This shim patches Module._resolveFilename to intercept @next/env
 * and instead return a wrapper that adds a .default property.
 */
const Module = require('module')
const path = require('path')

// Load .env.local first
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') })

// Patch: make @next/env work with tsx's CJS interop
const originalResolve = Module._resolveFilename
Module._resolveFilename = function (request, ...args) {
  if (request === '@next/env') {
    const realPath = originalResolve.call(this, request, ...args)
    const mod = require(realPath)
    if (!mod.default) {
      mod.default = mod
    }
    return realPath
  }
  return originalResolve.call(this, request, ...args)
}
