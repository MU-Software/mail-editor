import { VAR_PATTERN } from '../render/variables'
import type { EmailDocument } from '../types/schema'

function collect(text: string | undefined, into: Set<string>) {
  if (!text) return
  for (const match of text.matchAll(VAR_PATTERN)) {
    into.add(match[1])
  }
}

export function extractVariableNames(doc: EmailDocument): string[] {
  const found = new Set<string>()
  collect(doc.meta.subject, found)
  collect(doc.meta.preview, found)

  for (const row of doc.rows) {
    for (const col of row.columns) {
      for (const block of col.blocks) {
        switch (block.type) {
          case 'text':
          case 'heading':
            collect(block.content, found)
            break
          case 'button':
            collect(block.label, found)
            collect(block.href, found)
            break
          case 'image':
            collect(block.src, found)
            collect(block.alt, found)
            collect(block.href, found)
            break
          case 'orderedList':
          case 'unorderedList':
            for (const item of block.items) collect(item, found)
            break
          case 'descriptionList':
            for (const item of block.items) {
              collect(item.term, found)
              collect(item.description, found)
            }
            break
        }
      }
    }
  }
  return Array.from(found).sort()
}
