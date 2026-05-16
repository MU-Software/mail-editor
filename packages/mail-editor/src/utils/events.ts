import type { MouseEvent } from 'react'

export const stopAnd = (fn: () => void) => (e: MouseEvent) => {
  e.stopPropagation()
  fn()
}
