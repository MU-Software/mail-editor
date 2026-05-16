export const VAR_PATTERN = /\{\{\s*(\w+)\s*\}\}/g

export function substituteVariables(text: string, sampleValues: Record<string, string>): string {
  if (!text.includes('{{')) return text
  return text.replace(VAR_PATTERN, (match, name: string) => (Object.prototype.hasOwnProperty.call(sampleValues, name) ? sampleValues[name] : match))
}
