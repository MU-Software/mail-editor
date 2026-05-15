import type { Block, Column, EmailDocument, Row } from '../types/schema'

export function findRow(doc: EmailDocument, rowId: string): Row | undefined {
  return doc.rows.find((r) => r.id === rowId)
}

export function findColumnWithRow(
  doc: EmailDocument,
  columnId: string,
): { row: Row; col: Column; index: number } | undefined {
  for (const row of doc.rows) {
    const index = row.columns.findIndex((c) => c.id === columnId)
    if (index !== -1) return { row, col: row.columns[index], index }
  }
  return undefined
}

export function findColumn(
  doc: EmailDocument,
  columnId: string,
): Column | undefined {
  return findColumnWithRow(doc, columnId)?.col
}

export function findBlock(
  doc: EmailDocument,
  blockId: string,
): Block | undefined {
  for (const row of doc.rows) {
    for (const col of row.columns) {
      const b = col.blocks.find((blk) => blk.id === blockId)
      if (b) return b
    }
  }
  return undefined
}

export function findBlockContext(
  doc: EmailDocument,
  blockId: string,
): { col: Column; index: number } | undefined {
  for (const row of doc.rows) {
    for (const col of row.columns) {
      const idx = col.blocks.findIndex((b) => b.id === blockId)
      if (idx !== -1) return { col, index: idx }
    }
  }
  return undefined
}
