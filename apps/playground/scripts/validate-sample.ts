import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { EmailDocumentSchema } from '@mu-software/mail-editor/types/schema'

const here = dirname(fileURLToPath(import.meta.url))
const samplePath = resolve(here, '../src/data/sampleDocument.json')

let raw: unknown
try {
  raw = JSON.parse(readFileSync(samplePath, 'utf-8'))
} catch (err) {
  console.error(`sampleDocument.json: JSON 파싱 실패\n  ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
}

const result = EmailDocumentSchema.safeParse(raw)
if (!result.success) {
  const issues = result.error.issues
    .slice(0, 10)
    .map((i) => {
      const path = i.path.length > 0 ? i.path.join('.') : '(root)'
      return `  • ${path}: ${i.message}`
    })
    .join('\n')
  const more = result.error.issues.length > 10 ? `\n  ...외 ${result.error.issues.length - 10}개` : ''
  console.error(`sampleDocument.json: 유효한 EmailDocument 형식이 아닙니다.\n${issues}${more}`)
  process.exit(1)
}
