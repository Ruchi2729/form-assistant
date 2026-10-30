import { useEffect, useRef, useState } from 'react'

export default function ImagePreview({ file }) {
  const imageRef = useRef(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    // Object URLs are local browser references, not uploads.
    imageRef.current.src = objectUrl
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])
  return (
    <div className="mt-4">
      {error ? (
        <p role="alert">We couldn’t display this image. Choose another copy.</p>
      ) : (
        <img
          ref={imageRef}
          alt={`Your selected form: ${file.name}`}
          onError={() => setError(true)}
          className="max-h-[600px] w-full rounded border border-[#dbe1d3] object-contain"
        />
      )}
      <p className="mt-2 text-xs leading-relaxed text-[#5d6d61]">
        This is an image preview. Its written contents have not been transcribed
        or explained.
      </p>
    </div>
  )
}
