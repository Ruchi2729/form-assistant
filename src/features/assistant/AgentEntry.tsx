import { useEffect, useRef } from 'react'
import useAppState from '../../state/useAppState'
import Button from '../../components/ui/Button'
import LoginCard from '../auth/LoginCard'
import DocumentPreview from '../documents/DocumentPreview'

export default function AgentEntry() {
  const { document, user, clearDocument } = useAppState()
  const heading = useRef<HTMLHeadingElement | null>(null)
  useEffect(() => {
    heading.current?.focus()
  }, [])
  if (!document || !user) return null

  return (
    <section
      className="mx-auto my-9 max-w-4xl overflow-hidden rounded-2xl border border-[#dbe1d3] bg-[#fffefa] shadow-sm"
      aria-labelledby="workspace-title"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dbe1d3] px-6 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#5d6d61]">
            Form Assistant
          </p>
          <h1
            id="workspace-title"
            ref={heading}
            tabIndex={-1}
            className="!my-2 !text-2xl !tracking-tight"
          >
            Your document is ready.
          </h1>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900">
          Under construction
        </span>
      </header>
      <div className="space-y-6 p-6">
        <p className="break-words rounded-lg bg-[#f2f5eb] px-4 py-3 text-sm">
          <strong>Selected document:</strong> {document.file.name}
        </p>
        <div
          role="log"
          aria-label="Agent conversation"
          className="min-h-52 space-y-4"
        >
          <div className="max-w-xl rounded-2xl rounded-tl-sm border border-[#dbe1d3] bg-white p-5 text-sm leading-relaxed">
            <p className="mb-2 font-semibold">
              Hello{user.displayName ? `, ${user.displayName}` : ''}.
            </p>
            <p>
              You’re signed in, and your document is ready. Our guided form
              assistant is under construction.
            </p>
            <p className="mt-3">
              Your document stays on this device. No document information has
              been sent to AI.
            </p>
          </div>
        </div>
        <div>
          <label
            htmlFor="agent-message"
            className="mb-2 block text-sm font-semibold"
          >
            Message your assistant
          </label>
          <textarea
            id="agent-message"
            disabled
            rows={2}
            placeholder="Agent chat is under construction"
            aria-describedby="agent-status"
            className="w-full resize-none rounded-xl border border-[#dbe1d3] bg-[#f7f6f2] p-4 text-sm disabled:cursor-not-allowed"
          />
          <p id="agent-status" className="mt-2 text-xs text-[#5d6d61]">
            Chat is unavailable. You can review your document or choose another
            below.
          </p>
        </div>
        <details className="border-t border-[#dbe1d3] pt-3">
          <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">
            Review your document
          </summary>
          <DocumentPreview document={document} />
        </details>
        <Button onClick={clearDocument}>Choose a different document</Button>
        <LoginCard />
      </div>
    </section>
  )
}
