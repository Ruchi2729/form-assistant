export default function Disclosure({ title, children, className = '' }) {
  return (
    <details className={`border-b border-[#dbe1d3] pb-4 ${className}`}>
      <summary className="min-h-11 cursor-pointer py-2.5 text-sm font-semibold">
        {title}
      </summary>
      <div className="space-y-3 pt-2 text-sm leading-relaxed text-[#5d6d61]">
        {children}
      </div>
    </details>
  )
}
