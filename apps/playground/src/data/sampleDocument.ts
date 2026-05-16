import { EmailDocumentSchema } from '@mu-software/mail-editor'

import sample from './sampleDocument.json'

export const sampleDocument = EmailDocumentSchema.parse(sample)
