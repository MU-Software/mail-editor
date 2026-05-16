import type { EmailDocument } from '@mu-software/mail-editor/types/schema'
import { render } from '@react-email/render'

import { EmailDocumentRenderer } from './EmailRenderer'

export const exportHTML = async (doc: EmailDocument): Promise<string> => {
  const exportDoc: EmailDocument = { ...doc, sampleValues: {} }
  return render(<EmailDocumentRenderer doc={exportDoc} />, { pretty: true })
}

const PREVIEW_STYLE = '<style>html,body{overscroll-behavior:contain}</style>'

export const previewHTML = async (doc: EmailDocument): Promise<string> => {
  const html = await render(<EmailDocumentRenderer doc={doc} />, { pretty: false })
  return html.includes('</head>') ? html.replace('</head>', `${PREVIEW_STYLE}</head>`) : `${PREVIEW_STYLE}${html}`
}
