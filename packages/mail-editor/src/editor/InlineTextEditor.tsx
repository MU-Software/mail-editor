import { TooltipIconButton } from '@mu-software/mail-editor/components/TooltipIconButton'
import { validateHref, validateVariableMarkIntegrity } from '@mu-software/mail-editor/utils/validation'
import {
  FormatBold,
  FormatColorText,
  FormatItalic,
  FormatStrikethrough,
  FormatUnderlined,
  Highlight as HighlightIcon,
  Link as LinkIcon,
  type SvgIconComponent,
} from '@mui/icons-material'
import { Box, Button, Menu, Stack, type SxProps, type Theme } from '@mui/material'
import { Color } from '@tiptap/extension-color'
import HighlightExt from '@tiptap/extension-highlight'
import LinkExt from '@tiptap/extension-link'
import { TextStyle } from '@tiptap/extension-text-style'
import UnderlineExt from '@tiptap/extension-underline'
import { type Editor, EditorContent, Extension, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useRef, useState, type CSSProperties, type FC } from 'react'

const DEFAULT_COLOR = '#000000'
const DEFAULT_HIGHLIGHT = '#fff7a8'

const normalize = (html: string): string => html.replace(/<\/p>\s*<p>/g, '<br>').replace(/^<p>(.*?)<\/p>\s*$/s, '$1')

const runWithIntegrity = (editor: Editor, apply: () => void) => {
  const before = normalize(editor.getHTML())
  apply()
  const after = normalize(editor.getHTML())
  if (before === after) return
  const result = validateVariableMarkIntegrity(after)
  if (!result.ok) {
    editor.commands.undo()
    window.alert(result.message)
  }
}

const FORMAT_SHORTCUTS = {
  'Mod-b': (c: ReturnType<Editor['chain']>) => c.toggleBold(),
  'Mod-i': (c: ReturnType<Editor['chain']>) => c.toggleItalic(),
  'Mod-u': (c: ReturnType<Editor['chain']>) => c.toggleUnderline(),
  'Mod-Shift-x': (c: ReturnType<Editor['chain']>) => c.toggleStrike(),
} as const

const ValidatedFormatShortcuts = Extension.create({
  name: 'validatedFormatShortcuts',
  priority: 1000,
  addKeyboardShortcuts() {
    return Object.fromEntries(
      Object.entries(FORMAT_SHORTCUTS).map(([key, op]) => [
        key,
        () => {
          runWithIntegrity(this.editor, () => op(this.editor.chain().focus()).run())
          return true
        },
      ]),
    )
  },
})

type InlineTextEditorProps = {
  initialHtml: string
  onCommit: (html: string) => void
  onChange?: (html: string) => void
  onCancel: () => void
  style?: CSSProperties
  contentSx?: SxProps<Theme>
  toolbarPosition?: 'floating' | 'inline'
}

export const InlineTextEditor: FC<InlineTextEditorProps> = ({
  initialHtml,
  onCommit,
  onChange,
  onCancel,
  style,
  contentSx,
  toolbarPosition = 'floating',
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        heading: false,
        link: false,
      }),
      UnderlineExt,
      TextStyle,
      Color,
      HighlightExt.configure({ multicolor: true }),
      LinkExt.configure({ openOnClick: false }),
      ValidatedFormatShortcuts,
    ],
    content: `<p>${initialHtml}</p>`,
    autofocus: 'end',
  })

  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!editor) return
    const dom = editor.view.dom
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        onCommit(normalize(editor.getHTML()))
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    }
    const onBlur = ({ event }: { event: FocusEvent }) => {
      const next = event.relatedTarget as HTMLElement | null
      if (next?.closest('[data-mail-toolbar]')) return
      onCommit(normalize(editor.getHTML()))
    }
    const onUpdate = () => onChangeRef.current?.(normalize(editor.getHTML()))
    dom.addEventListener('keydown', onKey)
    editor.on('blur', onBlur)
    editor.on('update', onUpdate)
    return () => {
      dom.removeEventListener('keydown', onKey)
      editor.off('blur', onBlur)
      editor.off('update', onUpdate)
    }
  }, [editor, onCommit, onCancel])

  const marks = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive('bold') ?? false,
      italic: editor?.isActive('italic') ?? false,
      underline: editor?.isActive('underline') ?? false,
      strike: editor?.isActive('strike') ?? false,
      link: editor?.isActive('link') ?? false,
      color: (editor?.getAttributes('textStyle').color as string | undefined) ?? null,
      highlight: (editor?.getAttributes('highlight').color as string | undefined) ?? null,
    }),
  })

  if (!editor) return null

  const activeBtnSx = (active: boolean) => ({
    background: active ? 'rgba(74, 158, 255, 0.18)' : undefined,
    '&:hover': {
      background: active ? 'rgba(74, 158, 255, 0.28)' : 'rgba(0, 0, 0, 0.04)',
    },
  })

  const runFormat = (op: (c: ReturnType<Editor['chain']>) => ReturnType<Editor['chain']>) =>
    runWithIntegrity(editor, () => op(editor.chain().focus()).run())

  const toggleBold = () => runFormat((c) => c.toggleBold())
  const toggleItalic = () => runFormat((c) => c.toggleItalic())
  const toggleUnderline = () => runFormat((c) => c.toggleUnderline())
  const toggleStrike = () => runFormat((c) => c.toggleStrike())
  const setColor = (color: string) => runFormat((c) => c.setColor(color))
  const unsetColor = () => runFormat((c) => c.unsetColor())
  const setHighlight = (color: string) => runFormat((c) => c.setHighlight({ color }))
  const unsetHighlight = () => runFormat((c) => c.unsetHighlight())

  const toggleLink = () => {
    const current = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL', current ?? '')
    if (url === null) return
    if (url === '') {
      runFormat((c) => c.unsetLink())
      return
    }
    const hrefResult = validateHref(url, { required: false })
    if (!hrefResult.ok) {
      window.alert(hrefResult.message)
      return
    }
    runFormat((c) => c.extendMarkRange('link').setLink({ href: url }))
  }

  const floating = toolbarPosition === 'floating'
  const toolbarSx: SxProps<Theme> = floating
    ? {
        position: 'absolute',
        left: 0,
        top: 0,
        transform: 'translateY(-100%)',
        zIndex: 16,
      }
    : { mb: 0.5 }

  return (
    <Box style={style} sx={floating ? { position: 'relative' } : undefined}>
      <Stack
        direction="row"
        spacing={0.25}
        data-mail-toolbar=""
        sx={[
          toolbarSx,
          {
            background: 'white',
            border: '1px solid rgba(0,0,0,0.23)',
            borderRadius: 0.5,
            p: 0.25,
            display: 'inline-flex',
          },
        ]}
        onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
      >
        <TooltipIconButton
          title="굵게 (Cmd+B)"
          icon={FormatBold}
          color={marks?.bold ? 'primary' : 'default'}
          sx={activeBtnSx(marks?.bold ?? false)}
          onClick={toggleBold}
        />
        <TooltipIconButton
          title="기울임 (Cmd+I)"
          icon={FormatItalic}
          color={marks?.italic ? 'primary' : 'default'}
          sx={activeBtnSx(marks?.italic ?? false)}
          onClick={toggleItalic}
        />
        <TooltipIconButton
          title="밑줄 (Cmd+U)"
          icon={FormatUnderlined}
          color={marks?.underline ? 'primary' : 'default'}
          sx={activeBtnSx(marks?.underline ?? false)}
          onClick={toggleUnderline}
        />
        <TooltipIconButton
          title="취소선 (Cmd+Shift+X)"
          icon={FormatStrikethrough}
          color={marks?.strike ? 'primary' : 'default'}
          sx={activeBtnSx(marks?.strike ?? false)}
          onClick={toggleStrike}
        />
        <ColorPickerButton
          title="글자색"
          icon={FormatColorText}
          activeColor={marks?.color ?? null}
          defaultColor={DEFAULT_COLOR}
          activeBtnSx={activeBtnSx}
          onSet={setColor}
          onClear={unsetColor}
        />
        <ColorPickerButton
          title="형광펜"
          icon={HighlightIcon}
          activeColor={marks?.highlight ?? null}
          defaultColor={DEFAULT_HIGHLIGHT}
          activeBtnSx={activeBtnSx}
          onSet={setHighlight}
          onClear={unsetHighlight}
        />
        <TooltipIconButton
          title="링크"
          icon={LinkIcon}
          color={marks?.link ? 'primary' : 'default'}
          sx={activeBtnSx(marks?.link ?? false)}
          onClick={toggleLink}
        />
      </Stack>
      <Box
        sx={{
          outline: '2px solid #4a9eff',
          outlineOffset: '-2px',
          background: 'rgba(74, 158, 255, 0.05)',
          '& .ProseMirror': { outline: 'none', minHeight: '1em' },
          '& .ProseMirror p': { margin: 0 },
          ...contentSx,
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  )
}

type ColorPickerButtonProps = {
  title: string
  icon: SvgIconComponent
  activeColor: string | null
  defaultColor: string
  activeBtnSx: (active: boolean) => SxProps<Theme>
  onSet: (color: string) => void
  onClear: () => void
}

const ColorPickerButton: FC<ColorPickerButtonProps> = ({ title, icon, activeColor, defaultColor, activeBtnSx, onSet, onClear }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const active = activeColor !== null
  const swatch = activeColor ?? defaultColor

  return (
    <>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <TooltipIconButton
          title={title}
          icon={icon}
          color={active ? 'primary' : 'default'}
          sx={activeBtnSx(active)}
          onClick={(e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: 6,
            right: 6,
            bottom: 4,
            height: 3,
            borderRadius: 0.5,
            background: swatch,
            border: '1px solid rgba(0,0,0,0.15)',
            pointerEvents: 'none',
          }}
        />
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        slotProps={{
          paper: {
            sx: { p: 1 },
            ...({ 'data-mail-toolbar': '' } as Record<string, string>),
          },
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <input
            type="color"
            value={activeColor ?? defaultColor}
            onChange={(e) => onSet(e.target.value)}
            style={{
              width: 36,
              height: 36,
              border: '1px solid rgba(0,0,0,0.23)',
              borderRadius: 4,
              padding: 0,
              cursor: 'pointer',
              background: 'transparent',
            }}
          />
          <Button
            size="small"
            variant="outlined"
            disabled={!active}
            onClick={() => {
              onClear()
              setAnchorEl(null)
            }}
          >
            지우기
          </Button>
        </Stack>
      </Menu>
    </>
  )
}
