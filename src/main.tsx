import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './App.css'

async function defaultOnExport(html: string) {
  console.log('[mail_editor] exported HTML:\n', html)
  try {
    await navigator.clipboard.writeText(html)
    alert('HTML이 클립보드에 복사되었습니다. (콘솔에도 출력됨)')
  } catch (err) {
    console.error('clipboard write failed', err)
    alert('클립보드 복사 실패. 콘솔에서 HTML을 확인하세요.')
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App onExport={defaultOnExport} />
  </StrictMode>,
)
