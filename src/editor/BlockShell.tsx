import {
  Add,
  ArrowDownward,
  ArrowUpward,
  Build,
  Close,
  ContentCopy,
} from '@mui/icons-material'
import { Box } from '@mui/material'
import { useState, type MouseEvent, type ReactNode } from 'react'
import { TooltipIconButton } from '../components/TooltipIconButton'
import { useActions, useSelectedBlockId } from '../hooks/useDocument'
import type { Block } from '../types/schema'
import { stopAnd } from '../utils/events'
import { BlockTypeMenu } from './BlockTypeMenu'
import { HoverToolbar, SelectableShell } from './SelectableShell'

type InsertMode = 'before' | 'after'

function InsertHandle({
  position,
  forceVisible,
  onOpen,
}: {
  position: InsertMode
  forceVisible: boolean
  onOpen: (e: MouseEvent<HTMLButtonElement>) => void
}) {
  const above = position === 'before'
  return (
    <Box
      className="block-insert"
      style={forceVisible ? { display: 'flex' } : undefined}
      onClick={(e) => e.stopPropagation()}
      sx={{
        display: 'none',
        position: 'absolute',
        [above ? 'top' : 'bottom']: 0,
        left: '50%',
        transform: `translate(-50%, ${above ? '-50%' : '50%'})`,
        zIndex: 15,
      }}
    >
      <TooltipIconButton
        title={above ? '위에 블록 추가' : '아래에 블록 추가'}
        icon={Add}
        variant="outlined"
        onClick={onOpen}
      />
    </Box>
  )
}

export function BlockShell({
  blockId,
  canDelete,
  children,
}: {
  blockId: string
  canDelete: boolean
  children: ReactNode
}) {
  const {
    moveBlock,
    duplicateBlock,
    removeBlock,
    insertBlockBefore,
    insertBlockAfter,
    setSelection,
  } = useActions()
  const selectedId = useSelectedBlockId()
  const selected = selectedId === blockId

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [menuMode, setMenuMode] = useState<InsertMode>('after')
  const menuOpen = Boolean(menuAnchor)

  const openInsertMenu =
    (mode: InsertMode) => (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      setMenuMode(mode)
      setMenuAnchor(e.currentTarget)
    }

  const handleSelect = (type: Block['type']) => {
    if (menuMode === 'before') insertBlockBefore(blockId, type)
    else insertBlockAfter(blockId, type)
  }

  return (
    <SelectableShell
      kind="block"
      id={blockId}
      selected={selected}
      outlineOffset="2px"
      hoverOutline="1px dashed #4a9eff"
      hoverReveals={['block-controls', 'block-insert']}
    >
      <HoverToolbar
        className="block-controls"
        sx={{
          top: 0,
          right: 0,
          transform: 'translateY(-50%)',
          background: 'white',
          border: '1px solid #4a9eff',
          borderRadius: 0.5,
          px: 0.25,
          py: '1px',
          zIndex: 14,
        }}
      >
        <TooltipIconButton
          title="Block 속성 편집"
          icon={Build}
          onClick={stopAnd(() => setSelection({ kind: 'block', id: blockId }))}
        />
        <TooltipIconButton
          title="위로 이동"
          icon={ArrowUpward}
          onClick={stopAnd(() => moveBlock(blockId, 'up'))}
        />
        <TooltipIconButton
          title="아래로 이동"
          icon={ArrowDownward}
          onClick={stopAnd(() => moveBlock(blockId, 'down'))}
        />
        <TooltipIconButton
          title="복제"
          icon={ContentCopy}
          onClick={stopAnd(() => duplicateBlock(blockId))}
        />
        {canDelete && (
          <TooltipIconButton
            title="블록 삭제"
            icon={Close}
            sx={{
              color: '#d04',
              '&:hover': { background: '#d04', color: 'white' },
            }}
            onClick={stopAnd(() => removeBlock(blockId))}
          />
        )}
      </HoverToolbar>

      {children}

      <InsertHandle
        position="before"
        forceVisible={menuOpen}
        onOpen={openInsertMenu('before')}
      />
      <InsertHandle
        position="after"
        forceVisible={menuOpen}
        onOpen={openInsertMenu('after')}
      />

      <BlockTypeMenu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={() => setMenuAnchor(null)}
        onSelect={handleSelect}
      />
    </SelectableShell>
  )
}
