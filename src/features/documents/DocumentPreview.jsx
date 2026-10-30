import { useCallback } from 'react'
import useAppState from '../../state/useAppState.js'
import PdfPreview from './PdfPreview.jsx'
import ImagePreview from './ImagePreview.jsx'

export default function DocumentPreview({ document }) {
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
