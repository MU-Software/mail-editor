import { newId } from './ids'
import type { Block, Column, Row } from '../types/schema'

export function createBlock(type: Block['type']): Block {
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

export function createEmptyColumn(blockType: Block['type'] = 'text'): Column {
  return {
    id: newId('c'),
    width: 1,
    blocks: [createBlock(blockType)],
  }
}

export function createEmptyRow(blockType: Block['type'] = 'text'): Row {
  return {
    id: newId('r'),
    columns: [createEmptyColumn(blockType)],
    styles: { paddingY: 16, paddingX: 24 },
  }
}

export function cloneBlockWithNewId(block: Block): Block {
  return { ...block, id: newId('b') }
}

function cloneColumnWithNewIds(col: Column): Column {
  return {
    ...col,
    id: newId('c'),
    blocks: col.blocks.map(cloneBlockWithNewId),
  }
}

export function cloneRowWithNewIds(row: Row): Row {
  return {
    ...row,
    id: newId('r'),
    columns: row.columns.map(cloneColumnWithNewIds),
  }
}
