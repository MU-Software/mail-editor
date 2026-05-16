import { render } from '@react-email/render'

import { EmailDocumentRenderer } from './EmailRenderer'
import type { EmailDocument } from '../types/schema'

export async function exportHTML(doc: EmailDocument): Promise<string> {
  const exportDoc: EmailDocument = { ...doc, sampleValues: {} }
  return render(<EmailDocumentRenderer doc={exportDoc} />, { pretty: true })
}
