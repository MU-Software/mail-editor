import { current } from 'immer'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import type { DocumentActions, Selection } from './types'
import { sampleDocument } from '../data/sampleDocument'
import type { EmailDocument } from '../types/schema'
import { swapInPlace } from '../utils/array'
import { cloneBlockWithNewId, cloneRowWithNewIds, createBlock, createEmptyColumn, createEmptyRow } from '../utils/factories'
import { findBlockContext, findColumn, findColumnWithRow, findRow } from '../utils/locate'
import { getAtPath, setAtPath } from '../utils/path'

const HISTORY_LIMIT = 100

type EditDirection = 'add' | 'delete'
type CoalesceInfo = { key: string; direction: EditDirection | null }

const stringEditDirection = (oldStr: string, newStr: string): EditDirection | null => {
  if (newStr.length > oldStr.length) return 'add'
  if (newStr.length < oldStr.length) return 'delete'
  return null
}

const findSingleStringLeafDiff = (oldVal: unknown, newVal: unknown): { subPath: string; oldStr: string; newStr: string } | null => {
  if (Object.is(oldVal, newVal)) return null

  if (typeof oldVal === 'string' && typeof newVal === 'string') {
    return { subPath: '', oldStr: oldVal, newStr: newVal }
  }

  if (Array.isArray(oldVal) && Array.isArray(newVal)) {
    if (oldVal.length !== newVal.length) return null
    let found: { subPath: string; oldStr: string; newStr: string } | null = null
    for (let i = 0; i < oldVal.length; i++) {
      if (Object.is(oldVal[i], newVal[i])) continue
      const sub = findSingleStringLeafDiff(oldVal[i], newVal[i])
      if (sub === null) return null
      if (found !== null) return null
      found = {
        subPath: sub.subPath ? `${i}.${sub.subPath}` : String(i),
        oldStr: sub.oldStr,
        newStr: sub.newStr,
      }
    }
    return found
  }

  if (
    typeof oldVal === 'object' &&
    oldVal !== null &&
    !Array.isArray(oldVal) &&
    typeof newVal === 'object' &&
    newVal !== null &&
    !Array.isArray(newVal)
  ) {
    const o = oldVal as Record<string, unknown>
    const n = newVal as Record<string, unknown>
    const oKeys = Object.keys(o)
    if (oKeys.length !== Object.keys(n).length) return null
    let found: { subPath: string; oldStr: string; newStr: string } | null = null
    for (const k of oKeys) {
      if (!(k in n)) return null
      if (Object.is(o[k], n[k])) continue
      const sub = findSingleStringLeafDiff(o[k], n[k])
      if (sub === null) return null
      if (found !== null) return null
      found = {
        subPath: sub.subPath ? `${k}.${sub.subPath}` : k,
        oldStr: sub.oldStr,
        newStr: sub.newStr,
      }
    }
    return found
  }

  return null
}

type DocumentState = {
  doc: EmailDocument
  past: EmailDocument[]
  future: EmailDocument[]
  selection: Selection | null
  showRawVariables: boolean
  setShowRawVariables: (value: boolean) => void
  undo: () => void
  redo: () => void
} & DocumentActions

const resolveTarget = (doc: EmailDocument, target: Selection): Record<string, unknown> | undefined => {
  switch (target.kind) {
    case 'document':
      return doc
    case 'row':
      return findRow(doc, target.id)
    case 'column':
      return findColumn(doc, target.id)
    case 'block': {
      const ctx = findBlockContext(doc, target.id)
      return ctx ? ctx.col.blocks[ctx.index] : undefined
    }
  }
}

const sameSelection = (a: Selection | null, b: Selection | null): boolean => {
  if (a === b) return true
  if (!a || !b) return false
  if (a.kind !== b.kind) return false
  if (a.kind === 'document') return true
  return (a as { id: string }).id === (b as { id: string }).id
}

export const useDocumentStore = create<DocumentState>()(
  immer((set, get) => {
    let lastEdit: CoalesceInfo | null = null

    const withHistory = (recipe: (draft: DocumentState) => void, coalesce?: CoalesceInfo) =>
      set((draft) => {
        const canMerge =
          coalesce !== undefined &&
          lastEdit !== null &&
          lastEdit.key === coalesce.key &&
          (coalesce.direction === null || lastEdit.direction === null || lastEdit.direction === coalesce.direction)

        if (!canMerge) {
          const prev = current(draft.doc)
          draft.past.push(prev)
          if (draft.past.length > HISTORY_LIMIT) draft.past.shift()
          draft.future.length = 0
        }
        if (coalesce === undefined) {
          lastEdit = null
        } else if (canMerge && coalesce.direction === null) {
          // Same-key length-stable edit (e.g., Korean IME composition):
          // preserve the prior run's direction so future edits keep merging.
        } else {
          lastEdit = coalesce
        }
        recipe(draft)
      })

    const resetCoalesce = () => {
      lastEdit = null
    }

    return {
      doc: sampleDocument,
      past: [],
      future: [],
      selection: null,
      showRawVariables: false,

      setShowRawVariables: (value) =>
        set((draft) => {
          draft.showRawVariables = value
        }),

      undo: () =>
        set((draft) => {
          if (draft.past.length === 0) return
          const prev = draft.past.pop() as EmailDocument
          draft.future.unshift(current(draft.doc))
          draft.doc = prev
          resetCoalesce()
        }),

      redo: () =>
        set((draft) => {
          if (draft.future.length === 0) return
          const next = draft.future.shift() as EmailDocument
          draft.past.push(current(draft.doc))
          draft.doc = next
          resetCoalesce()
        }),

      replaceDocument: (doc) =>
        withHistory((draft) => {
          draft.doc = doc
        }),

      addRow: (atIndex, blockType) =>
        withHistory((draft) => {
          const idx = Math.max(0, Math.min(atIndex, draft.doc.rows.length))
          draft.doc.rows.splice(idx, 0, createEmptyRow(blockType))
        }),

      removeRow: (rowId) =>
        withHistory((draft) => {
          draft.doc.rows = draft.doc.rows.filter((r) => r.id !== rowId)
          if (draft.selection?.kind === 'row' && draft.selection.id === rowId) {
            draft.selection = null
          }
        }),

      moveRow: (rowId, direction) =>
        withHistory((draft) => {
          const idx = draft.doc.rows.findIndex((r) => r.id === rowId)
          if (idx === -1) return
          swapInPlace(draft.doc.rows, idx, direction === 'up' ? idx - 1 : idx + 1)
        }),

      duplicateRow: (rowId) =>
        withHistory((draft) => {
          const idx = draft.doc.rows.findIndex((r) => r.id === rowId)
          if (idx === -1) return
          const clone = cloneRowWithNewIds(draft.doc.rows[idx])
          draft.doc.rows.splice(idx + 1, 0, clone)
        }),

      insertColumnBefore: (columnId, blockType) =>
        withHistory((draft) => {
          const ctx = findColumnWithRow(draft.doc, columnId)
          if (!ctx) return
          ctx.row.columns.splice(ctx.index, 0, createEmptyColumn(blockType))
        }),

      insertColumnAfter: (columnId, blockType) =>
        withHistory((draft) => {
          const ctx = findColumnWithRow(draft.doc, columnId)
          if (!ctx) return
          ctx.row.columns.splice(ctx.index + 1, 0, createEmptyColumn(blockType))
        }),

      moveColumn: (columnId, direction) =>
        withHistory((draft) => {
          const ctx = findColumnWithRow(draft.doc, columnId)
          if (!ctx) return
          swapInPlace(ctx.row.columns, ctx.index, direction === 'left' ? ctx.index - 1 : ctx.index + 1)
        }),

      removeColumn: (columnId) =>
        withHistory((draft) => {
          const ctx = findColumnWithRow(draft.doc, columnId)
          if (!ctx) return
          if (ctx.row.columns.length <= 1) return
          ctx.row.columns = ctx.row.columns.filter((c) => c.id !== columnId)
          if (draft.selection?.kind === 'column' && draft.selection.id === columnId) {
            draft.selection = null
          }
        }),

      addBlock: (columnId, type) =>
        withHistory((draft) => {
          const col = findColumn(draft.doc, columnId)
          if (!col) return
          col.blocks.push(createBlock(type))
        }),

      insertBlockBefore: (blockId, type) =>
        withHistory((draft) => {
          const ctx = findBlockContext(draft.doc, blockId)
          if (!ctx) return
          ctx.col.blocks.splice(ctx.index, 0, createBlock(type))
        }),

      insertBlockAfter: (blockId, type) =>
        withHistory((draft) => {
          const ctx = findBlockContext(draft.doc, blockId)
          if (!ctx) return
          ctx.col.blocks.splice(ctx.index + 1, 0, createBlock(type))
        }),

      removeBlock: (blockId) =>
        withHistory((draft) => {
          const ctx = findBlockContext(draft.doc, blockId)
          if (!ctx) return
          ctx.col.blocks.splice(ctx.index, 1)
          if (draft.selection?.kind === 'block' && draft.selection.id === blockId) {
            draft.selection = null
          }
        }),

      moveBlock: (blockId, direction) =>
        withHistory((draft) => {
          const ctx = findBlockContext(draft.doc, blockId)
          if (!ctx) return
          swapInPlace(ctx.col.blocks, ctx.index, direction === 'up' ? ctx.index - 1 : ctx.index + 1)
        }),

      duplicateBlock: (blockId) =>
        withHistory((draft) => {
          const ctx = findBlockContext(draft.doc, blockId)
          if (!ctx) return
          const clone = cloneBlockWithNewId(ctx.col.blocks[ctx.index])
          ctx.col.blocks.splice(ctx.index + 1, 0, clone)
        }),

      updateFieldAt: (target, path, value) => {
        const obj = resolveTarget(get().doc, target)
        const diff = obj ? findSingleStringLeafDiff(getAtPath(obj, path), value) : null
        const targetKey = target.kind === 'document' ? 'document' : `${target.kind}:${target.id}`
        const coalesce: CoalesceInfo | undefined = diff
          ? {
              key: `field:${targetKey}:${path.join('.')}${diff.subPath ? `.${diff.subPath}` : ''}`,
              direction: stringEditDirection(diff.oldStr, diff.newStr),
            }
          : undefined
        withHistory((draft) => {
          const o = resolveTarget(draft.doc, target)
          if (!o) return
          setAtPath(o, path, value)
        }, coalesce)
      },

      setSampleValue: (name, value) => {
        const oldValue = get().doc.sampleValues[name]
        const coalesce: CoalesceInfo | undefined =
          typeof oldValue === 'string'
            ? {
                key: `sample:${name}`,
                direction: stringEditDirection(oldValue, value),
              }
            : undefined
        withHistory((draft) => {
          draft.doc.sampleValues[name] = value
        }, coalesce)
      },

      removeSampleValue: (name) =>
        withHistory((draft) => {
          delete draft.doc.sampleValues[name]
        }),

      setSelection: (selection) =>
        set((draft) => {
          if (sameSelection(draft.selection, selection)) return
          draft.selection = selection
        }),
    }
  }),
)
