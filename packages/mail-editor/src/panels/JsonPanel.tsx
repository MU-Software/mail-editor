import { useDocument } from '@mu-software/mail-editor/hooks/useDocument'
import { Box } from '@mui/material'

export const JsonPanel = () => {
  const doc = useDocument((d) => d)
  return (
    <Box
      component="pre"
      sx={{
        flex: 1,
        m: 0,
        overflow: 'auto',
        background: '#f5f5f5',
        color: '#222',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 12,
        p: 1.5,
        lineHeight: 1.5,
        userSelect: 'text',
      }}
    >
      {JSON.stringify(doc, null, 2)}
    </Box>
  )
}
