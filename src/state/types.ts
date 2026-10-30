import type { ReactNode } from 'react'

// Store the UI profile only, not authentication tokens or the whole SDK object.
export type AppUser = {
  uid: string
  displayName?: string | null
  email?: string | null
}
export type DocumentKind = 'pdf' | 'image'
export type DocumentInput = {
  file: File
  kind: DocumentKind
  mime: string
  selectionId: string
}
export type SelectedDocument = DocumentInput & { status: 'checking' | 'ready' }
export type AppState = {
  user: AppUser | null
  document: SelectedDocument | null
  authLoading: boolean
  authError: string
}
export type AppAction =
  | { type: 'auth/resolved'; user: AppUser | null }
  | { type: 'auth/failed'; message: string }
  | { type: 'document/selected'; document: DocumentInput }
  | { type: 'document/ready'; selectionId: string }
  | { type: 'document/cleared' }
export type AppContextValue = AppState & {
  selectDocument: (document: DocumentInput) => void
  clearDocument: () => void
  markDocumentReady: (selectionId: string) => void
}
export type PreviewProps = { file: File; onReady: () => void }
export type ProviderProps = { children: ReactNode }
