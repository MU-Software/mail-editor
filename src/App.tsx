import {
  ArrowDropDown,
  Code,
  Description,
  FileDownload,
  FileUpload,
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardArrowUp,
  Redo,
  Undo,
} from '@mui/icons-material'
import { Box, Button, ListItemIcon, ListItemText, Menu, MenuItem, Snackbar, Stack, Tab, Tabs } from '@mui/material'
import { useEffect, useRef, useState, type FC, type MouseEvent } from 'react'
import { Group, Panel, Separator, useDefaultLayout, type PanelImperativeHandle } from 'react-resizable-panels'

import { TooltipIconButton } from './components/TooltipIconButton'
import { EditableCanvas } from './editor/EditableCanvas'
import { useUndo } from './hooks/useDocument'
import { JsonExportDialog } from './panels/JsonExportDialog'
import { JsonImportDialog } from './panels/JsonImportDialog'
import { JsonPanel } from './panels/JsonPanel'
import { PropertiesPanel } from './panels/PropertiesPanel'
import { SamplePanel } from './panels/SamplePanel'
import { exportHTML } from './render/exportHTML'
import { useDocumentStore } from './store/store'
import { formatBytes, GMAIL_CLIP_BYTES } from './utils/validation'

type TabKey = 'sample' | 'json'

export type AppProps = {
  onExport?: (html: string) => void | Promise<void>
}

const PaneHeader: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
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
}

export const App: FC<AppProps> = ({ onExport }) => {
  const { undo, redo, canUndo, canRedo } = useUndo()
  const [tab, setTab] = useState<TabKey>('sample')
  const [exporting, setExporting] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [bottomCollapsed, setBottomCollapsed] = useState(false)
  const [propsCollapsed, setPropsCollapsed] = useState(false)
  const [sizeNotice, setSizeNotice] = useState<string | null>(null)

  const bottomRef = useRef<PanelImperativeHandle>(null)
  const propsRef = useRef<PanelImperativeHandle>(null)

  const horizontalLayout = useDefaultLayout({ id: 'mail-editor-h' })
  const verticalLayout = useDefaultLayout({ id: 'mail-editor-v' })

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

  const openMenu = (e: MouseEvent<HTMLButtonElement>) => setMenuAnchor(e.currentTarget)
  const closeMenu = () => setMenuAnchor(null)

  const handleHtmlExport = async () => {
    closeMenu()
    if (!onExport) return
    setExporting(true)
    try {
      const html = await exportHTML(useDocumentStore.getState().doc)
      const sizeBytes = new Blob([html]).size
      const sizeText = formatBytes(sizeBytes)
      if (sizeBytes > GMAIL_CLIP_BYTES) {
        const proceed = window.confirm(
          `HTML 크기: ${sizeText}\n\n` +
            `Gmail은 102KB가 넘는 메시지를 잘라내고 (clip) "전체 메시지 보기" 링크를 표시합니다.\n\n` +
            `그대로 내보내시겠습니까?`,
        )
        if (!proceed) return
      }
      setSizeNotice(`HTML 크기: ${sizeText}`)
      await onExport(html)
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

  const trackBottomCollapsed = () => {
    setBottomCollapsed(bottomRef.current?.isCollapsed() ?? false)
  }

  const trackPropsCollapsed = () => {
    setPropsCollapsed(propsRef.current?.isCollapsed() ?? false)
  }

  return (
    <Box sx={{ height: '100vh' }}>
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
              <span>editor</span>
              <Stack direction="row" spacing={1}>
                <Button size="small" startIcon={<Undo />} onClick={undo} disabled={!canUndo} sx={{ textTransform: 'none' }}>
                  Undo
                </Button>
                <Button size="small" startIcon={<Redo />} onClick={redo} disabled={!canRedo} sx={{ textTransform: 'none' }}>
                  Redo
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<ArrowDropDown />}
                  onClick={openMenu}
                  disabled={exporting}
                  sx={{ textTransform: 'none' }}
                >
                  {exporting ? '내보내는 중...' : '불러오기 / 내보내기'}
                </Button>
                <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={closeMenu}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem
                    onClick={() => {
                      closeMenu()
                      setImportOpen(true)
                    }}
                  >
                    <ListItemIcon>
                      <FileUpload fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>JSON 불러오기</ListItemText>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      closeMenu()
                      setExportOpen(true)
                    }}
                  >
                    <ListItemIcon>
                      <Code fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>JSON 내보내기</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => void handleHtmlExport()} disabled={!onExport}>
                    <ListItemIcon>{onExport ? <FileDownload fontSize="small" /> : <Description fontSize="small" />}</ListItemIcon>
                    <ListItemText>HTML 내보내기</ListItemText>
                  </MenuItem>
                </Menu>
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
                <Separator className="resize-handle-vertical" />
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
        <Separator className="resize-handle-horizontal" />
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
      <JsonImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
      <JsonExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
      <Snackbar
        open={sizeNotice !== null}
        autoHideDuration={4000}
        onClose={() => setSizeNotice(null)}
        message={sizeNotice ?? ''}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  )
}
