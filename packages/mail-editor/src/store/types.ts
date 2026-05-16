import type { Block, EmailDocument } from '@mu-software/mail-editor/types/schema'

export type Selection = { kind: 'document' } | { kind: 'row'; id: string } | { kind: 'column'; id: string } | { kind: 'block'; id: string }

export type DocumentActions = {
  resetDocument: (doc: EmailDocument) => void
  replaceDocument: (doc: EmailDocument) => void

  addRow: (atIndex: number, blockType?: Block['type']) => void
  removeRow: (rowId: string) => void
  moveRow: (rowId: string, direction: 'up' | 'down') => void
  duplicateRow: (rowId: string) => void

  insertColumnBefore: (columnId: string, blockType?: Block['type']) => void
  insertColumnAfter: (columnId: string, blockType?: Block['type']) => void
  moveColumn: (columnId: string, direction: 'left' | 'right') => void
  removeColumn: (columnId: string) => void

  addBlock: (columnId: string, type: Block['type']) => void
  insertBlockBefore: (blockId: string, type: Block['type']) => void
  insertBlockAfter: (blockId: string, type: Block['type']) => void
  removeBlock: (blockId: string) => void
  moveBlock: (blockId: string, direction: 'up' | 'down') => void
  duplicateBlock: (blockId: string) => void
  updateFieldAt: (target: Selection, path: readonly string[], value: unknown) => void

  setSampleValue: (name: string, value: string) => void
  removeSampleValue: (name: string) => void

  setSelection: (selection: Selection | null) => void
}

export type UndoControls = {
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}
