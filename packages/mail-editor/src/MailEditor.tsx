import { KeyboardArrowDown, KeyboardArrowLeft, KeyboardArrowRight, KeyboardArrowUp, Redo, Save, Send, Undo } from '@mui/icons-material'
import { Box, Button, ScopedCssBaseline, Stack, Tab, Tabs } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useEffect, useLayoutEffect, useRef, useState, type FC } from 'react'
import { Group, Panel, Separator, useDefaultLayout, type PanelImperativeHandle } from 'react-resizable-panels'

import { TooltipIconButton } from './components/TooltipIconButton'
import { EditableCanvas } from './editor/EditableCanvas'
import { useActions, useUndo } from './hooks/useDocument'
import { JsonPanel } from './panels/JsonPanel'
import { PropertiesPanel } from './panels/PropertiesPanel'
import { SamplePanel } from './panels/SamplePanel'
import { exportHTML } from './render/exportHTML'
import { useDocumentStore } from './store/store'
import type { EmailDocument } from './types/schema'

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

export type MailEditorProps = {
  initialDocument?: EmailDocument
  onJsonExport?: (doc: EmailDocument) => void
  onHtmlExport?: (html: string) => void | Promise<void>
}

const PaneHeader: FC<{ children: React.ReactNode }> = ({ children }) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    sx={{
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

export const MailEditor: FC<MailEditorProps> = ({ initialDocument, onJsonExport, onHtmlExport }) => {
  const { undo, redo, canUndo, canRedo } = useUndo()
  const { resetDocument } = useActions()
  const [tab, setTab] = useState<TabKey>('sample')
  const [exporting, setExporting] = useState(false)
  const [bottomCollapsed, setBottomCollapsed] = useState(false)
  const [propsCollapsed, setPropsCollapsed] = useState(false)

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

  const handleJsonExport = () => onJsonExport?.(useDocumentStore.getState().doc)

  const handleHtmlExport = async () => {
    if (!onHtmlExport) return
    setExporting(true)
    try {
      const html = await exportHTML(useDocumentStore.getState().doc)
      await onHtmlExport(html)
    } finally {
      setExporting(false)
    }
  }

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
              <Stack direction="row" spacing={1}>
                {onJsonExport && (
                  <Button size="small" variant="outlined" startIcon={<Save />} onClick={handleJsonExport} sx={{ textTransform: 'none' }}>
                    저장
                  </Button>
                )}
                {onHtmlExport && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Send />}
                    onClick={() => void handleHtmlExport()}
                    disabled={exporting}
                    sx={{ textTransform: 'none' }}
                  >
                    {exporting ? '내보내는 중...' : 'HTML로 내보내기'}
                  </Button>
                )}
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button size="small" startIcon={<Undo />} onClick={undo} disabled={!canUndo} sx={{ textTransform: 'none' }}>
                  Undo
                </Button>
                <Button size="small" startIcon={<Redo />} onClick={redo} disabled={!canRedo} sx={{ textTransform: 'none' }}>
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
                  <Stack sx={{ height: '100%' }}>
                    <EditableCanvas />
                  </Stack>
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
