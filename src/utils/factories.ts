import type {
  Block,
  ButtonBlock,
  Column,
  DescriptionListBlock,
  HeadingBlock,
  HrBlock,
  ImageBlock,
  OrderedListBlock,
  Row,
  SpacerBlock,
  TextBlock,
  UnorderedListBlock,
} from '../types/schema'
import { newId } from './ids'

export function createTextBlock(): TextBlock {
  return {
    id: newId('b'),
    type: 'text',
    content: '여기에 내용을 입력하세요',
    styles: { fontSize: 14, lineHeight: 1.5 },
  }
}

export function createHeadingBlock(): HeadingBlock {
  return {
    id: newId('b'),
    type: 'heading',
    level: 2,
    content: '제목',
  }
}

export function createImageBlock(): ImageBlock {
  return {
    id: newId('b'),
    type: 'image',
    src: 'https://placehold.co/600x300?text=Image',
    alt: '',
    width: 600,
    height: 300,
  }
}

export function createButtonBlock(): ButtonBlock {
  return {
    id: newId('b'),
    type: 'button',
    label: '버튼',
    href: 'https://example.com',
  }
}

export function createHrBlock(): HrBlock {
  return { id: newId('b'), type: 'hr' }
}

export function createSpacerBlock(): SpacerBlock {
  return { id: newId('b'), type: 'spacer', height: 16 }
}

export function createOrderedListBlock(): OrderedListBlock {
  return {
    id: newId('b'),
    type: 'orderedList',
    items: ['항목 1', '항목 2', '항목 3'],
    styles: { fontSize: 14, lineHeight: 1.5 },
  }
}

export function createUnorderedListBlock(): UnorderedListBlock {
  return {
    id: newId('b'),
    type: 'unorderedList',
    items: ['항목 1', '항목 2', '항목 3'],
    styles: { fontSize: 14, lineHeight: 1.5 },
  }
}

export function createDescriptionListBlock(): DescriptionListBlock {
  return {
    id: newId('b'),
    type: 'descriptionList',
    items: [
      { term: '용어', description: '정의' },
      { term: '용어', description: '정의' },
    ],
    styles: { fontSize: 14, lineHeight: 1.5 },
  }
}

export function createBlock(type: Block['type']): Block {
  switch (type) {
    case 'text':
      return createTextBlock()
    case 'heading':
      return createHeadingBlock()
    case 'image':
      return createImageBlock()
    case 'button':
      return createButtonBlock()
    case 'hr':
      return createHrBlock()
    case 'spacer':
      return createSpacerBlock()
    case 'orderedList':
      return createOrderedListBlock()
    case 'unorderedList':
      return createUnorderedListBlock()
    case 'descriptionList':
      return createDescriptionListBlock()
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

export function cloneColumnWithNewIds(col: Column): Column {
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
