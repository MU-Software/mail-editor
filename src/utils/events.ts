import type { MouseEvent } from 'react'

export function stopAnd(fn: () => void) {
  return (e: MouseEvent) => {
    e.stopPropagation()
    fn()
  }
}
