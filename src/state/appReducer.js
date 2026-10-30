export function createInitialState(authConfigured) {
  return {
    user: null,
    document: null,
    authLoading: authConfigured,
    authError: '',
  }
}

export function appReducer(state, action) {
  switch (action.type) {
    case 'auth/resolved': {
      const accountChanged = state.user && state.user.uid !== action.user?.uid
      return {
        ...state,
        user: action.user,
        document: accountChanged ? null : state.document,
        authLoading: false,
        authError: '',
      }
    }
    case 'auth/failed':
      return {
        ...state,
        user: null,
        document: null,
        authLoading: false,
        authError: action.message,
      }
    case 'document/selected':
      return { ...state, document: { ...action.document, status: 'checking' } }
    case 'document/ready':
      if (
        state.document?.selectionId !== action.selectionId ||
        state.document.status === 'ready'
      )
        return state
      return { ...state, document: { ...state.document, status: 'ready' } }
    case 'document/cleared':
      return { ...state, document: null }
    default:
      return state
  }
}

export function canEnterWorkspace(state) {
  return (
    !state.authLoading &&
    Boolean(state.user && state.document?.status === 'ready')
  )
}
