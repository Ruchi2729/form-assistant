import type { SelectedDocument } from '../../state/types'
import { useCallback } from 'react'
import useAppState from '../../state/useAppState'
import PdfPreview from './PdfPreview'
import ImagePreview from './ImagePreview'

export default function DocumentPreview({
  document,
}: {
  document: SelectedDocument
}) {
  const { markDocumentReady } = useAppState()
  const handleReady = useCallback(
    () => markDocumentReady(document.selectionId),
    [markDocumentReady, document.selectionId],
  )
  return document.kind === 'pdf' ? (
    <PdfPreview file={document.file} onReady={handleReady} />
  ) : (
    <ImagePreview file={document.file} onReady={handleReady} />
  )
}
