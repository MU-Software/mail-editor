import { VAR_PATTERN } from '@mu-software/mail-editor/render/variables'

export type ValidationOk = { ok: true }
export type ValidationFail = { ok: false; message: string }
export type ValidationResult = ValidationOk | ValidationFail

const VALID: ValidationOk = { ok: true }

const DANGEROUS_HREF_PATTERN = /^\s*(javascript|vbscript)\s*:/i

export const validateHref = (value: unknown, options: { required: boolean }): ValidationResult => {
  const raw = typeof value === 'string' ? value : ''
  const trimmed = raw.trim()
  if (trimmed === '') {
    return options.required ? { ok: false, message: 'href는 비워둘 수 없습니다.' } : VALID
  }
  if (DANGEROUS_HREF_PATTERN.test(trimmed)) {
    return {
      ok: false,
      message: `위험한 URL 스킴이 감지되었습니다: "${trimmed.split(':')[0]}:". 이런 링크는 메일 클라이언트에서 차단되거나 보안 위험이 됩니다.`,
    }
  }
  return VALID
}

export const warnIfAltMissing = (value: unknown): string | undefined => {
  const raw = typeof value === 'string' ? value : ''
  if (raw.trim() === '') {
    return '접근성을 위해 alt 텍스트를 작성해주세요. Gmail 등에서 이미지가 차단될 때 대체 텍스트로 표시됩니다.'
  }
  return undefined
}

type Marks = {
  bold: boolean
  italic: boolean
  underline: boolean
  strike: boolean
  link: string | null
  color: string | null
  highlight: string | null
}

const ZERO_MARKS: Marks = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  link: null,
  color: null,
  highlight: null,
}

const readInlineStyle = (el: Element, prop: string): string | null => {
  const style = (el as HTMLElement).style
  const value = style?.getPropertyValue(prop)?.trim()
  return value ? value : null
}

const marksWithElement = (el: Element, parent: Marks): Marks => {
  const tag = el.tagName.toLowerCase()
  let next = parent
  if (tag === 'strong' || tag === 'b') next = { ...next, bold: true }
  if (tag === 'em' || tag === 'i') next = { ...next, italic: true }
  if (tag === 'u') next = { ...next, underline: true }
  if (tag === 's' || tag === 'strike' || tag === 'del') next = { ...next, strike: true }
  if (tag === 'a') {
    const href = (el as HTMLAnchorElement).getAttribute('href') ?? ''
    next = { ...next, link: href }
  }
  const color = readInlineStyle(el, 'color')
  if (color) next = { ...next, color }
  const bg = readInlineStyle(el, 'background-color')
  if (tag === 'mark' || bg) {
    next = { ...next, highlight: bg ?? 'mark' }
  }
  return next
}

const marksEqual = (a: Marks, b: Marks): boolean =>
  a.bold === b.bold &&
  a.italic === b.italic &&
  a.underline === b.underline &&
  a.strike === b.strike &&
  a.link === b.link &&
  a.color === b.color &&
  a.highlight === b.highlight

const walkForMarks = (node: Node, marks: Marks, text: string[], marksOut: Marks[]) => {
  if (node.nodeType === Node.TEXT_NODE) {
    const t = node.textContent ?? ''
    for (const ch of t) {
      text.push(ch)
      marksOut.push(marks)
    }
    return
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return
  const el = node as Element
  const tag = el.tagName.toLowerCase()
  if (tag === 'br') {
    text.push('\n')
    marksOut.push(marks)
    return
  }
  const next = marksWithElement(el, marks)
  for (const child of Array.from(el.childNodes)) {
    walkForMarks(child, next, text, marksOut)
  }
}

export const validateVariableMarkIntegrity = (html: string): ValidationResult => {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html')
  const container = doc.body.firstChild as Element | null
  if (!container) return VALID
  const text: string[] = []
  const marks: Marks[] = []
  walkForMarks(container, ZERO_MARKS, text, marks)
  const joined = text.join('')
  for (const match of joined.matchAll(VAR_PATTERN)) {
    const start = match.index ?? 0
    const end = start + match[0].length
    const first = marks[start]
    for (let i = start + 1; i < end; i++) {
      if (!marksEqual(first, marks[i])) {
        return {
          ok: false,
          message: `템플릿 변수 "${match[0]}" 내부에 서로 다른 서식이 적용되어 있습니다. 변수는 전체에 동일한 서식이 적용되어야 합니다.`,
        }
      }
    }
  }
  return VALID
}
