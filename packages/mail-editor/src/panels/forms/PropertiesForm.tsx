import { PROPERTY_GROUP_LABELS, PROPERTY_GROUP_ORDER, groupProperties, type PropertyDef } from '@mu-software/mail-editor/editor/schemas'
import { useActions } from '@mu-software/mail-editor/hooks/useDocument'
import type { Selection } from '@mu-software/mail-editor/store/types'
import { getAtPath } from '@mu-software/mail-editor/utils/path'
import { Box, Stack, Typography } from '@mui/material'
import type { FC } from 'react'

import {
  DeferredColorField,
  DeferredNumberField,
  DeferredTextField,
  DescriptionItemsField,
  SelectField,
  StringListField,
  type DescriptionItem,
} from './fields'

type FieldForProps = {
  def: PropertyDef
  value: unknown
  onCommit: (v: unknown) => void
}

const FieldFor: FC<FieldForProps> = ({ def, value, onCommit }) => {
  const warnMessage = def.warn?.(value)
  const helperText = warnMessage ? (
    <Box component="span" sx={{ color: 'warning.main' }}>
      {warnMessage}
    </Box>
  ) : (
    def.description
  )
  const blockingValidate = def.validate
    ? (v: string) => {
        const r = def.validate!(v === '' ? undefined : v)
        return r.ok ? { ok: true } : { ok: false, message: r.message }
      }
    : undefined
  switch (def.type) {
    case 'text':
      return (
        <DeferredTextField
          label={def.label}
          value={(value as string | undefined) ?? ''}
          onCommit={(v) => onCommit(v === '' ? undefined : v)}
          helperText={helperText}
          blockingValidate={blockingValidate}
        />
      )
    case 'number':
      return <DeferredNumberField label={def.label} value={value as number | undefined} onCommit={onCommit} />
    case 'color':
      return (
        <DeferredColorField label={def.label} value={value as string | undefined} seed={(def.default as string) ?? '#000000'} onCommit={onCommit} />
      )
    case 'select':
      if (!def.options) return null
      return <SelectField label={def.label} value={value as string | number | boolean | undefined} options={def.options} onCommit={onCommit} />
    case 'stringList':
      return <StringListField label={def.label} value={(value as string[] | undefined) ?? []} onCommit={onCommit} />
    case 'descriptionItems':
      return <DescriptionItemsField label={def.label} value={(value as DescriptionItem[] | undefined) ?? []} onCommit={onCommit} />
    case 'boolean':
      return null
  }
}

type PropertiesFormProps = {
  target: Selection
  obj: unknown
  properties: readonly PropertyDef[]
}

export const PropertiesForm: FC<PropertiesFormProps> = ({ target, obj, properties }) => {
  const { updateFieldAt } = useActions()
  const grouped = groupProperties(properties)
  return (
    <Stack spacing={3}>
      {PROPERTY_GROUP_ORDER.map((group) => {
        const items = grouped[group]
        if (items.length === 0) return null
        return (
          <Stack key={group} spacing={1.5}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: 0.4,
              }}
            >
              {PROPERTY_GROUP_LABELS[group]}
            </Typography>
            {items.map((def) => {
              const value = getAtPath(obj, def.path)
              return <FieldFor key={def.path.join('.')} def={def} value={value} onCommit={(v) => updateFieldAt(target, def.path, v)} />
            })}
          </Stack>
        )
      })}
    </Stack>
  )
}
