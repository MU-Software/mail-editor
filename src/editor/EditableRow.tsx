import {
  ArrowDownward,
  ArrowUpward,
  Build,
  Close,
  ContentCopy,
} from '@mui/icons-material'
import { Box, Stack } from '@mui/material'
import { Row as EmailRow, Section } from '@react-email/components'
import { memo } from 'react'
import { TooltipIconButton } from '../components/TooltipIconButton'
import { useActions, useSelectedRowId } from '../hooks/useDocument'
import { rowSectionStyle } from '../render/styles'
import type { Row } from '../types/schema'
import { EditableColumn } from './EditableColumn'

type Sample = Record<string, string>

const overlayBtnSx = {
  color: 'white',
  '&:hover': { background: 'rgba(255,255,255,0.2)' },
  '&.Mui-disabled': { color: 'rgba(255,255,255,0.4)' },
} as const

export const EditableRow = memo(function EditableRow({
  row,
  sampleValues,
  isFirst,
  isLast,
}: {
  row: Row
  sampleValues: Sample
  isFirst: boolean
  isLast: boolean
}) {
  const { moveRow, duplicateRow, removeRow, setSelection } = useActions()
  const selectedId = useSelectedRowId()
  const selected = selectedId === row.id
  const totalWidth = row.columns.reduce((s, c) => s + (c.width || 1), 0)

  return (
    <Box
      data-row-id={row.id}
      onClick={(e) => {
        e.stopPropagation()
        setSelection({ kind: 'row', id: row.id })
      }}
      sx={{
        position: 'relative',
        outline: selected ? '2px solid #4a9eff' : undefined,
        outlineOffset: selected ? '-2px' : undefined,
        '&:hover': !selected
          ? { outline: '2px solid #4a9eff', outlineOffset: '-2px' }
          : undefined,
        '&:hover > .row-controls': { display: 'flex' },
      }}
    >
      <Stack
        direction="row"
        spacing={0.25}
        className="row-controls"
        alignItems="center"
        onClick={(e) => e.stopPropagation()}
        sx={{
          display: 'none',
          position: 'absolute',
          top: 0,
          right: 0,
          transform: 'translateY(-100%)',
          background: '#4a9eff',
          px: 0.5,
          py: 0.25,
          borderRadius: '4px 4px 0 0',
          zIndex: 20,
        }}
      >
        <TooltipIconButton
          title="Row 속성 편집"
          icon={Build}
          sx={overlayBtnSx}
          onClick={() => setSelection({ kind: 'row', id: row.id })}
        />
        <TooltipIconButton
          title="위로 이동"
          icon={ArrowUpward}
          sx={overlayBtnSx}
          onClick={() => moveRow(row.id, 'up')}
          disabled={isFirst}
        />
        <TooltipIconButton
          title="아래로 이동"
          icon={ArrowDownward}
          sx={overlayBtnSx}
          onClick={() => moveRow(row.id, 'down')}
          disabled={isLast}
        />
        <TooltipIconButton
          title="복제"
          icon={ContentCopy}
          sx={overlayBtnSx}
          onClick={() => duplicateRow(row.id)}
        />
        <TooltipIconButton
          title="Row 삭제"
          icon={Close}
          sx={{
            ...overlayBtnSx,
            '&:hover': { background: 'rgba(255,0,0,0.4)' },
          }}
          onClick={() => removeRow(row.id)}
        />
      </Stack>
      <Section style={rowSectionStyle(row.styles)}>
        <EmailRow>
          {row.columns.map((col, idx) => (
            <EditableColumn
              key={col.id}
              column={col}
              index={idx}
              siblingCount={row.columns.length}
              totalWidth={totalWidth}
              sampleValues={sampleValues}
            />
          ))}
        </EmailRow>
      </Section>
    </Box>
  )
})
