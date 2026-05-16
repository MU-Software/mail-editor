import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Stack, TextField } from '@mui/material'
import { useState, type FC } from 'react'

import { stringifyEmailDocument, type EmailDocument } from '@musoftware/mail-editor'

export const JsonExportDialog: FC<{
  doc: EmailDocument | null
  onClose: () => void
}> = ({ doc, onClose }) => {
  const json = doc ? stringifyEmailDocument(doc) : ''
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json)
      setFeedback('JSON이 클립보드에 복사되었습니다')
    } catch {
      setFeedback('클립보드 복사에 실패했습니다')
    }
  }

  return (
    <>
      <Dialog open={doc !== null} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>JSON 내보내기</DialogTitle>
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
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    fontSize: 12,
                  },
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>닫기</Button>
          <Button variant="contained" onClick={() => void handleCopy()}>
            클립보드에 복사
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={feedback !== null}
        autoHideDuration={2000}
        onClose={() => setFeedback(null)}
        message={feedback ?? ''}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  )
}
