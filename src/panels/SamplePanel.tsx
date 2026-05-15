import {
  Box,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { Close } from '@mui/icons-material'
import { TooltipIconButton } from '../components/TooltipIconButton'
import { useMemo } from 'react'
import {
  useActions,
  useDocument,
  useSetShowRawVariables,
  useShowRawVariables,
} from '../hooks/useDocument'
import { extractVariableNames } from '../utils/extractVariables'

export function SamplePanel() {
  const doc = useDocument((d) => d)
  const sampleValues = doc.sampleValues
  const detected = useMemo(() => extractVariableNames(doc), [doc])
  const { setSampleValue, removeSampleValue } = useActions()
  const showRawVariables = useShowRawVariables()
  const setShowRawVariables = useSetShowRawVariables()

  const rows = useMemo(() => {
    const detectedSet = new Set(detected)
    const all = new Set([...detected, ...Object.keys(sampleValues)])
    return Array.from(all)
      .sort()
      .map((name) => ({
        name,
        value: sampleValues[name] ?? '',
        used: detectedSet.has(name),
      }))
  }, [detected, sampleValues])

  return (
    <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
      <Typography
        component="p"
        sx={{
          fontSize: 11,
          color: 'text.secondary',
          mt: 0,
          mb: 1,
          lineHeight: 1.5,
          '& code': {
            background: 'rgba(0, 0, 0, 0.06)',
            px: 0.5,
            py: '1px',
            borderRadius: 0.25,
            fontSize: 11,
          },
        }}
      >
        문서에서 사용된 <code>{'{{ name }}'}</code> 변수가 자동 감지됩니다.
        여기서 입력한 값은 미리보기에서만 치환되며, export 시에는{' '}
        <code>{'{{ name }}'}</code> 그대로 유지됩니다.
      </Typography>
      <FormControlLabel
        sx={{
          mb: 1,
          ml: 0,
          '& .MuiFormControlLabel-label': { fontSize: 12 },
        }}
        control={
          <Switch
            size="small"
            checked={showRawVariables}
            onChange={(e) => setShowRawVariables(e.target.checked)}
          />
        }
        label="변수 그대로 보기"
      />
      {rows.length === 0 ? (
        <Typography
          sx={{ color: 'text.disabled', fontSize: 12, fontStyle: 'italic' }}
        >
          사용 중인 변수가 없습니다.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {rows.map((row) => (
            <Stack
              key={row.name}
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ opacity: row.used ? 1 : 0.5 }}
            >
              <Box
                component="code"
                sx={{
                  flex: '0 0 160px',
                  fontSize: 11,
                  color: '#1976d2',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {`{{ ${row.name} }}`}
              </Box>
              <TextField
                value={row.value}
                placeholder="(샘플값 없음)"
                onChange={(e) => setSampleValue(row.name, e.target.value)}
                size="small"
                fullWidth
                slotProps={{
                  input: {
                    sx: { fontSize: 12, '& input': { py: 0.5 } },
                  },
                }}
              />
              {!row.used && (
                <TooltipIconButton
                  title="미사용 변수 제거"
                  icon={Close}
                  onClick={() => removeSampleValue(row.name)}
                />
              )}
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  )
}
