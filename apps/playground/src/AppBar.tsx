import { FileUpload } from '@mui/icons-material'
import { AppBar as MuiAppBar, Button, Toolbar, Typography } from '@mui/material'
import type { FC } from 'react'

export const AppBar: FC<{ onJsonImport: () => void }> = ({ onJsonImport }) => (
  <MuiAppBar position="static" color="default" elevation={1}>
    <Toolbar variant="dense" sx={{ minHeight: 44 }}>
      <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 600 }}>
        Mail Editor Playground
      </Typography>
      <Button size="small" startIcon={<FileUpload />} onClick={onJsonImport} sx={{ textTransform: 'none' }}>
        JSON 불러오기
      </Button>
    </Toolbar>
  </MuiAppBar>
)
