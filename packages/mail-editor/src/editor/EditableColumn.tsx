import { Add, ArrowBack, ArrowForward, Build, Close } from '@mui/icons-material'
import { Box } from '@mui/material'
import { Column as EmailColumn } from '@react-email/components'
import { memo, useState, type FC, type MouseEvent } from 'react'

import { TooltipIconButton } from '@musoftware/mail-editor/components/TooltipIconButton'
import { useActions, useSelectedColumnId } from '@musoftware/mail-editor/hooks/useDocument'
import { columnPadding, columnTdStyle } from '@musoftware/mail-editor/render/styles'
import type { Block, Column } from '@musoftware/mail-editor/types/schema'
import { stopAnd } from '@musoftware/mail-editor/utils/events'

import { BlockTypeMenu } from './BlockTypeMenu'
import { EditableBlock } from './EditableBlock'
import { HoverToolbar, SelectableShell } from './SelectableShell'

type Sample = Record<string, string>

const ColumnInsertHandle: FC<{
  position: 'before' | 'after'
  onSelect: (type: Block['type']) => void
}> = ({ position, onSelect }) => {
  const isLeft = position === 'before'
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  return (
    <Box
      className="column-insert"
      onClick={(e) => e.stopPropagation()}
      sx={{
        display: 'none',
        position: 'absolute',
        [isLeft ? 'left' : 'right']: 0,
        top: '50%',
        transform: `translate(${isLeft ? '-50%' : '50%'}, -50%)`,
        zIndex: 15,
      }}
    >
      <TooltipIconButton
        title={isLeft ? '왼쪽에 Column 추가' : '오른쪽에 Column 추가'}
        icon={Add}
        variant="outlined"
        onClick={(e: MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation()
          setAnchor(e.currentTarget)
        }}
      />
      <BlockTypeMenu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} onSelect={onSelect} />
    </Box>
  )
}

type EditableColumnProps = {
  column: Column
  index: number
  siblingCount: number
  totalWidth: number
  sampleValues: Sample
}

export const EditableColumn = memo<EditableColumnProps>(({ column, index, siblingCount, totalWidth, sampleValues }) => {
  const { moveColumn, insertColumnBefore, insertColumnAfter, removeColumn, setSelection } = useActions()
  const selectedId = useSelectedColumnId()
  const selected = selectedId === column.id
  const isFirst = index === 0
  const isLast = index === siblingCount - 1
  const canMoveOrDelete = siblingCount > 1

  return (
    <EmailColumn style={columnTdStyle(column, totalWidth)}>
      <SelectableShell
        kind="column"
        id={column.id}
        selected={selected}
        outlineOffset="-2px"
        hoverOutline="1px dashed #4a9eff"
        hoverOutlineOffset="-1px"
        hoverReveals={['column-controls', 'column-insert']}
        sx={{ minHeight: 24, padding: columnPadding(column) }}
      >
        <HoverToolbar
          className="column-controls"
          sx={{
            top: 0,
            left: 0,
            transform: 'translateY(-50%)',
            background: 'white',
            border: '1px solid #4a9eff',
            borderRadius: 0.5,
            px: 0.25,
            py: '1px',
            zIndex: 12,
          }}
        >
          <TooltipIconButton title="Column 속성 편집" icon={Build} onClick={stopAnd(() => setSelection({ kind: 'column', id: column.id }))} />
          {canMoveOrDelete && (
            <>
              <TooltipIconButton title="좌로 이동" icon={ArrowBack} disabled={isFirst} onClick={stopAnd(() => moveColumn(column.id, 'left'))} />
              <TooltipIconButton title="우로 이동" icon={ArrowForward} disabled={isLast} onClick={stopAnd(() => moveColumn(column.id, 'right'))} />
              <TooltipIconButton
                title="Column 삭제"
                icon={Close}
                sx={{
                  color: '#d04',
                  '&:hover': { background: '#d04', color: 'white' },
                }}
                onClick={stopAnd(() => removeColumn(column.id))}
              />
            </>
          )}
        </HoverToolbar>
        <ColumnInsertHandle position="before" onSelect={(type) => insertColumnBefore(column.id, type)} />
        <ColumnInsertHandle position="after" onSelect={(type) => insertColumnAfter(column.id, type)} />
        {column.blocks.map((block) => (
          <EditableBlock key={block.id} block={block} sample={sampleValues} canDelete={column.blocks.length > 1} />
        ))}
      </SelectableShell>
    </EmailColumn>
  )
})
EditableColumn.displayName = 'EditableColumn'
