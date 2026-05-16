import { FileUpload, Save, Send } from '@mui/icons-material'
import { AppBar as MuiAppBar, Button, Stack, Toolbar, Typography } from '@mui/material'
import type { FC } from 'react'

type Props = {
  onJsonImport: () => void
  onJsonExport: () => void
  onHtmlExport: () => void
  htmlExporting: boolean
}

export const AppBar: FC<Props> = ({ onJsonImport, onJsonExport, onHtmlExport, htmlExporting }) => (
  <MuiAppBar position="static" color="default" elevation={1}>
    <Toolbar variant="dense" sx={{ minHeight: 44 }}>
      <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 600 }}>
        Mail Editor Playground
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button size="small" startIcon={<FileUpload />} onClick={onJsonImport} sx={{ textTransform: 'none' }}>
          JSON 불러오기
        </Button>
        <Button size="small" startIcon={<Save />} onClick={onJsonExport} sx={{ textTransform: 'none' }}>
          JSON 내보내기
        </Button>
        <Button size="small" startIcon={<Send />} onClick={onHtmlExport} disabled={htmlExporting} sx={{ textTransform: 'none' }}>
          {htmlExporting ? '내보내는 중...' : 'HTML로 내보내기'}
        </Button>
      </Stack>
    </Toolbar>
  </MuiAppBar>
)
