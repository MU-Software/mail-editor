import { TooltipIconButton } from '@mu-software/mail-editor/components/TooltipIconButton'
import { useActions, useSelectedRowId } from '@mu-software/mail-editor/hooks/useDocument'
import { rowSectionStyle } from '@mu-software/mail-editor/render/styles'
import type { Row } from '@mu-software/mail-editor/types/schema'
import { ArrowDownward, ArrowUpward, Build, Close, ContentCopy } from '@mui/icons-material'
import { Row as EmailRow, Section } from '@react-email/components'
import { memo } from 'react'

import { EditableColumn } from './EditableColumn'
import { HoverToolbar, SelectableShell } from './SelectableShell'

type Sample = Record<string, string>

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
    <SelectableShell kind="row" id={row.id} selected={selected} outlineOffset="-2px" hoverReveals={['row-controls']}>
      <HoverToolbar
        className="row-controls"
        spacing={0.25}
        sx={{
          top: 0,
          right: 0,
          transform: 'translateY(-100%)',
          background: '#4a9eff',
          px: 0.5,
          py: 0.25,
          borderRadius: '4px 4px 0 0',
          zIndex: 20,
          '& *': {
            color: 'white',
          },
        }}
      >
        <TooltipIconButton title="Row 속성 편집" icon={Build} onClick={() => setSelection({ kind: 'row', id: row.id })} />
        <TooltipIconButton title="위로 이동" icon={ArrowUpward} onClick={() => moveRow(row.id, 'up')} disabled={isFirst} />
        <TooltipIconButton title="아래로 이동" icon={ArrowDownward} onClick={() => moveRow(row.id, 'down')} disabled={isLast} />
        <TooltipIconButton title="복제" icon={ContentCopy} onClick={() => duplicateRow(row.id)} />
        <TooltipIconButton title="Row 삭제" icon={Close} sx={{ '&:hover': { background: 'rgba(255,0,0,1)' } }} onClick={() => removeRow(row.id)} />
      </HoverToolbar>
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
    </SelectableShell>
  )
})
