import type { SvgIconComponent } from '@mui/icons-material'
import { IconButton, Tooltip, type IconButtonProps, type SxProps, type Theme } from '@mui/material'
import type { FC, ReactNode } from 'react'

type Size = NonNullable<IconButtonProps['size']> | 'extra-small'
type Variant = 'plain' | 'outlined'

const extraSmallSx: SxProps<Theme> = { p: 0.25, fontSize: 14 }

type TooltipIconButtonProps = {
  title: ReactNode
  icon: SvgIconComponent
  variant?: Variant
  size?: Size
} & Omit<IconButtonProps, 'children' | 'size'>

export const TooltipIconButton: FC<TooltipIconButtonProps> = ({
  title,
  icon: Icon,
  variant = 'plain',
  color,
  size = 'extra-small',
  disabled,
  sx,
  ...rest
}) => {
  const isOutlined = variant === 'outlined'
  const effectiveColor = isOutlined ? (color ?? 'primary') : color
  const muiSize: IconButtonProps['size'] = size === 'extra-small' ? 'small' : size

  const outlinedSx: SxProps<Theme> = {
    background: 'white',
    border: '1px solid currentColor',
    '&:hover': {
      bgcolor: `${effectiveColor}.main`,
      color: `${effectiveColor}.contrastText`,
    },
  }

  const layers: SxProps<Theme>[] = []
  if (size === 'extra-small') layers.push(extraSmallSx)
  if (isOutlined) layers.push(outlinedSx)
  if (sx) {
    if (Array.isArray(sx)) layers.push(...(sx as SxProps<Theme>[]))
    else layers.push(sx)
  }

  const button = (
    <IconButton size={muiSize} color={effectiveColor} disabled={disabled} sx={layers as SxProps<Theme>} {...rest}>
      <Icon fontSize="inherit" />
    </IconButton>
  )
  return <Tooltip title={title}>{disabled ? <span>{button}</span> : button}</Tooltip>
}
