import sampleJson from './sampleDocument.json?raw'
import { parseEmailDocument } from '../utils/jsonIO'

export const sampleDocument = parseEmailDocument(sampleJson)
