import { useActions } from '@mu-software/mail-editor/hooks/useDocument'
import { renderBlock } from '@mu-software/mail-editor/render/blocks'
import { buttonContainerStyle, buttonStyle, headingStyle, textStyle } from '@mu-software/mail-editor/render/styles'
import type { Block, ButtonBlock, HeadingBlock, TextBlock } from '@mu-software/mail-editor/types/schema'
import { cloneElement, memo, useState, type CSSProperties, type FC, type MouseEvent, type ReactElement } from 'react'

import { BlockShell } from './BlockShell'
import { InlineTextEditor } from './InlineTextEditor'

const withClickHandler = (element: ReactElement, onClick: (e: MouseEvent) => void): ReactElement =>
  cloneElement(element as ReactElement<{ onClick?: (e: MouseEvent) => void }>, { onClick })

type Sample = Record<string, string>

const HEADING_LEVEL_FONT_SIZE: Record<HeadingBlock['level'], string> = {
  1: '2em',
  2: '1.5em',
  3: '1.17em',
  4: '1em',
  5: '0.83em',
  6: '0.67em',
}

const headingEditStyle = (block: HeadingBlock): CSSProperties => ({
  fontSize: HEADING_LEVEL_FONT_SIZE[block.level],
  fontWeight: 'bold',
  margin: 0,
  ...headingStyle(block.styles),
})

const EditableText: FC<{ block: TextBlock; sample: Sample }> = ({ block, sample }) => {
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

  return withClickHandler(renderBlock(block, sample), () => setEditing(true))
}

const EditableHeading: FC<{ block: HeadingBlock; sample: Sample }> = ({ block, sample }) => {
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
        style={headingEditStyle(block)}
      />
    )
  }

  return withClickHandler(renderBlock(block, sample), () => setEditing(true))
}

const EditableButton: FC<{ block: ButtonBlock; sample: Sample }> = ({ block, sample }) => {
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

  return withClickHandler(renderBlock(block, sample), (e) => {
    e.preventDefault()
    setEditing(true)
  })
}

type EditableBlockProps = {
  block: Block
  sample: Sample
  canDelete: boolean
}

export const EditableBlock = memo<EditableBlockProps>(({ block, sample, canDelete }) => (
  <BlockShell blockId={block.id} canDelete={canDelete}>
    {(() => {
      switch (block.type) {
        case 'text':
          return <EditableText block={block} sample={sample} />
        case 'heading':
          return <EditableHeading block={block} sample={sample} />
        case 'button':
          return <EditableButton block={block} sample={sample} />
        case 'image':
        case 'hr':
        case 'spacer':
        case 'orderedList':
        case 'unorderedList':
        case 'descriptionList':
          return renderBlock(block, sample)
      }
    })()}
  </BlockShell>
))
EditableBlock.displayName = 'EditableBlock'
