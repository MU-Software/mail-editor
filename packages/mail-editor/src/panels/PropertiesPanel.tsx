import { COLUMN_PROPERTIES, DOCUMENT_PROPERTIES, ROW_PROPERTIES, findBlockTypeDef, type PropertyDef } from '@mu-software/mail-editor/editor/schemas'
import { useSelectedTarget } from '@mu-software/mail-editor/hooks/useDocument'
import type { Selection } from '@mu-software/mail-editor/store/types'
import { Box, Stack, Typography } from '@mui/material'

import { PropertiesForm } from './forms/PropertiesForm'

export const PropertiesPanel = () => {
  const target = useSelectedTarget()

  if (!target) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography sx={{ color: '#888', fontSize: 13 }}>블록, Row, Column, 또는 문서 영역을 클릭하면 속성이 여기에 표시됩니다.</Typography>
      </Box>
    )
  }

  let title: string
  let properties: readonly PropertyDef[]
  let selection: Selection

  switch (target.kind) {
    case 'document':
      title = '문서'
      properties = DOCUMENT_PROPERTIES
      selection = { kind: 'document' }
      break
    case 'row':
      title = 'Row'
      properties = ROW_PROPERTIES
      selection = { kind: 'row', id: target.obj.id }
      break
    case 'column':
      title = 'Column'
      properties = COLUMN_PROPERTIES
      selection = { kind: 'column', id: target.obj.id }
      break
    case 'block': {
      const schema = findBlockTypeDef(target.obj.type)
      if (!schema) return null
      title = schema.label
      properties = schema.properties
      selection = { kind: 'block', id: target.obj.id }
      break
    }
  }

  return (
    <Stack sx={{ p: 2 }} spacing={2}>
      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{title}</Typography>
      <PropertiesForm target={selection} obj={target.obj} properties={properties} />
    </Stack>
  )
}
