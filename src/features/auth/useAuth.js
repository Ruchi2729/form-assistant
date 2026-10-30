import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, authConfigured } from './firebase'

export default function useAuth() {
  const [session, setSession] = useState({
    user: null,
    loading: authConfigured,
    error: '',
  })

  useEffect(() => {
    if (!auth) return undefined
    return onAuthStateChanged(
      auth,
      (user) => setSession({ user, loading: false, error: '' }),
      () =>
        setSession({
          user: null,
          loading: false,
          error: 'Unable to restore your session. Please sign in again.',
        }),
    )
  }, [])

  return session
}
