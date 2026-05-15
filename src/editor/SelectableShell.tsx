import { Box, Stack } from '@mui/material'
import { type MouseEvent, type ReactNode } from 'react'
import { useActions } from '../hooks/useDocument'

type SelectableKind = 'row' | 'column' | 'block'

const DATA_ATTR: Record<SelectableKind, string> = {
  row: 'data-row-id',
  column: 'data-column-id',
  block: 'data-block-id',
}

const SELECTED_OUTLINE = '2px solid #4a9eff'

type SxObject = Record<string, unknown>

export function SelectableShell({
  kind,
  id,
  selected,
  outlineOffset,
  hoverOutline = SELECTED_OUTLINE,
  hoverOutlineOffset = outlineOffset,
  hoverReveals,
  sx,
  children,
}: {
  kind: SelectableKind
  id: string
  selected: boolean
  outlineOffset: string
  hoverOutline?: string
  hoverOutlineOffset?: string
  hoverReveals: readonly string[]
  sx?: SxObject
  children: ReactNode
}) {
  const { setSelection } = useActions()
  const reveal: SxObject = Object.fromEntries(
    hoverReveals.map((c) => [`&:hover > .${c}`, { display: 'flex' }]),
  )
  return (
    <Box
      {...{ [DATA_ATTR[kind]]: id }}
      onClick={(e: MouseEvent) => {
        e.stopPropagation()
        setSelection({ kind, id })
      }}
      sx={{
        position: 'relative',
        outline: selected ? SELECTED_OUTLINE : undefined,
        outlineOffset: selected ? outlineOffset : undefined,
        '&:hover': !selected
          ? { outline: hoverOutline, outlineOffset: hoverOutlineOffset }
          : undefined,
        ...reveal,
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

export function HoverToolbar({
  className,
  sx,
  spacing,
  children,
}: {
  className: string
  sx: SxObject
  spacing?: number
  children: ReactNode
}) {
  return (
    <Stack
      direction="row"
      spacing={spacing}
      className={className}
      alignItems="center"
      onClick={(e: MouseEvent) => e.stopPropagation()}
      sx={{ display: 'none', position: 'absolute', ...sx }}
    >
      {children}
    </Stack>
  )
}
