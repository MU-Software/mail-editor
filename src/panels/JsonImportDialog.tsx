import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useActions } from '../hooks/useDocument'
import { parseEmailDocument } from '../utils/jsonIO'

export function JsonImportDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { replaceDocument, setSelection } = useActions()
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setText('')
      setError(null)
    }
  }, [open])

  const handleImport = () => {
    try {
      const doc = parseEmailDocument(text)
      replaceDocument(doc)
      setSelection(null)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        JSON 불러오기
      </DialogTitle>
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
        <Button onClick={onClose}>취소</Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={!text.trim()}
        >
          불러오기
        </Button>
      </DialogActions>
    </Dialog>
  )
}
