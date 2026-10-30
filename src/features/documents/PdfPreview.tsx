import type {
  PDFDocumentProxy,
  PDFDocumentLoadingTask,
  RenderTask,
} from 'pdfjs-dist'
import type { PreviewProps } from '../../state/types'
import { useEffect, useRef, useState } from 'react'
import Button from '../../components/ui/Button'

export default function PdfPreview({ file, onReady }: PreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const documentRef = useRef<PDFDocumentProxy | null>(null)

  useEffect(() => {
    let cancelled = false
    let task: PDFDocumentLoadingTask | undefined
    async function load() {
      try {
        const pdfjs = await import('pdfjs-dist')
        const { default: workerUrl } =
          await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
        if (cancelled) return
        const bytes = new Uint8Array(await file.arrayBuffer())
        if (cancelled) return
        task = pdfjs.getDocument({ data: bytes })
        const pdf = await task.promise
        if (cancelled) return
        if (pdf.numPages > 100) throw new Error('too-many-pages')
        documentRef.current = pdf
        setTotal(pdf.numPages)
      } catch (failure) {
        if (!cancelled) {
          setLoading(false)
          setError(
            failure instanceof Error && failure.name === 'PasswordException'
              ? 'This PDF is password-protected. Choose an unlocked copy you have permission to use.'
              : failure instanceof Error && failure.message === 'too-many-pages'
                ? 'Choose a PDF with 100 pages or fewer.'
                : 'We couldn’t read this PDF. Try exporting a new copy or choose a photo of the form.',
          )
        }
      }
    }
    load()
    return () => {
      cancelled = true
      documentRef.current = null
      if (task) void task.destroy().catch(() => {})
    }
  }, [file])

  useEffect(() => {
    if (!total || !documentRef.current) return undefined
    let cancelled = false
    let renderTask: RenderTask | undefined
    async function render() {
      setLoading(true)
      setText('')
      try {
        const pdf = documentRef.current
        if (!pdf) return
        const pdfPage = await pdf.getPage(page)
        if (cancelled) return
        const original = pdfPage.getViewport({ scale: 1 })
        const scale = Math.min(
          1.5,
          1200 / original.width,
          1600 / original.height,
        )
        const viewport = pdfPage.getViewport({ scale })
        const canvas = canvasRef.current
        if (!canvas) return
        const context = canvas.getContext('2d')
        if (!context) throw new Error('Canvas unavailable')
        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)
        renderTask = pdfPage.render({
          canvas,
          canvasContext: context,
          viewport,
        })
        await renderTask.promise
        const content = await pdfPage.getTextContent()
        if (!cancelled) {
          setText(
            content.items
              .map((item) =>
                'str' in item ? item.str + (item.hasEOL ? '\n' : ' ') : '',
              )
              .join('')
              .slice(0, 20000),
          )
          setLoading(false)
          onReady()
        }
      } catch (failure) {
        if (
          !cancelled &&
          !(
            failure instanceof Error &&
            failure.name === 'RenderingCancelledException'
          )
        ) {
          setError(
            'This page couldn’t be displayed. Remove this file and try another copy.',
          )
          setLoading(false)
        }
      }
    }
    render()
    return () => {
      cancelled = true
      renderTask?.cancel()
    }
  }, [page, total, onReady])

  return (
    <div className="mt-4 space-y-3">
      <p role="status" className="text-sm">
        {error ||
          (loading
            ? 'Preparing your local preview…'
            : `Page ${page} of ${total}`)}
      </p>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Preview of PDF page ${page}. Available text is below.`}
        className={`h-auto max-w-full rounded border border-[#dbe1d3] bg-white ${error ? 'hidden' : ''}`}
      />
      {total > 1 && !error && (
        <nav aria-label="PDF pages" className="flex items-center gap-3">
          <Button
            disabled={page <= 1 || loading}
            onClick={() => setPage((value) => value - 1)}
          >
            Previous page
          </Button>
          <Button
            disabled={page >= total || loading}
            onClick={() => setPage((value) => value + 1)}
          >
            Next page
          </Button>
        </nav>
      )}
      {!error && total > 0 && (
        <details>
          <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">
            Read available text from this page
          </summary>
          <p
            aria-busy={loading}
            className="max-h-64 overflow-auto whitespace-pre-wrap break-words text-sm leading-relaxed"
          >
            {loading
              ? 'Loading page text…'
              : text ||
                'No selectable text was found. This page may be a scan; text recognition is needed to read it.'}
          </p>
        </details>
      )}
    </div>
  )
}
