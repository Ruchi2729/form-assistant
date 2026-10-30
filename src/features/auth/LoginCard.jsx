import { useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import BenefitList from '../../components/ui/BenefitList.jsx'
import Disclosure from '../../components/ui/Disclosure.jsx'
import GoogleMark from '../../components/illustrations/GoogleMark.jsx'

const benefits = [
  { title: 'Only the access we need', description: 'Sign-in won’t request Gmail or Google Drive access.' },
  { title: 'Less to keep in your head.', description: 'Follow the next step, or save a question for later.' },
  { title: 'No subscription. Pay only to export.', description: 'Understanding and filling are free. Download or print: $0.50 per page.' },
]

export default function LoginCard() {
  const [notice, setNotice] = useState('')

  return (
    <section className="login-region" aria-labelledby="login-title">
      <div className="login-card">
        <span className="welcome-icon" aria-hidden="true">↗</span>
        <p className="eyebrow">LET’S START HERE</p>
        <h2 id="login-title">Understand your form.<br />Fill it for free.</h2>
        <p className="login-description">Get plain-language explanations and guided help, one question at a time. Start with your Google account.</p>
        <Button className="mt-7" onClick={() => setNotice('Google sign-in is currently unavailable. Please try again later.')}>
          <GoogleMark />Continue with Google</Button>
        <p className="account-note">One Google account. No separate password to remember.</p>
        <div className="notice" role="status">{notice}</div>
        <BenefitList items={benefits} />
        <Disclosure className="mt-6 border-b-0 border-t border-[#e9eae2] pt-3" title="Security &amp; privacy: what happens to my information?">
          <p>Your forms can contain personal information. Share only what is needed, review sensitive answers, and check every signature before exporting. Google account access is limited to sign-in, without Gmail or Google Drive permissions.</p>
        </Disclosure>
      </div>
      <p className="login-footnote">
        <span aria-hidden="true">♡</span> Free help with the form. Clear pricing for the finished copy.</p>
    </section>
    
  )
}
