# mail-editor

[English](./README.md) | 한국어

반응형·이메일 클라이언트 호환 HTML 이메일을 만드는 React 블록 기반 비주얼 에디터입니다.

**[▶ 플레이그라운드 사용해보기](https://mu-software.github.io/mail-editor/)**

## 특징

- **비주얼 블록 에디터** — 행/열 레이아웃과 텍스트·제목·이미지·버튼·구분선·여백·목록 블록.
- **리치 텍스트** — Tiptap 기반 인라인 서식.
- **템플릿 변수** — `{{ name }}` 형태의 플레이스홀더를 작성하고, 샘플 값으로 미리보기하며, export 시 플레이스홀더가 그대로 유지된 HTML을 얻습니다 (Django/Jinja 호환).
- **이메일 호환 HTML export** — [react-email](https://react.email)로 렌더링하며, Outlook 고정 폭 버튼 VML 폴백을 포함합니다.
- **JSON import/export** — Zod로 검증되는 직렬화 가능한 문서 스키마.
- **실행 취소/다시 실행**, export 시 Gmail 클립 크기(102 KB) 경고.

## 설치

```bash
pnpm add @mu-software/mail-editor react react-dom
```

React 19가 필요합니다.

## 사용법

```tsx
import { useRef } from 'react'
import { MailEditor, createEmptyDocument, parseEmailDocument, type MailEditorHandle } from '@mu-software/mail-editor'

function App() {
  const ref = useRef<MailEditorHandle>(null)

  const onExport = async () => {
    const html = await ref.current?.exportHTML() // 이메일 클라이언트 호환 HTML
    const json = ref.current?.exportJson() // 직렬화된 문서 (문자열)
  }

  return <MailEditor ref={ref} initialDocument={createEmptyDocument()} />
}
```

저장해 둔 문서를 불러올 때는 `parseEmailDocument(jsonString)`으로 파싱해 `initialDocument`에 전달하세요.

### `MailEditorHandle`

| 메서드                  | 반환              | 설명                        |
| ----------------------- | ----------------- | --------------------------- |
| `exportEmailDocument()` | `EmailDocument`   | 현재 문서 객체              |
| `exportJson()`          | `string`          | JSON으로 직렬화된 문서      |
| `exportHTML()`          | `Promise<string>` | 이메일 클라이언트 호환 HTML |

## 개발

pnpm 모노레포입니다 (`packages/mail-editor` — 라이브러리, `apps/playground` — 데모 앱). Node 22+ 필요.

```bash
pnpm install
pnpm dev              # 플레이그라운드 로컬 실행
pnpm build            # 전체 패키지 빌드
pnpm build:package    # 라이브러리만 빌드
```

## 라이선스

MIT
