import { MailEditor, type EmailDocument } from '@mu-software/mail-editor'
import { Box, Snackbar } from '@mui/material'
import { useState, type FC } from 'react'

import { AppBar } from './AppBar'
import { JsonExportDialog } from './JsonExportDialog'
import { JsonImportDialog } from './JsonImportDialog'
import { sampleDocument } from './data/sampleDocument'
import { handleHtmlExport } from './htmlExport'

export const App: FC = () => {
  const [doc, setDoc] = useState<EmailDocument>(sampleDocument)
  const [importOpen, setImportOpen] = useState(false)
  const [exportDoc, setExportDoc] = useState<EmailDocument | null>(null)
  const [sizeNotice, setSizeNotice] = useState<string | null>(null)

  const onHtmlExport = async (html: string) => {
    const result = await handleHtmlExport(html)
    if (result.ok) setSizeNotice(`HTML 크기: ${result.sizeText}`)
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar onJsonImport={() => setImportOpen(true)} />
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <MailEditor initialDocument={doc} onJsonExport={setExportDoc} onHtmlExport={onHtmlExport} />
      </Box>
      <JsonImportDialog open={importOpen} onClose={() => setImportOpen(false)} onImport={setDoc} />
      <JsonExportDialog doc={exportDoc} onClose={() => setExportDoc(null)} />
      <Snackbar
        open={sizeNotice !== null}
        autoHideDuration={4000}
        onClose={() => setSizeNotice(null)}
        message={sizeNotice ?? ''}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  )
}
