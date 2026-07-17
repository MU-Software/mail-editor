import { type ComponentPropsWithoutRef, type CSSProperties, type ReactNode } from 'react'

// Shared attributes for the layout tables. `role="presentation"` keeps the
// table-based layout from being announced as tabular data, while the zeroed
// cellpadding/spacing/border give a predictable box model across email clients.
const presentationTable: ComponentPropsWithoutRef<'table'> = {
  align: 'center',
  width: '100%',
  border: 0,
  cellPadding: 0,
  cellSpacing: 0,
  role: 'presentation',
}

type Styleable = { style?: CSSProperties; children?: ReactNode }

export const Html = ({ children }: { children?: ReactNode }) => (
  <html lang="en" dir="ltr">
    {children}
  </html>
)

export const Head = ({ children }: { children?: ReactNode }) => (
  <head>
    <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="x-apple-disable-message-reformatting" />
    {children}
  </head>
)

// A full-width wrapper table lets the background color fill the viewport even in
// clients that ignore styles on <body>; the inner content is centered by Container.
export const Body = ({ style, children }: Styleable) => (
  <body style={style}>
    <table {...presentationTable}>
      <tbody>
        <tr>
          <td style={style}>{children}</td>
        </tr>
      </tbody>
    </table>
  </body>
)

export const Container = ({ style, children }: Styleable) => (
  <table {...presentationTable} style={{ maxWidth: '600px', ...style }}>
    <tbody>
      <tr style={{ width: '100%' }}>
        <td>{children}</td>
      </tr>
    </tbody>
  </table>
)

export const Section = ({ style, children }: Styleable) => (
  <table {...presentationTable} style={style}>
    <tbody>
      <tr>
        <td>{children}</td>
      </tr>
    </tbody>
  </table>
)

export const Row = ({ children }: { children?: ReactNode }) => (
  <table {...presentationTable}>
    <tbody style={{ width: '100%' }}>
      <tr style={{ width: '100%' }}>{children}</tr>
    </tbody>
  </table>
)

export const Column = ({ style, children }: Styleable) => <td style={style}>{children}</td>

// Hidden preheader text. It is invisible in the rendered email but is what most
// inboxes show as the snippet next to the subject line.
const previewStyle: CSSProperties = {
  display: 'none',
  overflow: 'hidden',
  lineHeight: '1px',
  opacity: 0,
  maxHeight: 0,
  maxWidth: 0,
}

export const Preview = ({ children }: { children?: ReactNode }) => (
  <div style={previewStyle} data-skip-in-text="true">
    {children}
  </div>
)
