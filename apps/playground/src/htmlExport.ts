export const GMAIL_CLIP_BYTES = 102 * 1024

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(2)} MB`
}

export type HtmlExportOutcome = { ok: true; sizeText: string } | { ok: false }

export const handleHtmlExport = async (html: string): Promise<HtmlExportOutcome> => {
  const sizeBytes = new Blob([html]).size
  const sizeText = formatBytes(sizeBytes)
  if (sizeBytes > GMAIL_CLIP_BYTES) {
    const proceed = window.confirm(
      `HTML 크기: ${sizeText}\n\n` +
        `Gmail은 ${formatBytes(GMAIL_CLIP_BYTES)}가 넘는 메시지를 잘라내고 (clip) "전체 메시지 보기" 링크를 표시합니다.\n\n` +
        `그대로 내보내시겠습니까?`,
    )
    if (!proceed) return { ok: false }
  }
  try {
    await navigator.clipboard.writeText(html)
  } catch (err) {
    console.error('clipboard write failed', err)
    alert('클립보드 복사 실패.')
    return { ok: false }
  }
  return { ok: true, sizeText }
}
