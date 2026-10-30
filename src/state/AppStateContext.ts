import type { AppContextValue } from './types'
import { createContext } from 'react'

export const AppStateContext = createContext<AppContextValue | null>(null)
