import type { ProviderProps, DocumentInput } from './types'
import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, authConfigured } from '../features/auth/firebase'
import { appReducer, createInitialState } from './appReducer'
import { AppStateContext } from './AppStateContext'

export default function AppStateProvider({ children }: ProviderProps) {
  const [state, dispatch] = useReducer(
    appReducer,
    authConfigured,
    createInitialState,
  )

  useEffect(() => {
    if (!auth) return undefined
    return onAuthStateChanged(
      auth,
      (user) => dispatch({ type: 'auth/resolved', user }),
      () =>
        dispatch({
          type: 'auth/failed',
          message: 'Unable to restore your session. Please sign in again.',
        }),
    )
  }, [])

  const selectDocument = useCallback((document: DocumentInput) => {
    dispatch({ type: 'document/selected', document })
  }, [])
  const clearDocument = useCallback(
    () => dispatch({ type: 'document/cleared' }),
    [],
  )
  const markDocumentReady = useCallback((selectionId: string) => {
    dispatch({ type: 'document/ready', selectionId })
  }, [])
  const value = useMemo(
    () => ({ ...state, selectDocument, clearDocument, markDocumentReady }),
    [state, selectDocument, clearDocument, markDocumentReady],
  )

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  )
}
