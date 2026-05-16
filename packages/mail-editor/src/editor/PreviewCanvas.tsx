import { useDocument } from '@mu-software/mail-editor/hooks/useDocument'
import { injectPreviewStyle, renderPreviewHTML, type PreviewTheme } from '@mu-software/mail-editor/render/exportHTML'
import { Computer, InfoOutlined, PhoneIphone, TabletMac } from '@mui/icons-material'
import {
  Box,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import { useEffect, useState, type ChangeEvent, type FC } from 'react'

const DEVICE_PRESETS = {
  mobile: { width: 375, label: '모바일', Icon: PhoneIphone },
  tablet: { width: 768, label: '태블릿', Icon: TabletMac },
  desktop: { width: 1024, label: '데스크톱', Icon: Computer },
} as const

type DeviceKey = keyof typeof DEVICE_PRESETS

const MIN_WIDTH = 200
const MAX_WIDTH = 2000

const THEME_OPTIONS: { value: PreviewTheme; label: string; description: string }[] = [
  { value: 'light', label: '라이트', description: '기본 라이트 모드. 메일이 원본 디자인 그대로 렌더링됩니다.' },
  {
    value: 'dark-invert',
    label: '다크 (자동 변환)',
    description: 'iOS·macOS Mail의 auto-invert 동작을 근사. 흰 로고 사라짐, 그라데이션 깨짐 같은 문제를 확인할 수 있습니다.',
  },
  {
    value: 'dark-bg',
    label: '다크 (변환 없음)',
    description: '본문은 그대로 두고 주변 배경만 다크. Outlook 데스크톱, Gmail 다크 테마(자동변환 OFF)의 동작과 비슷합니다.',
  },
]

const THEME_PALETTE: Record<PreviewTheme, { wrapper: string; iframe: string }> = {
  light: { wrapper: '#e8e8e8', iframe: '#ffffff' },
  'dark-invert': { wrapper: '#1c1c1e', iframe: '#1c1c1e' },
  'dark-bg': { wrapper: '#1c1c1e', iframe: '#1c1c1e' },
}

const presetForWidth = (w: number): DeviceKey | null => {
  for (const key of Object.keys(DEVICE_PRESETS) as DeviceKey[]) {
    if (DEVICE_PRESETS[key].width === w) return key
  }
  return null
}

type PreviewCanvasProps = {
  width: number
  theme: PreviewTheme
  onWidthChange: (w: number) => void
  onThemeChange: (t: PreviewTheme) => void
}

export const PreviewCanvas: FC<PreviewCanvasProps> = ({ width, theme, onWidthChange, onThemeChange }) => {
  const doc = useDocument((d) => d)
  const [widthInput, setWidthInput] = useState<string>(() => String(width))
  const [rawHtml, setRawHtml] = useState<string | null>(null)
  const matchedPreset = presetForWidth(width)
  const themeDescription = THEME_OPTIONS.find((o) => o.value === theme)?.description ?? ''
  const html = rawHtml === null ? null : injectPreviewStyle(rawHtml, theme)

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => {
      renderPreviewHTML(doc)
        .then((result) => {
          if (!cancelled) setRawHtml(result)
        })
        .catch((err: unknown) => {
          if (cancelled) return
          const message = err instanceof Error ? err.message : String(err)
          window.alert(`미리보기 렌더링 중 오류가 발생했습니다:\n${message}`)
        })
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [doc])

  const applyWidth = (w: number) => {
    const clamped = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(w)))
    onWidthChange(clamped)
    setWidthInput(String(clamped))
  }

  const onWidthInputChange = (raw: string) => {
    setWidthInput(raw)
    const n = Number(raw)
    if (!Number.isFinite(n) || n < MIN_WIDTH || n > MAX_WIDTH) return
    onWidthChange(Math.round(n))
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
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Select
            size="small"
            value={theme}
            onChange={(e) => onThemeChange(e.target.value)}
            sx={{ fontSize: 12, '& .MuiSelect-select': { py: 0.5 } }}
          >
            {THEME_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 12 }}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
          <Tooltip title={<Typography sx={{ fontSize: 12 }}>{themeDescription}</Typography>} placement="bottom">
            <InfoOutlined sx={{ fontSize: 16, color: 'text.secondary', cursor: 'help' }} />
          </Tooltip>
        </Stack>
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
          background: THEME_PALETTE[theme].wrapper,
          transition: 'background 0.15s',
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
              background: THEME_PALETTE[theme].iframe,
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.12)',
            }}
          />
        )}
      </Box>
    </Stack>
  )
}
