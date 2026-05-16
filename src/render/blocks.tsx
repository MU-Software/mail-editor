import { Button, Heading, Hr, Img, Link, Text } from '@react-email/components'
import { Fragment, type ReactElement } from 'react'

import { buttonContainerStyle, buttonStyle, headingStyle, hrStyle, imageContainerStyle, imageInlineStyle, listStyle, textStyle } from './styles'
import { substituteVariables } from './variables'
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
} from '../types/schema'

type Sample = Record<string, string>

function renderTextBlock(block: TextBlock, sample: Sample) {
  return (
    <Text
      style={textStyle(block.styles)}
      dangerouslySetInnerHTML={{
        __html: substituteVariables(block.content, sample),
      }}
    />
  )
}

function renderHeadingBlock(block: HeadingBlock, sample: Sample) {
  return (
    <Heading
      as={`h${block.level}`}
      style={headingStyle(block.styles)}
      dangerouslySetInnerHTML={{
        __html: substituteVariables(block.content, sample),
      }}
    />
  )
}

function renderImageBlock(block: ImageBlock) {
  const img = <Img src={block.src} alt={block.alt} width={block.width} height={block.height} style={imageInlineStyle(block.styles)} />
  const wrapped = block.href ? <Link href={block.href}>{img}</Link> : img
  return <span style={imageContainerStyle(block.styles)}>{wrapped}</span>
}

function renderButtonBlock(block: ButtonBlock, sample: Sample) {
  return (
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
}

function renderHrBlock(block: HrBlock) {
  return <Hr style={hrStyle(block.styles)} />
}

function renderSpacerBlock(block: SpacerBlock) {
  return <div style={{ height: block.height, lineHeight: 0 }} />
}

function renderOrderedListBlock(block: OrderedListBlock, sample: Sample) {
  return (
    <ol style={listStyle(block.styles)}>
      {block.items.map((item, i) => (
        <li key={i} dangerouslySetInnerHTML={{ __html: substituteVariables(item, sample) }} />
      ))}
    </ol>
  )
}

function renderUnorderedListBlock(block: UnorderedListBlock, sample: Sample) {
  return (
    <ul style={listStyle(block.styles)}>
      {block.items.map((item, i) => (
        <li key={i} dangerouslySetInnerHTML={{ __html: substituteVariables(item, sample) }} />
      ))}
    </ul>
  )
}

function renderDescriptionListBlock(block: DescriptionListBlock, sample: Sample) {
  return (
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
}

export function renderBlock(block: Block, sample: Sample): ReactElement {
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
