import type { MouseEvent } from 'react'

export const stopAnd = (fn: () => void) => {
  return (e: MouseEvent) => {
    e.stopPropagation()
    fn()
  }
}
