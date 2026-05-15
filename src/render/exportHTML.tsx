import { render } from '@react-email/render'
import type { EmailDocument } from '../types/schema'
import { EmailDocumentRenderer } from './EmailRenderer'

export async function exportHTML(doc: EmailDocument): Promise<string> {
  const exportDoc: EmailDocument = { ...doc, sampleValues: {} }
  return render(<EmailDocumentRenderer doc={exportDoc} />, { pretty: true })
}
