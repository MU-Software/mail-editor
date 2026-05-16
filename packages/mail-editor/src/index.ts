export { MailEditor, type MailEditorHandle, type MailEditorProps } from './MailEditor'

export {
  EmailDocumentSchema,
  RowSchema,
  ColumnSchema,
  BlockSchema,
  type EmailDocument,
  type Row,
  type Column,
  type Block,
  type TextBlock,
  type HeadingBlock,
  type ImageBlock,
  type ButtonBlock,
  type HrBlock,
  type SpacerBlock,
  type OrderedListBlock,
  type UnorderedListBlock,
  type DescriptionListBlock,
} from './types/schema'

export { parseEmailDocument, stringifyEmailDocument } from './utils/jsonIO'

export { createBlock, createEmptyColumn, createEmptyDocument, createEmptyRow } from './utils/factories'
