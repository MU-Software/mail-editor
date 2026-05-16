import type { EmailDocument } from '@mu-software/mail-editor/types/schema'
import { render } from '@react-email/render'

import { EmailDocumentRenderer } from './EmailRenderer'

export const exportHTML = async (doc: EmailDocument): Promise<string> => {
  const exportDoc: EmailDocument = { ...doc, sampleValues: {} }
  return render(<EmailDocumentRenderer doc={exportDoc} />, { pretty: true })
}
