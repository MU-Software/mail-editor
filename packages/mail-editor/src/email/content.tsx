import { type ComponentPropsWithoutRef, type CSSProperties } from 'react'

// Outlook (Word rendering engine) ignores CSS padding on <a>, so buttons there
// collapse to the label size. These MSO-only `mso-*` properties re-create the
// padding for Outlook and are stripped by every other client. `mso-padding-alt`
// and `mso-text-raise` are not in React's CSSProperties, so we widen the type.
type MsoStyle = CSSProperties & { msoPaddingAlt?: string; msoTextRaise?: string }

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

// Outlook-only spacer: `letter-spacing` opens the horizontal gap while
// `mso-font-width` collapses the padding character; `mso-text-raise` nudges the
// label to vertical center. Wrapped in an [if mso] comment so it is inert elsewhere.
const msoSpacer = (px: number, raise: number): string =>
  `<!--[if mso]><i style="letter-spacing:${px}px;mso-font-width:-100%;${raise ? `mso-text-raise:${raise}px;` : ''}" hidden>&nbsp;</i><![endif]-->`

export const Button = ({ style, children, target = '_blank', rel = 'noopener noreferrer', ...props }: ComponentPropsWithoutRef<'a'>) => {
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
    <a target={target} rel={rel} style={anchorStyle} {...props}>
      <span dangerouslySetInnerHTML={{ __html: msoSpacer(px, raise) }} />
      <span style={innerStyle}>{children}</span>
      <span dangerouslySetInnerHTML={{ __html: msoSpacer(px, 0) }} />
    </a>
  )
}
