import { type ComponentPropsWithoutRef, type CSSProperties } from 'react'

// Outlook (Word rendering engine) ignores CSS padding on <a>, so buttons there
// collapse to the label size. These MSO-only `mso-*` properties re-create the
// padding for Outlook and are stripped by every other client. `mso-padding-alt`
// and `mso-text-raise` are not in React's CSSProperties, so we widen the type.
type MsoStyle = CSSProperties & { msoPaddingAlt?: string; msoTextRaise?: string; msoHide?: string }

const defaultTextStyle: CSSProperties = { fontSize: '14px', lineHeight: '24px' }

export const Text = ({ style, ...props }: ComponentPropsWithoutRef<'p'>) => <p style={{ ...defaultTextStyle, ...style }} {...props} />

type HeadingProps = ComponentPropsWithoutRef<'h1'> & { as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }

export const Heading = ({ as: Tag = 'h1', ...props }: HeadingProps) => <Tag {...props} />

const defaultHrStyle: CSSProperties = { width: '100%', border: 'none', borderTop: '1px solid #eaeaea' }

export const Hr = ({ style, ...props }: ComponentPropsWithoutRef<'hr'>) => <hr style={{ ...defaultHrStyle, ...style }} {...props} />

// Reset the quirks email clients apply to images (spacing, borders, underline).
const defaultImgStyle: CSSProperties = { display: 'block', outline: 'none', border: 'none', textDecoration: 'none' }

export const Img = ({ style, ...props }: ComponentPropsWithoutRef<'img'>) => <img style={{ ...defaultImgStyle, ...style }} {...props} />

const defaultLinkStyle: CSSProperties = { color: '#067df7', textDecoration: 'none' }

export const Link = ({ style, target = '_blank', rel = 'noopener noreferrer', ...props }: ComponentPropsWithoutRef<'a'>) => (
  <a target={target} rel={rel} style={{ ...defaultLinkStyle, ...style }} {...props} />
)

// Parse the "Ypx Xpx" shorthand that buttonStyle produces back into numbers so
// the Outlook spacer widths can mirror the CSS padding applied to the anchor.
const parsePadding = (padding: CSSProperties['padding']): { py: number; px: number } => {
  if (typeof padding !== 'string') return { py: 0, px: 0 }
  const parts = padding
    .trim()
    .split(/\s+/)
    .map((value) => Number.parseFloat(value) || 0)
  if (parts.length === 1) return { py: parts[0], px: parts[0] }
  return { py: parts[0], px: parts[1] }
}

// Read a CSS length that may arrive as a number or a "16px" string.
const parsePx = (value: unknown): number | undefined => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const n = Number.parseFloat(value)
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

// The VML button is assembled as a raw HTML string (unlike the React-rendered
// non-Outlook <a>), so every user-derived value must be escaped before it is
// interpolated in, or it could inject markup into the VML.
const escapeHtml = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const escapeAttr = (text: string): string => escapeHtml(text).replace(/"/g, '&quot;')

// Flatten the label to safe plain text for the VML <center> (Outlook can't render
// rich HTML). Tags are stripped char-by-char — a single regex pass can leave an
// unclosed `<tag`, so we drop everything between `<` and `>` (or to the end) — then
// the result is escaped so nothing it contains can inject markup.
const vmlText = (html: string): string => {
  let out = ''
  let inTag = false
  for (const ch of html) {
    if (ch === '<') inTag = true
    else if (ch === '>') inTag = false
    else if (!inTag) out += ch
  }
  return escapeHtml(out)
}

// Outlook-only spacer: `letter-spacing` opens the horizontal gap while
// `mso-font-width` collapses the padding character; `mso-text-raise` nudges the
// label to vertical center. Wrapped in an [if mso] comment so it is inert elsewhere.
const msoSpacer = (px: number, raise: number): string =>
  `<!--[if mso]><i style="letter-spacing:${px}px;mso-font-width:-100%;${raise ? `mso-text-raise:${raise}px;` : ''}" hidden>&nbsp;</i><![endif]-->`

type ButtonProps = Omit<ComponentPropsWithoutRef<'a'>, 'children'> & { label?: string }

export const Button = ({ style, label, href, target = '_blank', rel = 'noopener noreferrer', ...props }: ButtonProps) => {
  const labelHtml = label ?? ''
  const width = parsePx(style?.width)

  // Fixed width → reliable Outlook VML `<v:roundrect>` (rounded/filled) while the
  // anchor is hidden from Outlook via `mso-hide:all`. Reliable VML requires an
  // explicit width; auto-width buttons fall through to the padding-hack branch.
  if (width !== undefined) {
    const fontSize = parsePx(style?.fontSize) ?? 16
    const { py } = parsePadding(style?.padding)
    const height = 2 * py + Math.round(fontSize * 1.2)
    const radius = parsePx(style?.borderRadius) ?? 0
    const arcsize = radius > 0 ? Math.min(50, Math.round((radius / height) * 100)) : 0
    const fill = typeof style?.backgroundColor === 'string' ? style.backgroundColor : undefined
    const strokeColor = typeof style?.borderColor === 'string' ? style.borderColor : undefined
    const strokeWeight = parsePx(style?.borderWidth)
    const textColor = typeof style?.color === 'string' ? style.color : '#000000'
    const stroke = strokeColor ? `strokecolor="${escapeAttr(strokeColor)}"${strokeWeight ? ` strokeweight="${strokeWeight}px"` : ''}` : 'stroke="f"'
    const vml =
      `<!--[if mso]>` +
      `<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" ` +
      `href="${escapeAttr(href ?? '#')}" style="height:${height}px;v-text-anchor:middle;width:${width}px;" arcsize="${arcsize}%" ${stroke}${fill ? ` fillcolor="${escapeAttr(fill)}"` : ''}>` +
      `<w:anchorlock/>` +
      `<center style="color:${escapeAttr(textColor)};font-family:Arial,sans-serif;font-size:${fontSize}px;">${vmlText(labelHtml)}</center>` +
      `</v:roundrect>` +
      `<![endif]-->`
    const anchorStyle: MsoStyle = {
      display: 'inline-block',
      boxSizing: 'border-box',
      textAlign: 'center',
      textDecoration: 'none',
      msoHide: 'all',
      ...style,
    }
    return (
      <>
        <span dangerouslySetInnerHTML={{ __html: vml }} />
        <a href={href} target={target} rel={rel} style={anchorStyle} dangerouslySetInnerHTML={{ __html: labelHtml }} {...props} />
      </>
    )
  }

  const { py, px } = parsePadding(style?.padding)
  const raise = Math.round(py * 1.5)
  const anchorStyle: MsoStyle = {
    display: 'inline-block',
    lineHeight: '100%',
    textDecoration: 'none',
    maxWidth: '100%',
    msoPaddingAlt: '0px',
    ...style,
  }
  const innerStyle: MsoStyle = { display: 'inline-block', maxWidth: '100%', lineHeight: '120%', msoTextRaise: `${Math.round(py * 0.75)}px` }
  return (
    <a href={href} target={target} rel={rel} style={anchorStyle} {...props}>
      <span dangerouslySetInnerHTML={{ __html: msoSpacer(px, raise) }} />
      <span style={innerStyle} dangerouslySetInnerHTML={{ __html: labelHtml }} />
      <span dangerouslySetInnerHTML={{ __html: msoSpacer(px, 0) }} />
    </a>
  )
}
