import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Preview,
  Row,
  Section,
} from '@react-email/components'
import { cloneElement } from 'react'
import type { EmailDocument, Row as RowT } from '../types/schema'
import { renderBlock } from './blocks'
import {
  columnPadding,
  columnTdStyle,
  rowSectionStyle,
} from './styles'

type Sample = Record<string, string>

function renderRow(row: RowT, sample: Sample) {
  const totalWidth = row.columns.reduce((acc, c) => acc + (c.width || 1), 0)
  return (
    <Section key={row.id} style={rowSectionStyle(row.styles)}>
      <Row>
        {row.columns.map((col) => (
          <Column
            key={col.id}
            style={{
              ...columnTdStyle(col, totalWidth),
              padding: columnPadding(col),
            }}
          >
            {col.blocks.map((b) => cloneElement(renderBlock(b, sample), { key: b.id }))}
          </Column>
        ))}
      </Row>
    </Section>
  )
}

export function EmailDocumentRenderer({ doc }: { doc: EmailDocument }) {
  return (
    <Html>
      <Head>
        {doc.meta.preview ? <Preview>{doc.meta.preview}</Preview> : null}
      </Head>
      <Body
        style={{
          backgroundColor: doc.styles.backgroundColor,
          fontFamily: doc.styles.fontFamily,
          margin: 0,
        }}
      >
        <Container
          style={{
            width: doc.styles.width ?? 600,
            backgroundColor: doc.styles.contentBackgroundColor,
            margin: '0 auto',
          }}
        >
          {doc.rows.map((row) => renderRow(row, doc.sampleValues))}
        </Container>
      </Body>
    </Html>
  )
}
