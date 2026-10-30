export default function Button({
  children,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-[#cdd4c8] bg-[#fffefa] px-4 py-3 text-sm font-semibold text-[#2e3c32] transition-colors hover:border-[#74876d] hover:bg-[#f0f3e9] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
