import type { CSSProperties } from 'react'

import type { ButtonBlock, Column, HeadingBlock, HrBlock, ImageBlock, Row } from '@musoftware/mail-editor/types/schema'

type TextLikeStyles = {
  color?: string
  fontSize?: number
  textAlign?: 'left' | 'center' | 'right'
  lineHeight?: number
}

type BorderStyles = {
  borderWidth?: number
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double'
  borderColor?: string
}

export const paddingValue = (y: number | undefined, x: number | undefined): string | undefined => {
  if (y === undefined && x === undefined) return undefined
  return `${y ?? 0}px ${x ?? 0}px`
}

export const borderStyleProps = (s: BorderStyles | undefined): CSSProperties => {
  if (!s) return {}
  return {
    borderWidth: s.borderWidth,
    borderStyle: s.borderStyle,
    borderColor: s.borderColor,
  }
}

export const textStyle = (s: TextLikeStyles | undefined): CSSProperties => {
  if (!s) return { margin: 0 }
  return {
    color: s.color,
    fontSize: s.fontSize !== undefined ? `${s.fontSize}px` : undefined,
    textAlign: s.textAlign,
    lineHeight: s.lineHeight,
    margin: 0,
  }
}

export const headingStyle = (s: HeadingBlock['styles']): CSSProperties => ({ color: s?.color, textAlign: s?.textAlign, margin: 0 })

export const buttonStyle = (s: ButtonBlock['styles']): CSSProperties => {
  if (!s) return {}
  return {
    backgroundColor: s.backgroundColor,
    color: s.color,
    borderRadius: s.borderRadius,
    padding: paddingValue(s.paddingY, s.paddingX),
    fontSize: s.fontSize !== undefined ? `${s.fontSize}px` : undefined,
    ...borderStyleProps(s),
  }
}

export const buttonContainerStyle = (s: ButtonBlock['styles']): CSSProperties => ({ display: 'block', textAlign: s?.textAlign })

export const imageContainerStyle = (s: ImageBlock['styles']): CSSProperties => ({ display: 'block', textAlign: s?.textAlign })

export const imageInlineStyle = (s: ImageBlock['styles']): CSSProperties => ({
  display: 'inline-block',
  verticalAlign: 'middle',
  borderRadius: s?.borderRadius,
  ...borderStyleProps(s),
})

export const listStyle = (s: TextLikeStyles | undefined): CSSProperties => ({ ...textStyle(s), paddingLeft: 24 })

export const hrStyle = (s: HrBlock['styles']): CSSProperties => {
  if (!s) return {}
  return { borderColor: s.color, borderTopWidth: s.thickness }
}

export const rowSectionStyle = (s: Row['styles']): CSSProperties => {
  if (!s) return {}
  return {
    backgroundColor: s.backgroundColor,
    padding: paddingValue(s.paddingY, s.paddingX),
    textAlign: s.textAlign,
    borderRadius: s.borderRadius,
    ...borderStyleProps(s),
  }
}

export const columnTdStyle = (col: Column, totalWidth: number): CSSProperties => {
  const safeWidth = col.width || 1
  const widthPct = `${((safeWidth / totalWidth) * 100).toFixed(4)}%`
  return {
    width: widthPct,
    verticalAlign: col.styles?.verticalAlign,
    backgroundColor: col.styles?.backgroundColor,
    borderRadius: col.styles?.borderRadius,
    ...borderStyleProps(col.styles),
  }
}

export const columnPadding = (col: Column): string | undefined => paddingValue(col.styles?.paddingY, col.styles?.paddingX)
