import { useState } from 'react'
import useAppState from '../../state/useAppState.js'
import Button from '../../components/ui/Button.jsx'
import GoogleMark from '../../components/illustrations/GoogleMark.jsx'
import { signInWithGoogle, signOutAccount } from './firebase'

function signInMessage(error) {
  const messages = {
    'auth/popup-closed-by-user':
      'Sign-in cancelled. Your selected document is still here.',
    'auth/cancelled-popup-request':
      'Another sign-in window is open. Continue there or try again.',
    'auth/popup-blocked':
      'Your browser blocked the sign-in window. Allow popups for this site and try again.',
    'auth/network-request-failed':
      'We couldn’t connect. Check your connection and try again.',
    'auth/unauthorized-domain':
      'Sign-in is unavailable on this address. Please use the main app address.',
    'auth/operation-not-allowed':
      'Google sign-in is currently unavailable. Please try again later.',
    'auth/not-configured':
      'Google sign-in is currently unavailable. Please try again later.',
  }
  return (
    messages[error.code || error.message] ||
    'We couldn’t sign you in. Please try again.'
  )
}

export default function LoginCard() {
  const {
    user,
    authLoading: loading,
    authError: sessionError,
    clearDocument,
  } = useAppState()
  const [pending, setPending] = useState(false)
  const [notice, setNotice] = useState('')

  async function handleSignIn() {
    setPending(true)
    setNotice('')
    try {
      await signInWithGoogle()
      setNotice(
        'You’re signed in. Your selected document stays on this device.',
      )
    } catch (error) {
      setNotice(signInMessage(error))
    } finally {
      setPending(false)
    }
  }

  async function handleSignOut() {
    setPending(true)
    try {
      await signOutAccount()
      clearDocument()
      setNotice(
        'Signed out. Your selected document has been removed from this page.',
      )
    } catch {
      setNotice('We couldn’t sign you out. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <section
      className="mt-6 border-t border-[#dbe1d3] pt-5"
      aria-labelledby="account-title"
    >
      <h3 id="account-title" className="text-base font-semibold">
        {user ? 'Your account' : 'Your form first. Sign in when you’re ready.'}
      </h3>
      {user ? (
        <div className="mt-3 space-y-3">
          <p className="break-words text-sm">
            Signed in as {user.displayName || user.email}
          </p>
          <Button disabled={pending} onClick={handleSignOut}>
            {pending ? 'Signing out…' : 'Sign out and clear document'}
          </Button>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm leading-relaxed text-[#5d6d61]">
            Choose and preview a form without an account. Google sign-in
            requests no Gmail or Drive access.
          </p>
          <Button
            className="mt-4"
            disabled={pending || loading}
            onClick={handleSignIn}
          >
            <GoogleMark />
            {loading
              ? 'Checking your session…'
              : pending
                ? 'Signing in…'
                : 'Continue with Google'}
          </Button>
          <p className="mt-2 text-xs text-[#5d6d61]">
            Sign-in stays active in this browser tab’s session.
          </p>
        </>
      )}
      <p className="mt-3 text-sm text-[#6a461e]" role="status">
        {notice || sessionError}
      </p>
    </section>
  )
}
