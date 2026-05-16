import { Edit, KeyboardArrowDown, KeyboardArrowLeft, KeyboardArrowRight, KeyboardArrowUp, Redo, Undo, Visibility } from '@mui/icons-material'
import { Box, Button, ScopedCssBaseline, Stack, Tab, Tabs, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type FC, type Ref } from 'react'
import { Group, Panel, Separator, useDefaultLayout, type PanelImperativeHandle } from 'react-resizable-panels'

import { TooltipIconButton } from './components/TooltipIconButton'
import { EditableCanvas } from './editor/EditableCanvas'
import { PreviewCanvas } from './editor/PreviewCanvas'
import { useActions, useUndo } from './hooks/useDocument'
import { JsonPanel } from './panels/JsonPanel'
import { PropertiesPanel } from './panels/PropertiesPanel'
import { SamplePanel } from './panels/SamplePanel'
import { exportHTML } from './render/exportHTML'
import { useDocumentStore } from './store/store'
import type { EmailDocument } from './types/schema'
import { stringifyEmailDocument } from './utils/jsonIO'

const Resizer = styled(Separator)({
  background: '#ccc',
  flexShrink: 0,
  transition: 'background 0.15s',
  '&:hover': {
    background: '#4a9eff',
  },
})

const RowResizer = styled(Resizer)({
  height: 4,
  cursor: 'row-resize',
})

const ColumnResizer = styled(Resizer)({
  width: 4,
  cursor: 'col-resize',
})

type TabKey = 'sample' | 'json'
type Mode = 'edit' | 'preview'

export type MailEditorHandle = {
  exportEmailDocument: () => EmailDocument
  exportJson: () => string
  exportHTML: () => Promise<string>
}

export type MailEditorProps = {
  initialDocument?: EmailDocument
  ref?: Ref<MailEditorHandle>
}

const PaneHeader: FC<{ children: React.ReactNode }> = ({ children }) => (
  <Stack
    direction="row"
    sx={{
      justifyContent: 'space-between',
      alignItems: 'center',
      px: 1,
      py: 0.5,
      minHeight: 36,
      fontSize: 12,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      flexShrink: 0,
      background: '#ddd',
      color: '#555',
      borderBottom: '1px solid #ccc',
    }}
  >
    {children}
  </Stack>
)

export const MailEditor: FC<MailEditorProps> = ({ initialDocument, ref }) => {
  const { undo, redo, canUndo, canRedo } = useUndo()
  const { resetDocument } = useActions()
  const [tab, setTab] = useState<TabKey>('sample')
  const [mode, setMode] = useState<Mode>('edit')
  const [bottomCollapsed, setBottomCollapsed] = useState(false)
  const [propsCollapsed, setPropsCollapsed] = useState(false)

  useImperativeHandle(
    ref,
    () => ({
      exportEmailDocument: () => useDocumentStore.getState().doc,
      exportJson: () => stringifyEmailDocument(useDocumentStore.getState().doc),
      exportHTML: () => exportHTML(useDocumentStore.getState().doc),
    }),
    [],
  )

  const bottomRef = useRef<PanelImperativeHandle>(null)
  const propsRef = useRef<PanelImperativeHandle>(null)

  const horizontalLayout = useDefaultLayout({ id: 'mail-editor-h' })
  const verticalLayout = useDefaultLayout({ id: 'mail-editor-v' })

  useLayoutEffect(() => {
    if (initialDocument) resetDocument(initialDocument)
  }, [initialDocument, resetDocument])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return
      if (e.key.toLowerCase() !== 'z') return
      const active = document.activeElement as HTMLElement | null
      if (active?.isContentEditable) return
      if (active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA') return
      e.preventDefault()
      if (e.shiftKey) {
        if (canRedo) redo()
      } else {
        if (canUndo) undo()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo, canUndo, canRedo])

  const toggleBottomPanel = () => {
    const p = bottomRef.current
    if (!p) return
    if (p.isCollapsed()) p.expand()
    else p.collapse()
  }

  const togglePropsPanel = () => {
    const p = propsRef.current
    if (!p) return
    if (p.isCollapsed()) p.expand()
    else p.collapse()
  }

  const trackBottomCollapsed = () => setBottomCollapsed(bottomRef.current?.isCollapsed() ?? false)

  const trackPropsCollapsed = () => setPropsCollapsed(propsRef.current?.isCollapsed() ?? false)

  return (
    <ScopedCssBaseline sx={{ height: '100%' }}>
      <Group
        orientation="horizontal"
        id="mail-editor-h"
        defaultLayout={horizontalLayout.defaultLayout}
        onLayoutChanged={horizontalLayout.onLayoutChanged}
        style={{ height: '100%' }}
      >
        <Panel id="main" defaultSize={75} minSize={40}>
          <Stack sx={{ height: '100%', background: '#f4f4f4' }}>
            <PaneHeader>
              <ToggleButtonGroup
                value={mode}
                exclusive
                size="small"
                onChange={(_, v: Mode | null) => {
                  if (v) setMode(v)
                }}
              >
                <ToggleButton value="edit" sx={{ textTransform: 'none', gap: 0.5, fontSize: 12, py: 0.25, px: 1 }}>
                  <Edit fontSize="small" />
                  편집
                </ToggleButton>
                <ToggleButton value="preview" sx={{ textTransform: 'none', gap: 0.5, fontSize: 12, py: 0.25, px: 1 }}>
                  <Visibility fontSize="small" />
                  미리보기
                </ToggleButton>
              </ToggleButtonGroup>
              <Stack direction="row" spacing={1}>
                <Button size="small" startIcon={<Undo />} onClick={undo} disabled={!canUndo || mode !== 'edit'} sx={{ textTransform: 'none' }}>
                  Undo
                </Button>
                <Button size="small" startIcon={<Redo />} onClick={redo} disabled={!canRedo || mode !== 'edit'} sx={{ textTransform: 'none' }}>
                  Redo
                </Button>
              </Stack>
            </PaneHeader>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <Group
                orientation="vertical"
                id="mail-editor-v"
                defaultLayout={verticalLayout.defaultLayout}
                onLayoutChanged={verticalLayout.onLayoutChanged}
                style={{ height: '100%' }}
              >
                <Panel id="canvas" defaultSize={70} minSize={30}>
                  <Stack sx={{ height: '100%' }}>{mode === 'edit' ? <EditableCanvas /> : <PreviewCanvas />}</Stack>
                </Panel>
                <RowResizer />
                <Panel
                  id="bottom"
                  panelRef={bottomRef}
                  defaultSize={30}
                  minSize="120px"
                  collapsible
                  collapsedSize="36px"
                  onResize={trackBottomCollapsed}
                >
                  <Stack sx={{ height: '100%' }}>
                    <PaneHeader>
                      {bottomCollapsed ? (
                        <Box />
                      ) : (
                        <Tabs
                          value={tab}
                          onChange={(_, v: TabKey) => setTab(v)}
                          textColor="primary"
                          indicatorColor="primary"
                          sx={{
                            minHeight: 32,
                            '& .MuiTab-root': {
                              minHeight: 32,
                              fontSize: 12,
                              textTransform: 'none',
                              py: 0,
                            },
                          }}
                        >
                          <Tab label="샘플 값" value="sample" />
                          <Tab label="JSON" value="json" />
                        </Tabs>
                      )}
                      <TooltipIconButton
                        title={bottomCollapsed ? '펼치기' : '접기'}
                        icon={bottomCollapsed ? KeyboardArrowUp : KeyboardArrowDown}
                        onClick={toggleBottomPanel}
                      />
                    </PaneHeader>
                    {!bottomCollapsed && (
                      <Stack
                        sx={{
                          flex: 1,
                          minHeight: 0,
                          overflow: 'hidden',
                        }}
                      >
                        {tab === 'sample' && <SamplePanel />}
                        {tab === 'json' && <JsonPanel />}
                      </Stack>
                    )}
                  </Stack>
                </Panel>
              </Group>
            </Box>
          </Stack>
        </Panel>
        <ColumnResizer />
        <Panel id="properties" panelRef={propsRef} defaultSize={25} minSize="180px" collapsible collapsedSize="40px" onResize={trackPropsCollapsed}>
          <Stack sx={{ height: '100%', background: 'white' }}>
            <PaneHeader>
              {!propsCollapsed && <span>속성</span>}
              <TooltipIconButton
                title={propsCollapsed ? '펼치기' : '접기'}
                icon={propsCollapsed ? KeyboardArrowLeft : KeyboardArrowRight}
                onClick={togglePropsPanel}
              />
            </PaneHeader>
            {!propsCollapsed && (
              <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                <PropertiesPanel />
              </Box>
            )}
          </Stack>
        </Panel>
      </Group>
    </ScopedCssBaseline>
  )
}
