import type { Block } from '@mu-software/mail-editor/types/schema'
import { validateHref, warnIfAltMissing, type ValidationResult } from '@mu-software/mail-editor/utils/validation'
import { FormatListBulleted, FormatListNumbered, HorizontalRule, Image, Notes, SmartButton, SpaceBar, TextFields, Title } from '@mui/icons-material'
import type { ReactElement } from 'react'

export type PropertyType = 'text' | 'number' | 'color' | 'select' | 'boolean' | 'stringList' | 'descriptionItems'

export type SelectOption = {
  value: string | number | boolean
  label: string
}

export type PropertyGroup = 'content' | 'typography' | 'spacing' | 'background' | 'border'

export type PropertyDef = {
  path: readonly string[]
  label: string
  type: PropertyType
  default?: unknown
  description?: string
  options?: readonly SelectOption[]
  group?: PropertyGroup
  warn?: (value: unknown) => string | undefined
  validate?: (value: unknown) => ValidationResult
}

export const PROPERTY_GROUP_ORDER: readonly PropertyGroup[] = ['content', 'typography', 'spacing', 'background', 'border']

export const PROPERTY_GROUP_LABELS: Record<PropertyGroup, string> = {
  content: '콘텐츠',
  typography: '글꼴 / 정렬',
  spacing: '여백',
  background: '배경',
  border: '테두리',
}

const TYPOGRAPHY_KEYS = new Set(['color', 'fontSize', 'lineHeight', 'fontFamily', 'textAlign', 'verticalAlign'])

const SPACING_KEYS = new Set(['paddingY', 'paddingX'])

const BACKGROUND_KEYS = new Set(['backgroundColor', 'contentBackgroundColor'])

export const groupOfProperty = (def: PropertyDef): PropertyGroup => {
  if (def.group) return def.group
  const key = def.path[def.path.length - 1]
  if (BACKGROUND_KEYS.has(key)) return 'background'
  if (typeof key === 'string' && key.startsWith('border')) return 'border'
  if (SPACING_KEYS.has(key)) return 'spacing'
  if (TYPOGRAPHY_KEYS.has(key)) return 'typography'
  return 'content'
}

export const groupProperties = (properties: readonly PropertyDef[]): Record<PropertyGroup, PropertyDef[]> => {
  const result: Record<PropertyGroup, PropertyDef[]> = {
    content: [],
    typography: [],
    spacing: [],
    background: [],
    border: [],
  }
  for (const def of properties) {
    result[groupOfProperty(def)].push(def)
  }
  return result
}

export type BlockTypeDef = {
  type: Block['type']
  label: string
  icon: ReactElement
  properties: readonly PropertyDef[]
}

const TEXT_ALIGN_OPTIONS: readonly SelectOption[] = [
  { value: 'left', label: '왼쪽' },
  { value: 'center', label: '가운데' },
  { value: 'right', label: '오른쪽' },
]

const VERTICAL_ALIGN_OPTIONS: readonly SelectOption[] = [
  { value: 'top', label: '상단' },
  { value: 'middle', label: '중앙' },
  { value: 'bottom', label: '하단' },
]

const HEADING_LEVEL_OPTIONS: readonly SelectOption[] = [
  { value: 1, label: 'H1' },
  { value: 2, label: 'H2' },
  { value: 3, label: 'H3' },
  { value: 4, label: 'H4' },
  { value: 5, label: 'H5' },
  { value: 6, label: 'H6' },
]

const BORDER_STYLE_OPTIONS: readonly SelectOption[] = [
  { value: 'none', label: '없음' },
  { value: 'solid', label: '실선' },
  { value: 'dashed', label: '파선' },
  { value: 'dotted', label: '점선' },
  { value: 'double', label: '이중선' },
]

const BORDER_PROPERTIES: readonly PropertyDef[] = [
  { path: ['styles', 'borderWidth'], label: '테두리 두께 (px)', type: 'number' },
  {
    path: ['styles', 'borderStyle'],
    label: '테두리 스타일',
    type: 'select',
    options: BORDER_STYLE_OPTIONS,
  },
  { path: ['styles', 'borderColor'], label: '테두리 색상', type: 'color' },
]

export const BLOCK_TYPES: readonly BlockTypeDef[] = [
  {
    type: 'text',
    label: '텍스트',
    icon: <TextFields fontSize="small" />,
    properties: [
      { path: ['styles', 'color'], label: '글자색', type: 'color', default: '#000000' },
      { path: ['styles', 'fontSize'], label: '글꼴 크기 (px)', type: 'number' },
      { path: ['styles', 'lineHeight'], label: '줄 높이', type: 'number' },
      {
        path: ['styles', 'textAlign'],
        label: '정렬',
        type: 'select',
        options: TEXT_ALIGN_OPTIONS,
      },
    ],
  },
  {
    type: 'heading',
    label: '제목',
    icon: <Title fontSize="small" />,
    properties: [
      {
        path: ['level'],
        label: '레벨',
        type: 'select',
        options: HEADING_LEVEL_OPTIONS,
      },
      { path: ['styles', 'color'], label: '글자색', type: 'color', default: '#000000' },
      {
        path: ['styles', 'textAlign'],
        label: '정렬',
        type: 'select',
        options: TEXT_ALIGN_OPTIONS,
      },
    ],
  },
  {
    type: 'image',
    label: '이미지',
    icon: <Image fontSize="small" />,
    properties: [
      { path: ['src'], label: 'src', type: 'text' },
      {
        path: ['alt'],
        label: 'alt',
        type: 'text',
        warn: warnIfAltMissing,
      },
      { path: ['width'], label: 'width', type: 'number' },
      { path: ['height'], label: 'height', type: 'number' },
      {
        path: ['href'],
        label: 'href',
        type: 'text',
        description: '있으면 <a>로 감쌈',
        validate: (v) => validateHref(v, { required: false }),
      },
      {
        path: ['styles', 'textAlign'],
        label: '정렬',
        type: 'select',
        options: TEXT_ALIGN_OPTIONS,
      },
      {
        path: ['styles', 'borderRadius'],
        label: '모서리 반경 (px)',
        type: 'number',
      },
      ...BORDER_PROPERTIES,
    ],
  },
  {
    type: 'button',
    label: '버튼',
    icon: <SmartButton fontSize="small" />,
    properties: [
      {
        path: ['href'],
        label: 'href',
        type: 'text',
        validate: (v) => validateHref(v, { required: true }),
      },
      {
        path: ['styles', 'backgroundColor'],
        label: '배경색',
        type: 'color',
        default: '#0070f3',
      },
      {
        path: ['styles', 'color'],
        label: '글자색',
        type: 'color',
        default: '#ffffff',
      },
      {
        path: ['styles', 'fontSize'],
        label: '글꼴 크기 (px)',
        type: 'number',
      },
      {
        path: ['styles', 'borderRadius'],
        label: '모서리 반경 (px)',
        type: 'number',
      },
      {
        path: ['styles', 'width'],
        label: '고정 폭 (px)',
        type: 'number',
        description: '지정 시 Outlook에서 둥근 버튼(VML) 렌더',
      },
      {
        path: ['styles', 'textAlign'],
        label: '정렬',
        type: 'select',
        options: TEXT_ALIGN_OPTIONS,
      },
      ...BORDER_PROPERTIES,
    ],
  },
  {
    type: 'hr',
    label: '구분선',
    icon: <HorizontalRule fontSize="small" />,
    properties: [
      { path: ['styles', 'color'], label: '색상', type: 'color', default: '#eaeaea' },
      { path: ['styles', 'thickness'], label: '두께 (px)', type: 'number' },
    ],
  },
  {
    type: 'spacer',
    label: '여백',
    icon: <SpaceBar fontSize="small" />,
    properties: [{ path: ['height'], label: '높이 (px)', type: 'number' }],
  },
  {
    type: 'orderedList',
    label: '순서 있는 목록',
    icon: <FormatListNumbered fontSize="small" />,
    properties: [
      { path: ['items'], label: '항목', type: 'stringList' },
      { path: ['styles', 'color'], label: '글자색', type: 'color', default: '#000000' },
      { path: ['styles', 'fontSize'], label: '글꼴 크기 (px)', type: 'number' },
      { path: ['styles', 'lineHeight'], label: '줄 높이', type: 'number' },
    ],
  },
  {
    type: 'unorderedList',
    label: '순서 없는 목록',
    icon: <FormatListBulleted fontSize="small" />,
    properties: [
      { path: ['items'], label: '항목', type: 'stringList' },
      { path: ['styles', 'color'], label: '글자색', type: 'color', default: '#000000' },
      { path: ['styles', 'fontSize'], label: '글꼴 크기 (px)', type: 'number' },
      { path: ['styles', 'lineHeight'], label: '줄 높이', type: 'number' },
    ],
  },
  {
    type: 'descriptionList',
    label: '용어 정의 목록',
    icon: <Notes fontSize="small" />,
    properties: [
      { path: ['items'], label: '항목', type: 'descriptionItems' },
      { path: ['styles', 'color'], label: '글자색', type: 'color', default: '#000000' },
      { path: ['styles', 'fontSize'], label: '글꼴 크기 (px)', type: 'number' },
      { path: ['styles', 'lineHeight'], label: '줄 높이', type: 'number' },
    ],
  },
]

export const findBlockTypeDef = (type: Block['type']): BlockTypeDef | undefined => BLOCK_TYPES.find((t) => t.type === type)

export const DOCUMENT_PROPERTIES: readonly PropertyDef[] = [
  { path: ['meta', 'subject'], label: '메일 제목', type: 'text' },
  {
    path: ['meta', 'preview'],
    label: '미리보기 텍스트',
    type: 'text',
    description: '받은편지함 미리보기',
  },
  {
    path: ['meta', 'lang'],
    label: '언어 (lang)',
    type: 'text',
    description: '미설정 시 ko (예: ko, en, ja)',
  },
  {
    path: ['styles', 'backgroundColor'],
    label: '배경색',
    type: 'color',
    default: '#f4f4f4',
  },
  {
    path: ['styles', 'contentBackgroundColor'],
    label: '본문 배경색',
    type: 'color',
    default: '#ffffff',
  },
  { path: ['styles', 'fontFamily'], label: '글꼴', type: 'text' },
  { path: ['styles', 'width'], label: '폭 (px)', type: 'number' },
]

export const ROW_PROPERTIES: readonly PropertyDef[] = [
  {
    path: ['styles', 'backgroundColor'],
    label: '배경색',
    type: 'color',
    default: '#ffffff',
  },
  {
    path: ['styles', 'textAlign'],
    label: '정렬',
    type: 'select',
    options: TEXT_ALIGN_OPTIONS,
  },
  { path: ['styles', 'paddingY'], label: '세로 패딩 (px)', type: 'number' },
  { path: ['styles', 'paddingX'], label: '가로 패딩 (px)', type: 'number' },
  {
    path: ['styles', 'borderRadius'],
    label: '모서리 반경 (px)',
    type: 'number',
  },
  ...BORDER_PROPERTIES,
]

export const COLUMN_PROPERTIES: readonly PropertyDef[] = [
  {
    path: ['width'],
    label: '폭 비율',
    type: 'number',
    description: '같은 row 내 다른 column과의 비율',
  },
  {
    path: ['styles', 'backgroundColor'],
    label: '배경색',
    type: 'color',
  },
  {
    path: ['styles', 'verticalAlign'],
    label: '세로 정렬',
    type: 'select',
    options: VERTICAL_ALIGN_OPTIONS,
  },
  { path: ['styles', 'paddingY'], label: '세로 패딩 (px)', type: 'number' },
  { path: ['styles', 'paddingX'], label: '가로 패딩 (px)', type: 'number' },
  {
    path: ['styles', 'borderRadius'],
    label: '모서리 반경 (px)',
    type: 'number',
  },
  ...BORDER_PROPERTIES,
]
