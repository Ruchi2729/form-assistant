import { initializeApp } from 'firebase/app'
import {
  initializeAuth,
  browserSessionPersistence,
  browserPopupRedirectResolver,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import savedConfigJson from './firebase-config.json'
import type { FirebaseOptions } from 'firebase/app'

const savedConfig: Partial<FirebaseOptions> = savedConfigJson

// Firebase web configuration is public. Never put OAuth secrets here.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || savedConfig.apiKey,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || savedConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || savedConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || savedConfig.appId,
}

export const authConfigured = Object.values(config).every(Boolean)
export const auth = authConfigured
  ? initializeAuth(initializeApp(config), {
      persistence: browserSessionPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    })
  : null

export async function signInWithGoogle(): Promise<void> {
  if (!auth) return Promise.reject(new Error('auth/not-configured'))
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  await signInWithPopup(auth, provider)
}

export function signOutAccount() {
  return auth ? signOut(auth) : Promise.resolve()
}
