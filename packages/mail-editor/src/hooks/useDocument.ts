import { useDocumentStore } from '@mu-software/mail-editor/store/store'
import type { DocumentActions, Selection, UndoControls } from '@mu-software/mail-editor/store/types'
import type { Block, Column, EmailDocument, Row } from '@mu-software/mail-editor/types/schema'
import { findBlock, findColumn, findRow } from '@mu-software/mail-editor/utils/locate'
import { useShallow } from 'zustand/shallow'

export const useDocument = <T>(selector: (doc: EmailDocument) => T): T => useDocumentStore((state) => selector(state.doc))

export const useSelection = (): Selection | null => useDocumentStore((state) => state.selection)

export const useShowRawVariables = (): boolean => useDocumentStore((state) => state.showRawVariables)

export const useSetShowRawVariables = (): ((value: boolean) => void) => useDocumentStore((state) => state.setShowRawVariables)

export const useSelectedBlockId = (): string | null => useDocumentStore((state) => (state.selection?.kind === 'block' ? state.selection.id : null))

export const useSelectedRowId = (): string | null => useDocumentStore((state) => (state.selection?.kind === 'row' ? state.selection.id : null))

export const useSelectedColumnId = (): string | null => useDocumentStore((state) => (state.selection?.kind === 'column' ? state.selection.id : null))

export const useSelectedTarget = ():
  { kind: 'document'; obj: EmailDocument } | { kind: 'row'; obj: Row } | { kind: 'column'; obj: Column } | { kind: 'block'; obj: Block } | null =>
  useDocumentStore(
    useShallow((state) => {
      const sel = state.selection
      if (!sel) return null
      switch (sel.kind) {
        case 'document':
          return { kind: 'document' as const, obj: state.doc }
        case 'row': {
          const row = findRow(state.doc, sel.id)
          return row ? { kind: 'row' as const, obj: row } : null
        }
        case 'column': {
          const col = findColumn(state.doc, sel.id)
          return col ? { kind: 'column' as const, obj: col } : null
        }
        case 'block': {
          const b = findBlock(state.doc, sel.id)
          return b ? { kind: 'block' as const, obj: b } : null
        }
      }
    }),
  )

export const useActions = (): DocumentActions =>
  useDocumentStore(
    useShallow((state) => ({
      resetDocument: state.resetDocument,
      replaceDocument: state.replaceDocument,
      addRow: state.addRow,
      removeRow: state.removeRow,
      moveRow: state.moveRow,
      duplicateRow: state.duplicateRow,
      insertColumnBefore: state.insertColumnBefore,
      insertColumnAfter: state.insertColumnAfter,
      moveColumn: state.moveColumn,
      removeColumn: state.removeColumn,
      addBlock: state.addBlock,
      insertBlockBefore: state.insertBlockBefore,
      insertBlockAfter: state.insertBlockAfter,
      removeBlock: state.removeBlock,
      moveBlock: state.moveBlock,
      duplicateBlock: state.duplicateBlock,
      updateFieldAt: state.updateFieldAt,
      setSampleValue: state.setSampleValue,
      removeSampleValue: state.removeSampleValue,
      setSelection: state.setSelection,
    })),
  )

export const useUndo = (): UndoControls =>
  useDocumentStore(
    useShallow((state) => ({
      undo: state.undo,
      redo: state.redo,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
    })),
  )
