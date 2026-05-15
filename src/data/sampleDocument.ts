import { parseEmailDocument } from '../utils/jsonIO'
import sampleJson from './sampleDocument.json?raw'

export const sampleDocument = parseEmailDocument(sampleJson)
