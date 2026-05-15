import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  TextField
} from '@mui/material'
import { useMemo, useState } from 'react'
import { useDocument } from '../hooks/useDocument'
import { stringifyEmailDocument } from '../utils/jsonIO'

export function JsonExportDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const doc = useDocument((d) => d)
  const json = useMemo(() => stringifyEmailDocument(doc), [doc])
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          JSON 내보내기
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              multiline
              minRows={14}
              maxRows={22}
              value={json}
              fullWidth
              slotProps={{
                input: {
                  readOnly: true,
                  sx: {
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, monospace',
                    fontSize: 12,
                  },
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>닫기</Button>
          <Button variant="contained" onClick={handleCopy}>
            클립보드에 복사
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="JSON이 클립보드에 복사되었습니다"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  )
}
