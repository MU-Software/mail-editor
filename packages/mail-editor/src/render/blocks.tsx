import { Button, Heading, Hr, Img, Link, Text } from '@react-email/components'
import { Fragment, type ReactElement } from 'react'

import type {
  Block,
  ButtonBlock,
  DescriptionListBlock,
  HeadingBlock,
  HrBlock,
  ImageBlock,
  OrderedListBlock,
  SpacerBlock,
  TextBlock,
  UnorderedListBlock,
} from '@musoftware/mail-editor/types/schema'

import { buttonContainerStyle, buttonStyle, headingStyle, hrStyle, imageContainerStyle, imageInlineStyle, listStyle, textStyle } from './styles'
import { substituteVariables } from './variables'

type Sample = Record<string, string>

const renderTextBlock = (block: TextBlock, sample: Sample) => (
  <Text
    style={textStyle(block.styles)}
    dangerouslySetInnerHTML={{
      __html: substituteVariables(block.content, sample),
    }}
  />
)

const renderHeadingBlock = (block: HeadingBlock, sample: Sample) => (
  <Heading
    as={`h${block.level}`}
    style={headingStyle(block.styles)}
    dangerouslySetInnerHTML={{
      __html: substituteVariables(block.content, sample),
    }}
  />
)

const renderImageBlock = (block: ImageBlock) => {
  const img = <Img src={block.src} alt={block.alt} width={block.width} height={block.height} style={imageInlineStyle(block.styles)} />
  const wrapped = block.href ? <Link href={block.href}>{img}</Link> : img
  return <span style={imageContainerStyle(block.styles)}>{wrapped}</span>
}

const renderButtonBlock = (block: ButtonBlock, sample: Sample) => (
  <span style={buttonContainerStyle(block.styles)}>
    <Button href={block.href} style={buttonStyle(block.styles)}>
      <span
        dangerouslySetInnerHTML={{
          __html: substituteVariables(block.label, sample),
        }}
      />
    </Button>
  </span>
)

const renderHrBlock = (block: HrBlock) => <Hr style={hrStyle(block.styles)} />

const renderSpacerBlock = (block: SpacerBlock) => <div style={{ height: block.height, lineHeight: 0 }} />

const renderOrderedListBlock = (block: OrderedListBlock, sample: Sample) => (
  <ol style={listStyle(block.styles)}>
    {block.items.map((item, i) => (
      <li key={i} dangerouslySetInnerHTML={{ __html: substituteVariables(item, sample) }} />
    ))}
  </ol>
)

const renderUnorderedListBlock = (block: UnorderedListBlock, sample: Sample) => (
  <ul style={listStyle(block.styles)}>
    {block.items.map((item, i) => (
      <li key={i} dangerouslySetInnerHTML={{ __html: substituteVariables(item, sample) }} />
    ))}
  </ul>
)

const renderDescriptionListBlock = (block: DescriptionListBlock, sample: Sample) => (
  <dl style={textStyle(block.styles)}>
    {block.items.map((item, i) => (
      <Fragment key={i}>
        <dt
          style={{ fontWeight: 'bold' }}
          dangerouslySetInnerHTML={{
            __html: substituteVariables(item.term, sample),
          }}
        />
        <dd
          style={{ marginLeft: 24 }}
          dangerouslySetInnerHTML={{
            __html: substituteVariables(item.description, sample),
          }}
        />
      </Fragment>
    ))}
  </dl>
)

export const renderBlock = (block: Block, sample: Sample): ReactElement => {
  switch (block.type) {
    case 'text':
      return renderTextBlock(block, sample)
    case 'heading':
      return renderHeadingBlock(block, sample)
    case 'image':
      return renderImageBlock(block)
    case 'button':
      return renderButtonBlock(block, sample)
    case 'hr':
      return renderHrBlock(block)
    case 'spacer':
      return renderSpacerBlock(block)
    case 'orderedList':
      return renderOrderedListBlock(block, sample)
    case 'unorderedList':
      return renderUnorderedListBlock(block, sample)
    case 'descriptionList':
      return renderDescriptionListBlock(block, sample)
  }
}
