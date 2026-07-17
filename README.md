# mail-editor

English | [한국어](./README.ko.md)

A block-based visual editor for building responsive, email-client-safe HTML emails in React.

**[▶ Try the playground](https://mu-software.github.io/mail-editor/)**

## Features

- **Visual block editor** — rows/columns layout with text, heading, image, button, divider, spacer, and list blocks.
- **Rich text** — inline formatting powered by Tiptap.
- **Template variables** — write `{{ name }}` placeholders, preview them with sample values, and export HTML that keeps the placeholders intact (Django/Jinja-compatible).
- **Email-safe HTML export** — rendered via [react-email](https://react.email), including an Outlook VML fixed-width button fallback.
- **JSON import/export** — a Zod-validated, serializable document schema.
- **Undo/redo** and a Gmail clip-size (102 KB) warning on export.

## Install

```bash
pnpm add @mu-software/mail-editor react react-dom
```

Requires React 19.

## Usage

```tsx
import { useRef } from 'react'
import { MailEditor, createEmptyDocument, parseEmailDocument, type MailEditorHandle } from '@mu-software/mail-editor'

function App() {
  const ref = useRef<MailEditorHandle>(null)

  const onExport = async () => {
    const html = await ref.current?.exportHTML() // email-client-safe HTML
    const json = ref.current?.exportJson() // serializable document (string)
  }

  return <MailEditor ref={ref} initialDocument={createEmptyDocument()} />
}
```

Load a previously saved document with `parseEmailDocument(jsonString)` and pass it as `initialDocument`.

### `MailEditorHandle`

| Method                  | Returns           | Description                 |
| ----------------------- | ----------------- | --------------------------- |
| `exportEmailDocument()` | `EmailDocument`   | Current document object     |
| `exportJson()`          | `string`          | Document serialized to JSON |
| `exportHTML()`          | `Promise<string>` | Email-client-safe HTML      |

## Development

This is a pnpm monorepo (`packages/mail-editor` — the library; `apps/playground` — the demo app). Requires Node 22+.

```bash
pnpm install
pnpm dev              # run the playground locally
pnpm build            # build all packages
pnpm build:package    # build the library only
```

## License

MIT
