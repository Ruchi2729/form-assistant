export default function Header() {
  return (
    <header className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-6 md:px-[6%] md:py-8">
      <a className="brand" href="/" aria-label="Form Assistant home">
        <span className="brand-mark" aria-hidden="true">f<span>✓</span>
        </span>form<span className="brand-light">assistant</span>
      </a>
      <span className="header-note">One form. No subscription.</span>
    </header>
    
  )
}
