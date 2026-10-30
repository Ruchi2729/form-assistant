import type { ChangeEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import useAppState from '../../state/useAppState'
import Button from '../../components/ui/Button'
import Disclosure from '../../components/ui/Disclosure'
import DocumentPreview from './DocumentPreview'
import { validateFile } from './validateFile'

export default function UploadCard() {
  const { document, selectDocument, clearDocument } = useAppState()
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const fileInput = useRef<HTMLInputElement | null>(null)
  const requestId = useRef(0)

  useEffect(
    () => () => {
      requestId.current += 1
    },
    [],
  )

  function handleRemove() {
    requestId.current += 1
    clearDocument()
    setError('')
    setChecking(false)
    if (fileInput.current) fileInput.current.value = ''
  }

  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const files = input.files
    if (!files?.length) return
    const file = files[0]
    const current = ++requestId.current
    setChecking(true)
    setError('')
    try {
      const result = await validateFile(file)
      if (current === requestId.current)
        selectDocument({ file, ...result, selectionId: crypto.randomUUID() })
    } catch (failure) {
      if (current === requestId.current)
        setError(
          failure instanceof Error
            ? failure.message
            : 'Unable to read this file.',
        )
    } finally {
      if (current === requestId.current) setChecking(false)
      input.value = ''
    }
  }

  return (
    <section
      className="min-w-0 rounded-2xl border border-[#e4e6dd] bg-[#fffefa] p-6 shadow-sm md:p-8"
      aria-labelledby="upload-title"
    >
      <p className="eyebrow">START WITH YOUR FORM</p>
      <h2 id="upload-title">
        Add your form.
        <br />
        No sign-in needed to preview.
      </h2>
      <p id="file-help" className="text-sm leading-relaxed text-[#5d6d61]">
        Choose one PDF, JPG, PNG, or WebP, up to 10 MB. PDFs can have up to 100
        pages.
      </p>
      <div className="mt-5 rounded-xl border border-dashed border-[#9dae91] bg-[#f2f5eb] p-5">
        <label htmlFor="form-file" className="mb-3 block text-sm font-semibold">
          Choose a form from your device
        </label>
        <input
          ref={fileInput}
          id="form-file"
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp"
          onChange={selectFile}
          aria-describedby="file-help local-privacy file-error"
          disabled={checking}
          className="block w-full min-w-0 text-sm file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-[#9dae91] file:bg-white file:px-3 file:py-3 file:font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a25b19]"
        />
        <p
          id="local-privacy"
          className="mt-3 text-xs leading-relaxed text-[#4c604f]"
        >
          Your document stays in this page’s memory. No upload to a server or
          AI. Refreshing or closing this page clears the selection.
        </p>
      </div>
      <p id="file-error" role="alert" className="mt-3 text-sm text-[#8a321f]">
        {error}
      </p>
      <p role="status" className="text-sm">
        {checking
          ? 'Checking your file…'
          : document
            ? 'Document selected. Local preview below.'
            : ''}
      </p>
      {document && (
        <div className="mt-4">
          <p className="break-words text-sm font-semibold">
            {document.file.name}
          </p>
          <p className="mt-1 text-xs text-[#5d6d61]">
            {(document.file.size / (1024 * 1024)).toFixed(2)} MB · On this
            device
          </p>
          <DocumentPreview key={document.selectionId} document={document} />
          <Button className="mt-4" onClick={handleRemove}>
            Remove document
          </Button>
        </div>
      )}
      <Disclosure
        title="Your document and your choices"
        className="mt-4 border-b-0 border-t border-[#dbe1d3] pt-2"
      >
        <p>
          Selecting a file does not send it to AI. Signing in shares your Google
          identity with our authentication provider, not your selected document.
        </p>
        <p>
          Previewing is free. Understanding and filling are free; downloading or
          printing a completed document costs $0.50 per page. No subscription.
        </p>
      </Disclosure>
    </section>
  )
}
