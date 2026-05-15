import { Button, Heading, Hr, Img, Link, Text } from '@react-email/components'
import { memo, useState, type CSSProperties } from 'react'
import { useActions } from '../hooks/useDocument'
import { renderBlock } from '../render/blocks'
import {
  buttonContainerStyle,
  buttonStyle,
  headingStyle,
  hrStyle,
  imageContainerStyle,
  imageInlineStyle,
  textStyle,
} from '../render/styles'
import { substituteVariables } from '../render/variables'
import type {
  Block,
  ButtonBlock,
  HeadingBlock,
  HrBlock,
  ImageBlock,
  SpacerBlock,
  TextBlock,
} from '../types/schema'
import { BlockShell } from './BlockShell'
import { InlineTextEditor } from './InlineTextEditor'

type Sample = Record<string, string>

const HEADING_LEVEL_FONT_SIZE: Record<HeadingBlock['level'], string> = {
  1: '2em',
  2: '1.5em',
  3: '1.17em',
  4: '1em',
  5: '0.83em',
  6: '0.67em',
}

function headingEditStyle(block: HeadingBlock): CSSProperties {
  return {
    fontSize: HEADING_LEVEL_FONT_SIZE[block.level],
    fontWeight: 'bold',
    margin: 0,
    ...headingStyle(block.styles),
  }
}

function EditableText({
  block,
  sample,
}: {
  block: TextBlock
  sample: Sample
}) {
  const { updateFieldAt } = useActions()
  const [editing, setEditing] = useState(false)

  const commit = (html: string) => {
    if (html !== block.content) {
      updateFieldAt({ kind: 'block', id: block.id }, ['content'], html)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <InlineTextEditor
        key={`edit-${block.id}`}
        initialHtml={block.content}
        onCommit={commit}
        onCancel={() => setEditing(false)}
        style={textStyle(block.styles)}
      />
    )
  }

  return (
    <Text
      style={textStyle(block.styles)}
      onClick={() => setEditing(true)}
      dangerouslySetInnerHTML={{
        __html: substituteVariables(block.content, sample),
      }}
    />
  )
}

function EditableHeading({
  block,
  sample,
}: {
  block: HeadingBlock
  sample: Sample
}) {
  const { updateFieldAt } = useActions()
  const [editing, setEditing] = useState(false)
  const Tag = `h${block.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

  const commit = (html: string) => {
    if (html !== block.content) {
      updateFieldAt({ kind: 'block', id: block.id }, ['content'], html)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <InlineTextEditor
        key={`edit-${block.id}`}
        initialHtml={block.content}
        onCommit={commit}
        onCancel={() => setEditing(false)}
        style={headingEditStyle(block)}
      />
    )
  }

  return (
    <Heading
      as={Tag}
      style={headingStyle(block.styles)}
      onClick={() => setEditing(true)}
      dangerouslySetInnerHTML={{
        __html: substituteVariables(block.content, sample),
      }}
    />
  )
}

function StaticImage({ block }: { block: ImageBlock }) {
  const img = (
    <Img
      src={block.src}
      alt={block.alt}
      width={block.width}
      height={block.height}
      style={imageInlineStyle(block.styles)}
    />
  )
  const wrapped = block.href ? <Link href={block.href}>{img}</Link> : img
  return <span style={imageContainerStyle(block.styles)}>{wrapped}</span>
}

function EditableButton({
  block,
  sample,
}: {
  block: ButtonBlock
  sample: Sample
}) {
  const { updateFieldAt } = useActions()
  const [editing, setEditing] = useState(false)

  const commit = (html: string) => {
    if (html !== block.label) {
      updateFieldAt({ kind: 'block', id: block.id }, ['label'], html)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <span style={buttonContainerStyle(block.styles)}>
        <InlineTextEditor
          key={`edit-${block.id}`}
          initialHtml={block.label}
          onCommit={commit}
          onCancel={() => setEditing(false)}
          style={{ ...buttonStyle(block.styles), display: 'inline-block' }}
        />
      </span>
    )
  }

  return (
    <span style={buttonContainerStyle(block.styles)}>
      <Button
        href={block.href}
        style={buttonStyle(block.styles)}
        onClick={(e: React.MouseEvent) => {
          e.preventDefault()
          setEditing(true)
        }}
      >
        <span
          dangerouslySetInnerHTML={{
            __html: substituteVariables(block.label, sample),
          }}
        />
      </Button>
    </span>
  )
}

function ReadOnlyHr({ block }: { block: HrBlock }) {
  return <Hr style={hrStyle(block.styles)} />
}

function ReadOnlySpacer({ block }: { block: SpacerBlock }) {
  return <div style={{ height: block.height, lineHeight: 0 }} />
}

export const EditableBlock = memo(function EditableBlock({
  block,
  sample,
  canDelete,
}: {
  block: Block
  sample: Sample
  canDelete: boolean
}) {
  return (
    <BlockShell blockId={block.id} canDelete={canDelete}>
      {(() => {
        switch (block.type) {
          case 'text':
            return <EditableText block={block} sample={sample} />
          case 'heading':
            return <EditableHeading block={block} sample={sample} />
          case 'image':
            return <StaticImage block={block} />
          case 'button':
            return <EditableButton block={block} sample={sample} />
          case 'hr':
            return <ReadOnlyHr block={block} />
          case 'spacer':
            return <ReadOnlySpacer block={block} />
          case 'orderedList':
          case 'unorderedList':
          case 'descriptionList':
            return renderBlock(block, sample)
        }
      })()}
    </BlockShell>
  )
})
