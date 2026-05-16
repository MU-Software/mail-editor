import { render } from '@react-email/render'

import type { EmailDocument } from '@musoftware/mail-editor/types/schema'

import { EmailDocumentRenderer } from './EmailRenderer'

export const exportHTML = async (doc: EmailDocument): Promise<string> => {
  const exportDoc: EmailDocument = { ...doc, sampleValues: {} }
  return render(<EmailDocumentRenderer doc={exportDoc} />, { pretty: true })
}
