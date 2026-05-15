import { z } from 'zod'

const TextAlignSchema = z.enum(['left', 'center', 'right'])

const BorderStyleSchema = z.enum(['none', 'solid', 'dashed', 'dotted', 'double'])

const BorderFieldsSchema = {
  borderWidth: z.number().optional(),
  borderStyle: BorderStyleSchema.optional(),
  borderColor: z.string().optional(),
}

const TextBlockSchema = z.object({
  id: z.string(),
  type: z.literal('text'),
  content: z.string(),
  styles: z
    .object({
      color: z.string().optional(),
      fontSize: z.number().optional(),
      textAlign: TextAlignSchema.optional(),
      lineHeight: z.number().optional(),
    })
    .optional(),
})

const HeadingBlockSchema = z.object({
  id: z.string(),
  type: z.literal('heading'),
  level: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
  ]),
  content: z.string(),
  styles: z
    .object({
      color: z.string().optional(),
      textAlign: TextAlignSchema.optional(),
    })
    .optional(),
})

const ImageBlockSchema = z.object({
  id: z.string(),
  type: z.literal('image'),
  src: z.string(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  href: z.string().optional(),
  styles: z
    .object({
      textAlign: TextAlignSchema.optional(),
      borderRadius: z.number().optional(),
      ...BorderFieldsSchema,
    })
    .optional(),
})

const ButtonBlockSchema = z.object({
  id: z.string(),
  type: z.literal('button'),
  label: z.string(),
  href: z.string(),
  styles: z
    .object({
      backgroundColor: z.string().optional(),
      color: z.string().optional(),
      borderRadius: z.number().optional(),
      paddingY: z.number().optional(),
      paddingX: z.number().optional(),
      fontSize: z.number().optional(),
      textAlign: TextAlignSchema.optional(),
      ...BorderFieldsSchema,
    })
    .optional(),
})

const HrBlockSchema = z.object({
  id: z.string(),
  type: z.literal('hr'),
  styles: z
    .object({
      color: z.string().optional(),
      thickness: z.number().optional(),
    })
    .optional(),
})

const SpacerBlockSchema = z.object({
  id: z.string(),
  type: z.literal('spacer'),
  height: z.number(),
})

const ListStylesSchema = z
  .object({
    color: z.string().optional(),
    fontSize: z.number().optional(),
    lineHeight: z.number().optional(),
  })
  .optional()

const OrderedListBlockSchema = z.object({
  id: z.string(),
  type: z.literal('orderedList'),
  items: z.array(z.string()),
  styles: ListStylesSchema,
})

const UnorderedListBlockSchema = z.object({
  id: z.string(),
  type: z.literal('unorderedList'),
  items: z.array(z.string()),
  styles: ListStylesSchema,
})

const DescriptionListBlockSchema = z.object({
  id: z.string(),
  type: z.literal('descriptionList'),
  items: z.array(
    z.object({
      term: z.string(),
      description: z.string(),
    }),
  ),
  styles: ListStylesSchema,
})

export const BlockSchema = z.discriminatedUnion('type', [
  TextBlockSchema,
  HeadingBlockSchema,
  ImageBlockSchema,
  ButtonBlockSchema,
  HrBlockSchema,
  SpacerBlockSchema,
  OrderedListBlockSchema,
  UnorderedListBlockSchema,
  DescriptionListBlockSchema,
])

export const ColumnSchema = z.object({
  id: z.string(),
  width: z.number(),
  blocks: z.array(BlockSchema),
  styles: z
    .object({
      paddingY: z.number().optional(),
      paddingX: z.number().optional(),
      verticalAlign: z.enum(['top', 'middle', 'bottom']).optional(),
      backgroundColor: z.string().optional(),
      borderRadius: z.number().optional(),
      ...BorderFieldsSchema,
    })
    .optional(),
})

export const RowSchema = z.object({
  id: z.string(),
  columns: z.array(ColumnSchema),
  styles: z
    .object({
      backgroundColor: z.string().optional(),
      paddingY: z.number().optional(),
      paddingX: z.number().optional(),
      textAlign: TextAlignSchema.optional(),
      borderRadius: z.number().optional(),
      ...BorderFieldsSchema,
    })
    .optional(),
})

export const EmailDocumentSchema = z.object({
  version: z.literal(1),
  meta: z.object({
    subject: z.string().optional(),
    preview: z.string().optional(),
  }),
  styles: z.object({
    backgroundColor: z.string().optional(),
    contentBackgroundColor: z.string().optional(),
    fontFamily: z.string().optional(),
    width: z.number().optional(),
  }),
  rows: z.array(RowSchema),
  sampleValues: z.record(z.string(), z.string()),
})

export type TextBlock = z.infer<typeof TextBlockSchema>
export type HeadingBlock = z.infer<typeof HeadingBlockSchema>
export type ImageBlock = z.infer<typeof ImageBlockSchema>
export type ButtonBlock = z.infer<typeof ButtonBlockSchema>
export type HrBlock = z.infer<typeof HrBlockSchema>
export type SpacerBlock = z.infer<typeof SpacerBlockSchema>
export type OrderedListBlock = z.infer<typeof OrderedListBlockSchema>
export type UnorderedListBlock = z.infer<typeof UnorderedListBlockSchema>
export type DescriptionListBlock = z.infer<typeof DescriptionListBlockSchema>
export type Block = z.infer<typeof BlockSchema>
export type Column = z.infer<typeof ColumnSchema>
export type Row = z.infer<typeof RowSchema>
export type EmailDocument = z.infer<typeof EmailDocumentSchema>
