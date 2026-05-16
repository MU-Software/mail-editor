import type { Block, Column, EmailDocument, Row } from '@mu-software/mail-editor/types/schema'

import { newId } from './ids'

export const createEmptyDocument = (): EmailDocument => ({
  version: 1,
  meta: {},
  styles: {},
  rows: [],
  sampleValues: {},
})

export const createBlock = (type: Block['type']): Block => {
  const id = newId('b')
  switch (type) {
    case 'text':
      return {
        id,
        type,
        content: '여기에 내용을 입력하세요',
        styles: { fontSize: 14, lineHeight: 1.5 },
      }
    case 'heading':
      return { id, type, level: 2, content: '제목' }
    case 'image':
      return {
        id,
        type,
        src: 'https://placehold.co/600x300?text=Image',
        alt: '',
        width: 600,
        height: 300,
      }
    case 'button':
      return { id, type, label: '버튼', href: 'https://example.com' }
    case 'hr':
      return { id, type }
    case 'spacer':
      return { id, type, height: 16 }
    case 'orderedList':
    case 'unorderedList':
      return {
        id,
        type,
        items: ['항목 1', '항목 2', '항목 3'],
        styles: { fontSize: 14, lineHeight: 1.5 },
      }
    case 'descriptionList':
      return {
        id,
        type,
        items: [
          { term: '용어', description: '정의' },
          { term: '용어', description: '정의' },
        ],
        styles: { fontSize: 14, lineHeight: 1.5 },
      }
  }
}

export const createEmptyColumn = (blockType: Block['type'] = 'text'): Column => ({
  id: newId('c'),
  width: 1,
  blocks: [createBlock(blockType)],
})

export const createEmptyRow = (blockType: Block['type'] = 'text'): Row => ({
  id: newId('r'),
  columns: [createEmptyColumn(blockType)],
  styles: { paddingY: 16, paddingX: 24 },
})

export const cloneBlockWithNewId = (block: Block): Block => ({ ...block, id: newId('b') })

const cloneColumnWithNewIds = (col: Column): Column => ({
  ...col,
  id: newId('c'),
  blocks: col.blocks.map(cloneBlockWithNewId),
})

export const cloneRowWithNewIds = (row: Row): Row => ({
  ...row,
  id: newId('r'),
  columns: row.columns.map(cloneColumnWithNewIds),
})
