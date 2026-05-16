import { EmailDocumentSchema } from '@musoftware/mail-editor'

import sample from './sampleDocument.json'

export const sampleDocument = EmailDocumentSchema.parse(sample)
