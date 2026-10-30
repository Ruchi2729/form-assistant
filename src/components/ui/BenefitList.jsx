export default function BenefitList({ items }) {
  return (
    <ul className="mt-6 grid list-none gap-4 border-t border-[#e9eae2] p-0 pt-6">
      {items.map(({ title, description }) => (
        <li key={title} className="flex items-start gap-3">
          <span aria-hidden="true" className="mt-0.5 text-xs text-[#668254]">✓</span>
          <div>
            <p className="text-[13px] font-medium">{title}</p>
            <p className="mt-1 text-xs leading-relaxed text-[#75806f]">{description}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
