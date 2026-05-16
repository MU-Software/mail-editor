export const getAtPath = (obj: unknown, path: readonly string[]): unknown => {
  let cur: unknown = obj
  for (const k of path) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[k]
  }
  return cur
}

export const setAtPath = (root: Record<string, unknown>, path: readonly string[], value: unknown): void => {
  if (path.length === 0) return
  let cur = root
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]
    if (cur[key] == null || typeof cur[key] !== 'object') {
      cur[key] = {}
    }
    cur = cur[key] as Record<string, unknown>
  }
  const lastKey = path[path.length - 1]
  if (value === undefined) delete cur[lastKey]
  else cur[lastKey] = value
}
