import PdfPreview from './PdfPreview.jsx'
import ImagePreview from './ImagePreview.jsx'

export default function DocumentPreview({ document }) {
  return document.kind === 'pdf' ? (
    <PdfPreview file={document.file} />
  ) : (
    <ImagePreview file={document.file} />
  )
}
