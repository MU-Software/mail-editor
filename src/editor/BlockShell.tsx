import {
  Add,
  ArrowDownward,
  ArrowUpward,
  Build,
  Close,
  ContentCopy,
} from '@mui/icons-material'
import { Box, Stack } from '@mui/material'
import { useState, type MouseEvent, type ReactNode } from 'react'
import { TooltipIconButton } from '../components/TooltipIconButton'
import { useActions, useSelectedBlockId } from '../hooks/useDocument'
import type { Block } from '../types/schema'
import { stopAnd } from '../utils/events'
import { BlockTypeMenu } from './BlockTypeMenu'

const blockBtnSx = {
  color: '#4a9eff',
  '&:hover': { background: '#4a9eff', color: 'white' },
} as const

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
    <Box
      data-block-id={blockId}
      onClick={(e) => {
        e.stopPropagation()
        setSelection({ kind: 'block', id: blockId })
      }}
      sx={{
        position: 'relative',
        outline: selected ? '2px solid #4a9eff' : undefined,
        outlineOffset: selected ? '2px' : undefined,
        '&:hover': !selected
          ? { outline: '1px dashed #4a9eff', outlineOffset: '2px' }
          : undefined,
        '&:hover > .block-controls': { display: 'flex' },
        '&:hover > .block-insert': { display: 'flex' },
      }}
    >
      <Stack
        direction="row"
        className="block-controls"
        alignItems="center"
        onClick={(e) => e.stopPropagation()}
        sx={{
          display: 'none',
          position: 'absolute',
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
          sx={blockBtnSx}
          onClick={stopAnd(() => setSelection({ kind: 'block', id: blockId }))}
        />
        <TooltipIconButton
          title="위로 이동"
          icon={ArrowUpward}
          sx={blockBtnSx}
          onClick={stopAnd(() => moveBlock(blockId, 'up'))}
        />
        <TooltipIconButton
          title="아래로 이동"
          icon={ArrowDownward}
          sx={blockBtnSx}
          onClick={stopAnd(() => moveBlock(blockId, 'down'))}
        />
        <TooltipIconButton
          title="복제"
          icon={ContentCopy}
          sx={blockBtnSx}
          onClick={stopAnd(() => duplicateBlock(blockId))}
        />
        {canDelete && (
          <TooltipIconButton
            title="블록 삭제"
            icon={Close}
            sx={{
              ...blockBtnSx,
              color: '#d04',
              '&:hover': { background: '#d04', color: 'white' },
            }}
            onClick={stopAnd(() => removeBlock(blockId))}
          />
        )}
      </Stack>

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
    </Box>
  )
}
