import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { isDeepStrictEqual } from 'node:util'

import { encode, decode, neighbours } from '../dist/core.js'
import { createGTagLadder, nearbyFilter } from '../dist/nostr.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const vectorsDir = path.join(rootDir, 'vectors')

const handlers = {
  'core.encode': (input) => encode(input.lat, input.lon, input.precision),
  'core.decode': (input) => decode(input),
  'core.neighbours': (input) => neighbours(input),
  'nostr.createGTagLadder': (input) => createGTagLadder(input.geohash, input.minPrecision),
  'nostr.nearbyFilter': (input) => nearbyFilter(input.lat, input.lon, input.options),
}

const files = readdirSync(vectorsDir)
  .filter((name) => name.endsWith('.json') && name !== 'schema.json')
  .sort()

if (files.length === 0) {
  console.error('[vectors] No vector files found in vectors/')
  process.exit(1)
}

const failures = []
let caseCount = 0

for (const fileName of files) {
  const fullPath = path.join(vectorsDir, fileName)
  let vectorFile
  try {
    vectorFile = JSON.parse(readFileSync(fullPath, 'utf8'))
  } catch (error) {
    failures.push({
      fileName,
      message: `Failed to parse JSON: ${String(error)}`,
    })
    continue
  }

  const topLevelError = validateTopLevel(vectorFile)
  if (topLevelError) {
    failures.push({ fileName, message: topLevelError })
    continue
  }

  const key = `${vectorFile.module}.${vectorFile.function}`
  const handler = handlers[key]

  if (!handler) {
    failures.push({
      fileName,
      message: `No checker handler registered for ${key}`,
    })
    continue
  }

  for (const entry of vectorFile.cases) {
    caseCount++
    if (!entry || typeof entry !== 'object') {
      failures.push({
        fileName,
        message: 'Each case must be an object with id/input/expected',
      })
      continue
    }

    const { id, input, expected } = entry
    if (typeof id !== 'string' || id.length === 0) {
      failures.push({
        fileName,
        message: 'Each case must have a non-empty string id',
      })
      continue
    }

    let actual
    try {
      actual = handler(input)
    } catch (error) {
      failures.push({
        fileName,
        message: `Case "${id}" threw an error: ${String(error)}`,
      })
      continue
    }

    if (!isDeepStrictEqual(actual, expected)) {
      failures.push({
        fileName,
        message:
          `Case "${id}" mismatch.\n` +
          `Expected: ${JSON.stringify(expected)}\n` +
          `Actual:   ${JSON.stringify(actual)}`,
      })
    }
  }
}

if (failures.length > 0) {
  console.error('[vectors] Compatibility vector check failed.')
  for (const failure of failures) {
    console.error(`- ${failure.fileName}: ${failure.message}`)
  }
  console.error('[vectors] If this change is intentional, update vectors and include a changelog note.')
  process.exit(1)
}

console.log(`[vectors] OK (${files.length} files, ${caseCount} cases).`)

function validateTopLevel(vectorFile) {
  if (!vectorFile || typeof vectorFile !== 'object') {
    return 'Vector file must be a JSON object'
  }
  if (vectorFile.schemaVersion !== 1) {
    return `Unsupported schemaVersion: ${String(vectorFile.schemaVersion)}`
  }
  if (typeof vectorFile.module !== 'string' || vectorFile.module.length === 0) {
    return 'Missing or invalid "module"'
  }
  if (typeof vectorFile.function !== 'string' || vectorFile.function.length === 0) {
    return 'Missing or invalid "function"'
  }
  if (!Array.isArray(vectorFile.cases) || vectorFile.cases.length === 0) {
    return 'Missing or empty "cases" array'
  }
  return null
}
