import { ListItemIcon, ListItemText, Menu, MenuItem, type PopoverOrigin } from '@mui/material'
import type { FC } from 'react'

import type { Block } from '@musoftware/mail-editor/types/schema'

import { BLOCK_TYPES } from './schemas'

type BlockTypeMenuProps = {
  anchorEl: HTMLElement | null
  open: boolean
  onClose: () => void
  onSelect: (type: Block['type']) => void
  anchorOrigin?: PopoverOrigin
  transformOrigin?: PopoverOrigin
}

export const BlockTypeMenu: FC<BlockTypeMenuProps> = ({
  anchorEl,
  open,
  onClose,
  onSelect,
  anchorOrigin = { vertical: 'bottom', horizontal: 'center' },
  transformOrigin = { vertical: 'top', horizontal: 'center' },
}) => (
  <Menu anchorEl={anchorEl} open={open} onClose={onClose} anchorOrigin={anchorOrigin} transformOrigin={transformOrigin}>
    {BLOCK_TYPES.map((opt) => (
      <MenuItem
        key={opt.type}
        onClick={() => {
          onSelect(opt.type)
          onClose()
        }}
        dense
      >
        <ListItemIcon sx={{ minWidth: 32 }}>{opt.icon}</ListItemIcon>
        <ListItemText>{opt.label}</ListItemText>
      </MenuItem>
    ))}
  </Menu>
)
