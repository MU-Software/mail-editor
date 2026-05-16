import { useActions, useDocument, useSelection, useShowRawVariables } from '@mu-software/mail-editor/hooks/useDocument'
import { Add } from '@mui/icons-material'
import { Box, Button, Stack } from '@mui/material'
import { useState, type FC, type MouseEvent } from 'react'

import { BlockTypeMenu } from './BlockTypeMenu'
import { EditableRow } from './EditableRow'

const EMPTY_SAMPLE: Record<string, string> = {}

const AddRowButton: FC<{ atIndex: number }> = ({ atIndex }) => {
  const { addRow } = useActions()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  return (
    <Stack direction="row" onClick={(e) => e.stopPropagation()} sx={{ justifyContent: 'center', py: 0.75, background: 'rgba(74, 158, 255, 0.05)' }}>
      <Button size="small" variant="outlined" startIcon={<Add />} onClick={(e: MouseEvent<HTMLButtonElement>) => setAnchor(e.currentTarget)}>
        Row 추가
      </Button>
      <BlockTypeMenu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} onSelect={(type) => addRow(atIndex, type)} />
    </Stack>
  )
}

export const EditableCanvas = () => {
  const styles = useDocument((d) => d.styles)
  const rows = useDocument((d) => d.rows)
  const docSampleValues = useDocument((d) => d.sampleValues)
  const showRawVariables = useShowRawVariables()
  const sampleValues = showRawVariables ? EMPTY_SAMPLE : docSampleValues
  const selection = useSelection()
  const { setSelection } = useActions()

  const documentSelected = selection?.kind === 'document'

  const selectDocument = () => setSelection({ kind: 'document' })

  return (
    <Stack
      direction="row"
      onClick={selectDocument}
      sx={{
        justifyContent: 'center',
        flex: 1,
        overflow: 'auto',
        py: 3,
        px: 2,
        backgroundColor: styles.backgroundColor ?? '#f4f4f4',
      }}
    >
      <Box
        onClick={selectDocument}
        sx={{
          margin: '0 auto',
          position: 'relative',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          width: styles.width ?? 600,
          height: 'fit-content',
          backgroundColor: styles.contentBackgroundColor ?? '#ffffff',
          fontFamily: styles.fontFamily,
          outline: documentSelected ? '2px solid #4a9eff' : undefined,
          outlineOffset: documentSelected ? '-2px' : undefined,
        }}
      >
        <AddRowButton atIndex={0} />
        {rows.map((row, idx) => (
          <EditableRow key={row.id} row={row} sampleValues={sampleValues} isFirst={idx === 0} isLast={idx === rows.length - 1} />
        ))}
        <AddRowButton atIndex={rows.length} />
      </Box>
    </Stack>
  )
}
