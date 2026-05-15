export function swapInPlace<T>(arr: T[], i: number, j: number): boolean {
  if (i < 0 || j < 0 || i >= arr.length || j >= arr.length || i === j) return false
  const tmp = arr[i]
  arr[i] = arr[j]
  arr[j] = tmp
  return true
}

export function withSwapped<T>(arr: readonly T[], i: number, j: number): T[] | null {
  if (i < 0 || j < 0 || i >= arr.length || j >= arr.length || i === j) return null
  const next = arr.slice()
  ;[next[i], next[j]] = [next[j], next[i]]
  return next
}
