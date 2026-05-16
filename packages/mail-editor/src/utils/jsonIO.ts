import { EmailDocumentSchema, type EmailDocument } from '@mu-software/mail-editor/types/schema'

export const parseEmailDocument = (json: string): EmailDocument => {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch (err) {
    throw new Error(`JSON 파싱 실패: ${err instanceof Error ? err.message : String(err)}`)
  }
  const result = EmailDocumentSchema.safeParse(parsed)
  if (!result.success) {
    const issues = result.error.issues
      .slice(0, 5)
      .map((i) => {
        const path = i.path.length > 0 ? i.path.join('.') : '(root)'
        return `  • ${path}: ${i.message}`
      })
      .join('\n')
    const more = result.error.issues.length > 5 ? `\n  ...외 ${result.error.issues.length - 5}개` : ''
    throw new Error(`유효한 EmailDocument 형식이 아닙니다:\n${issues}${more}`)
  }
  return result.data
}

export const stringifyEmailDocument = (doc: EmailDocument): string => JSON.stringify(doc, null, 2)
