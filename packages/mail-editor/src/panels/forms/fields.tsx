import { Add, ArrowDownward, ArrowUpward, Close } from '@mui/icons-material'
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useRef, useState, type FC } from 'react'

import { TooltipIconButton } from '@musoftware/mail-editor/components/TooltipIconButton'
import { InlineTextEditor } from '@musoftware/mail-editor/editor/InlineTextEditor'
import type { SelectOption } from '@musoftware/mail-editor/editor/schemas'
import { withSwapped } from '@musoftware/mail-editor/utils/array'

type ClickToEditFieldProps = {
  label: string
  value: string
  onCommit: (v: string) => void
}

const ClickToEditField: FC<ClickToEditFieldProps> = ({ label, value, onCommit }) => {
  const [editing, setEditing] = useState(false)
  return (
    <Box>
      <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 0.5 }}>{label}</Typography>
      {editing ? (
        <InlineTextEditor
          initialHtml={value}
          toolbarPosition="inline"
          onChange={(v) => {
            if (v !== value) onCommit(v)
          }}
          onCommit={(v) => {
            if (v !== value) onCommit(v)
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <Box
          onClick={() => setEditing(true)}
          sx={{
            minHeight: 36,
            px: 1.5,
            py: 1,
            borderRadius: 1,
            border: '1px solid rgba(0,0,0,0.23)',
            cursor: 'text',
            fontSize: 14,
            lineHeight: 1.5,
            '&:hover': { borderColor: 'rgba(0,0,0,0.5)' },
          }}
        >
          {value ? (
            <Box component="span" dangerouslySetInnerHTML={{ __html: value }} />
          ) : (
            <Typography component="span" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
              (비어있음)
            </Typography>
          )}
        </Box>
      )}
    </Box>
  )
}

const useImeSafeBinding = (
  external: string,
  onCommit: (v: string) => void,
  options?: {
    blockingValidate?: (v: string) => { ok: boolean; message?: string }
  },
) => {
  const [local, setLocal] = useState(external)
  const composingRef = useRef(false)
  const focusedRef = useRef(false)
  const blockingValidate = options?.blockingValidate
  const commitLive = !blockingValidate

  useEffect(() => {
    if (!focusedRef.current) setLocal(external)
  }, [external])

  const tryCommit = (v: string) => {
    if (blockingValidate) {
      const result = blockingValidate(v)
      if (!result.ok) {
        if (result.message) window.alert(result.message)
        setLocal(external)
        return
      }
    }
    if (v !== external) onCommit(v)
  }

  return {
    value: local,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const v = e.target.value
      setLocal(v)
      if (commitLive && !composingRef.current && v !== external) onCommit(v)
    },
    onCompositionStart: () => {
      composingRef.current = true
    },
    onCompositionEnd: (e: React.CompositionEvent<Element>) => {
      composingRef.current = false
      const v = (e.target as HTMLInputElement).value
      setLocal(v)
      if (commitLive && v !== external) onCommit(v)
    },
    onFocus: () => {
      focusedRef.current = true
    },
    onBlur: () => {
      focusedRef.current = false
      tryCommit(local)
    },
  }
}

type DeferredTextFieldProps = {
  label: string
  value: string
  onCommit: (v: string) => void
  blockingValidate?: (v: string) => { ok: boolean; message?: string }
} & Omit<React.ComponentProps<typeof TextField>, 'value' | 'onChange' | 'onBlur' | 'onFocus' | 'onCompositionStart' | 'onCompositionEnd' | 'label'>

export const DeferredTextField: FC<DeferredTextFieldProps> = ({ label, value, onCommit, blockingValidate, ...rest }) => {
  const binding = useImeSafeBinding(value, onCommit, { blockingValidate })
  return <TextField {...rest} label={label} {...binding} size="small" fullWidth />
}

type DeferredNumberFieldProps = {
  label: string
  value: number | undefined
  onCommit: (v: number | undefined) => void
}

export const DeferredNumberField: FC<DeferredNumberFieldProps> = ({ label, value, onCommit }) => {
  const toStr = (v: number | undefined) => (v === undefined ? '' : String(v))
  const binding = useImeSafeBinding(toStr(value), (s) => {
    if (s === '') {
      if (value !== undefined) onCommit(undefined)
      return
    }
    const next = Number(s)
    if (!Number.isFinite(next)) return
    if (next !== value) onCommit(next)
  })
  return <TextField label={label} type="number" {...binding} size="small" fullWidth />
}

type DeferredColorFieldProps = {
  label: string
  value: string
  onCommit: (v: string) => void
}

export const DeferredColorField: FC<DeferredColorFieldProps> = ({ label, value, onCommit }) => {
  const binding = useImeSafeBinding(value, onCommit)
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <input
        type="color"
        value={binding.value}
        onChange={binding.onChange}
        style={{
          width: 36,
          height: 36,
          border: '1px solid rgba(0,0,0,0.23)',
          borderRadius: 4,
          padding: 0,
          cursor: 'pointer',
          background: 'transparent',
          flexShrink: 0,
        }}
      />
      <TextField label={label} {...binding} size="small" fullWidth />
    </Stack>
  )
}

type SelectFieldProps = {
  label: string
  value: string | number | boolean | undefined
  options: readonly SelectOption[]
  onCommit: (v: string | number | boolean) => void
}

export const SelectField: FC<SelectFieldProps> = ({ label, value, options, onCommit }) => {
  const strValue = value !== undefined ? String(value) : ''
  return (
    <FormControl size="small" fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        value={strValue}
        label={label}
        onChange={(e) => {
          const sv = e.target.value
          const match = options.find((o) => String(o.value) === sv)
          if (match) onCommit(match.value)
        }}
      >
        {options.map((opt) => (
          <MenuItem key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

type StringListFieldProps = {
  label: string
  value: readonly string[]
  onCommit: (v: string[]) => void
}

export const StringListField: FC<StringListFieldProps> = ({ label, value, onCommit }) => {
  const items = value
  const updateItem = (i: number, next: string) => onCommit(items.map((item, idx) => (idx === i ? next : item)))
  const addItem = () => onCommit([...items, ''])
  const removeItem = (i: number) => onCommit(items.filter((_, idx) => idx !== i))
  const moveItem = (i: number, dir: 'up' | 'down') => {
    const next = withSwapped(items, i, dir === 'up' ? i - 1 : i + 1)
    if (next) onCommit(next)
  }
  return (
    <Box>
      {label && <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5 }}>{label}</Typography>}
      <Stack spacing={0.5}>
        {items.map((item, i) => (
          <Stack key={i} direction="row" spacing={0.5} alignItems="flex-end">
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <ClickToEditField label={`${i + 1}`} value={item} onCommit={(v) => updateItem(i, v)} />
            </Box>
            <TooltipIconButton title="위로" icon={ArrowUpward} disabled={i === 0} onClick={() => moveItem(i, 'up')} />
            <TooltipIconButton title="아래로" icon={ArrowDownward} disabled={i === items.length - 1} onClick={() => moveItem(i, 'down')} />
            <TooltipIconButton title="삭제" icon={Close} disabled={items.length <= 1} onClick={() => removeItem(i)} />
          </Stack>
        ))}
        <Button startIcon={<Add />} size="small" variant="outlined" onClick={addItem} sx={{ alignSelf: 'flex-start', textTransform: 'none' }}>
          항목 추가
        </Button>
      </Stack>
    </Box>
  )
}

export type DescriptionItem = { term: string; description: string }

type DescriptionItemsFieldProps = {
  label: string
  value: readonly DescriptionItem[]
  onCommit: (v: DescriptionItem[]) => void
}

export const DescriptionItemsField: FC<DescriptionItemsFieldProps> = ({ label, value, onCommit }) => {
  const items = value
  const updateItem = (i: number, patch: Partial<DescriptionItem>) => onCommit(items.map((item, idx) => (idx === i ? { ...item, ...patch } : item)))
  const addItem = () => onCommit([...items, { term: '용어', description: '정의' }])
  const removeItem = (i: number) => onCommit(items.filter((_, idx) => idx !== i))
  const moveItem = (i: number, dir: 'up' | 'down') => {
    const next = withSwapped(items, i, dir === 'up' ? i - 1 : i + 1)
    if (next) onCommit(next)
  }
  return (
    <Box>
      {label && <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5 }}>{label}</Typography>}
      <Stack spacing={1}>
        {items.map((item, i) => (
          <Stack key={i} spacing={0.5} sx={{ p: 1, border: '1px solid #eee', borderRadius: 0.5 }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography sx={{ fontSize: 11, color: 'text.secondary', flex: 1 }}>#{i + 1}</Typography>
              <TooltipIconButton title="위로" icon={ArrowUpward} disabled={i === 0} onClick={() => moveItem(i, 'up')} />
              <TooltipIconButton title="아래로" icon={ArrowDownward} disabled={i === items.length - 1} onClick={() => moveItem(i, 'down')} />
              <TooltipIconButton title="삭제" icon={Close} disabled={items.length <= 1} onClick={() => removeItem(i)} />
            </Stack>
            <ClickToEditField label="용어" value={item.term} onCommit={(v) => updateItem(i, { term: v })} />
            <ClickToEditField label="정의" value={item.description} onCommit={(v) => updateItem(i, { description: v })} />
          </Stack>
        ))}
        <Button startIcon={<Add />} size="small" variant="outlined" onClick={addItem} sx={{ alignSelf: 'flex-start', textTransform: 'none' }}>
          항목 추가
        </Button>
      </Stack>
    </Box>
  )
}
