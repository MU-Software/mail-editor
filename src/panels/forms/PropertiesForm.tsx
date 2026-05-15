import { Box, Stack, Typography } from '@mui/material'
import {
  PROPERTY_GROUP_LABELS,
  PROPERTY_GROUP_ORDER,
  groupProperties,
  type PropertyDef,
} from '../../editor/schemas'
import { useActions } from '../../hooks/useDocument'
import type { Selection } from '../../store/types'
import { getAtPath } from '../../utils/path'
import {
  DeferredColorField,
  DeferredNumberField,
  DeferredTextField,
  DescriptionItemsField,
  SelectField,
  StringListField,
  type DescriptionItem,
} from './fields'

function FieldFor({
  def,
  value,
  onCommit,
}: {
  def: PropertyDef
  value: unknown
  onCommit: (v: unknown) => void
}) {
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
      return (
        <DeferredNumberField
          label={def.label}
          value={value as number | undefined}
          onCommit={onCommit}
        />
      )
    case 'color':
      return (
        <DeferredColorField
          label={def.label}
          value={(value as string | undefined) ?? ((def.default as string) ?? '')}
          onCommit={onCommit}
        />
      )
    case 'select':
      if (!def.options) return null
      return (
        <SelectField
          label={def.label}
          value={value as string | number | boolean | undefined}
          options={def.options}
          onCommit={onCommit}
        />
      )
    case 'stringList':
      return (
        <StringListField
          label={def.label}
          value={(value as string[] | undefined) ?? []}
          onCommit={onCommit}
        />
      )
    case 'descriptionItems':
      return (
        <DescriptionItemsField
          label={def.label}
          value={(value as DescriptionItem[] | undefined) ?? []}
          onCommit={onCommit}
        />
      )
    case 'boolean':
      return null
  }
}

export function PropertiesForm({
  target,
  obj,
  properties,
}: {
  target: Selection
  obj: unknown
  properties: readonly PropertyDef[]
}) {
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
              return (
                <FieldFor
                  key={def.path.join('.')}
                  def={def}
                  value={value}
                  onCommit={(v) => updateFieldAt(target, def.path, v)}
                />
              )
            })}
          </Stack>
        )
      })}
    </Stack>
  )
}
