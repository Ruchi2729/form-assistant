import { useEffect, useRef } from 'react'
import useAppState from '../../state/useAppState.js'
import Button from '../../components/ui/Button.jsx'
import LoginCard from '../auth/LoginCard.jsx'
import DocumentPreview from '../documents/DocumentPreview.jsx'

// The entry boundary only. No AI processing or conversation starts here.
export default function AgentEntry() {
  const { document, clearDocument } = useAppState()
  const heading = useRef(null)
  useEffect(() => {
    heading.current?.focus()
  }, [])

  return (
    <section
      className="mx-auto my-9 max-w-3xl rounded-2xl border border-[#e4e6dd] bg-[#fffefa] p-6 md:p-8"
      aria-labelledby="workspace-title"
    >
      <h1 id="workspace-title" ref={heading} tabIndex={-1} className="text-3xl">
        Your document is ready.
      </h1>
      <p className="mt-3 break-words text-sm">{document.file.name}</p>
      <p className="mt-2 text-sm leading-relaxed text-[#5d6d61]">
        You’re signed in, and your document stays on this device. No document
        information has been sent to AI.
      </p>
      <DocumentPreview document={document} />
      <Button className="mt-4" onClick={clearDocument}>
        Choose a different document
      </Button>
      <LoginCard />
    </section>
  )
}
