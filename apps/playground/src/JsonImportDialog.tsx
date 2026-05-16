import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material'
import { useState, type FC } from 'react'

import { parseEmailDocument, type EmailDocument } from '@musoftware/mail-editor'

export const JsonImportDialog: FC<{
  open: boolean
  onClose: () => void
  onImport: (doc: EmailDocument) => void
}> = ({ open, onClose, onImport }) => {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    setText('')
    setError(null)
    onClose()
  }

  const handleImport = () => {
    try {
      const doc = parseEmailDocument(text)
      onImport(doc)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>JSON 불러오기</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            multiline
            minRows={14}
            maxRows={22}
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setError(null)
            }}
            placeholder="EmailDocument JSON을 붙여넣으세요"
            fullWidth
            slotProps={{
              input: {
                sx: {
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: 12,
                },
              },
            }}
          />
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>취소</Button>
        <Button variant="contained" onClick={handleImport} disabled={!text.trim()}>
          불러오기
        </Button>
      </DialogActions>
    </Dialog>
  )
}
