import { useDocument } from '@mu-software/mail-editor/hooks/useDocument'
import { previewHTML } from '@mu-software/mail-editor/render/exportHTML'
import { Computer, PhoneIphone, TabletMac } from '@mui/icons-material'
import { Box, CircularProgress, InputAdornment, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useEffect, useState, type ChangeEvent, type FC } from 'react'

const DEVICE_PRESETS = {
  mobile: { width: 375, label: '모바일', Icon: PhoneIphone },
  tablet: { width: 768, label: '태블릿', Icon: TabletMac },
  desktop: { width: 1024, label: '데스크톱', Icon: Computer },
} as const

type DeviceKey = keyof typeof DEVICE_PRESETS

const MIN_WIDTH = 200
const MAX_WIDTH = 2000

const presetForWidth = (w: number): DeviceKey | null => {
  for (const key of Object.keys(DEVICE_PRESETS) as DeviceKey[]) {
    if (DEVICE_PRESETS[key].width === w) return key
  }
  return null
}

export const PreviewCanvas: FC = () => {
  const doc = useDocument((d) => d)
  const [width, setWidth] = useState<number>(DEVICE_PRESETS.desktop.width)
  const [widthInput, setWidthInput] = useState<string>(String(DEVICE_PRESETS.desktop.width))
  const [html, setHtml] = useState<string | null>(null)
  const matchedPreset = presetForWidth(width)

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => {
      void previewHTML(doc).then((result) => {
        if (!cancelled) setHtml(result)
      })
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [doc])

  const applyWidth = (w: number) => {
    const clamped = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(w)))
    setWidth(clamped)
    setWidthInput(String(clamped))
  }

  const onWidthInputChange = (raw: string) => {
    setWidthInput(raw)
    const n = Number(raw)
    if (!Number.isFinite(n) || n < MIN_WIDTH || n > MAX_WIDTH) return
    setWidth(Math.round(n))
  }

  const onWidthInputBlur = () => {
    setWidthInput(String(width))
  }

  return (
    <Stack sx={{ height: '100%', minHeight: 0 }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          py: 0.75,
          px: 1,
          background: '#fff',
          borderBottom: '1px solid #ddd',
          flexShrink: 0,
        }}
      >
        <ToggleButtonGroup
          value={matchedPreset}
          exclusive
          size="small"
          onChange={(_, v: DeviceKey | null) => {
            if (v) applyWidth(DEVICE_PRESETS[v].width)
          }}
        >
          {(Object.entries(DEVICE_PRESETS) as [DeviceKey, (typeof DEVICE_PRESETS)[DeviceKey]][]).map(([key, preset]) => (
            <ToggleButton key={key} value={key} sx={{ textTransform: 'none', gap: 0.5, fontSize: 12, py: 0.25, px: 1 }}>
              <preset.Icon fontSize="small" />
              {preset.label}
              <Box component="span" sx={{ color: 'text.secondary', fontSize: 11 }}>
                {preset.width}px
              </Box>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <TextField
          size="small"
          type="number"
          value={widthInput}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onWidthInputChange(e.target.value)}
          onBlur={onWidthInputBlur}
          slotProps={{
            input: { endAdornment: <InputAdornment position="end">px</InputAdornment> },
            htmlInput: { min: MIN_WIDTH, max: MAX_WIDTH, step: 10, style: { textAlign: 'right' } },
          }}
          sx={{ width: 110, '& .MuiInputBase-input': { fontSize: 12, py: 0.5 } }}
        />
      </Stack>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowX: 'auto',
          overflowY: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          py: 3,
          px: 2,
          background: '#e8e8e8',
        }}
      >
        {html === null ? (
          <CircularProgress sx={{ mt: 4 }} />
        ) : (
          <Box
            component="iframe"
            srcDoc={html}
            title="이메일 미리보기"
            sx={{
              width,
              flexShrink: 0,
              alignSelf: 'stretch',
              border: 'none',
              background: '#fff',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.12)',
            }}
          />
        )}
      </Box>
    </Stack>
  )
}
