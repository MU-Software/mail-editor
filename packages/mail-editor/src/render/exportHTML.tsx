import type { EmailDocument } from '@mu-software/mail-editor/types/schema'
import { render } from '@react-email/render'

import { EmailDocumentRenderer } from './EmailRenderer'

export const exportHTML = async (doc: EmailDocument): Promise<string> => {
  const exportDoc: EmailDocument = { ...doc, sampleValues: {} }
  return render(<EmailDocumentRenderer doc={exportDoc} />, { pretty: true })
}

export type PreviewTheme = 'light' | 'dark-invert' | 'dark-bg'

const OVERSCROLL_RULE = 'html,body{overscroll-behavior:contain}'

const THEME_RULES: Record<PreviewTheme, string> = {
  light: '',
  'dark-invert': 'html{background:#e3e3e1;filter:invert(1) hue-rotate(180deg)}img,picture,video,svg{filter:invert(1) hue-rotate(180deg)}',
  'dark-bg': 'html{background:#1c1c1e}body{background:#1c1c1e!important}',
}

export const previewHTML = async (doc: EmailDocument, options?: { theme?: PreviewTheme }): Promise<string> => {
  const html = await render(<EmailDocumentRenderer doc={doc} />, { pretty: false })
  const style = `<style>${OVERSCROLL_RULE}${THEME_RULES[options?.theme ?? 'light']}</style>`
  return html.includes('</head>') ? html.replace('</head>', `${style}</head>`) : `${style}${html}`
}
