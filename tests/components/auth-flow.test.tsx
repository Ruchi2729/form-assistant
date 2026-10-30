import type { ReactNode } from 'react'
import type { AppUser, SelectedDocument } from '../../src/state/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import App from '../../src/App'
import AppStateProvider from '../../src/state/AppStateProvider'
import useAppState from '../../src/state/useAppState'
import UploadCard from '../../src/features/documents/UploadCard'
import LoginCard from '../../src/features/auth/LoginCard'
import {
  signInWithGoogle,
  signOutAccount,
} from '../../src/features/auth/firebase'

type SessionMock = {
  user: AppUser | null
  listener: ((user: AppUser | null) => void) | null
  previewReady: boolean
}
const session = vi.hoisted<SessionMock>(() => ({
  user: null,
  listener: null,
  previewReady: true,
}))

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth, listener) => {
    session.listener = listener
    listener(session.user)
    return () => {
      session.listener = null
    }
  }),
}))

vi.mock('../../src/features/auth/firebase', () => ({
  auth: {},
  authConfigured: true,
  signInWithGoogle: vi.fn(),
  signOutAccount: vi.fn(),
}))

// Preview rendering is exercised with actual files in Playwright, not simulated here.
vi.mock('../../src/features/documents/DocumentPreview', () => ({
  default: function Preview({ document }: { document: SelectedDocument }) {
    const { markDocumentReady } = useAppState()
    useEffect(() => {
      if (session.previewReady) markDocumentReady(document.selectionId)
    }, [markDocumentReady, document.selectionId])
    return <p>Preview: {document.file.name}</p>
  },
}))

function renderApp(ui: ReactNode) {
  return render(<AppStateProvider>{ui}</AppStateProvider>)
}

beforeEach(() => {
  session.user = null
  session.listener = null
  session.previewReady = true
  Blob.prototype.arrayBuffer = function () {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () =>
        reader.result instanceof ArrayBuffer
          ? resolve(reader.result)
          : reject(new Error('Expected binary file contents'))
      reader.onerror = reject
      reader.readAsArrayBuffer(this)
    })
  }
})
afterEach(cleanup)

async function chooseDocument(user: ReturnType<typeof userEvent.setup>) {
  await user.upload(
    screen.getByLabelText('Choose a form from your device'),
    new File(['%PDF-1.7\n'], 'sample.pdf', { type: 'application/pdf' }),
  )
  await screen.findByText('Preview: sample.pdf')
}

describe('authentication and selected document ownership', () => {
  it('preserves the selected document when sign-in is cancelled', async () => {
    vi.mocked(signInWithGoogle).mockRejectedValue({
      code: 'auth/popup-closed-by-user',
    })
    const user = userEvent.setup()
    renderApp(
      <>
        <UploadCard />
        <LoginCard />
      </>,
    )
    await chooseDocument(user)
    await user.click(
      screen.getByRole('button', { name: 'Continue with Google' }),
    )
    await screen.findByText(/Sign-in cancelled/)
    expect(screen.getByText('Preview: sample.pdf')).toBeTruthy()
  })

  it('preserves the document after successful sign-in and the parent receives the user', async () => {
    vi.mocked(signInWithGoogle).mockImplementation(async () => {
      session.listener?.({ uid: 'member-1', displayName: 'Test Member' })
    })
    const user = userEvent.setup()
    renderApp(<App />)
    await chooseDocument(user)
    await user.click(
      screen.getByRole('button', { name: 'Continue with Google' }),
    )
    await screen.findByRole('heading', { name: 'Your document is ready.' })
    expect(screen.getByText('Signed in as Test Member')).toBeTruthy()
    expect(screen.getByText('Preview: sample.pdf')).toBeTruthy()
  })

  it('clears the selected document after a successful sign-out', async () => {
    vi.mocked(signOutAccount).mockImplementation(async () => {
      session.listener?.(null)
    })
    const user = userEvent.setup()
    session.user = { uid: 'member-1', displayName: 'Test Member' }
    renderApp(
      <>
        <UploadCard />
        <LoginCard />
      </>,
    )
    await chooseDocument(user)
    await user.click(
      screen.getByRole('button', { name: 'Sign out and clear document' }),
    )
    await waitFor(() =>
      expect(screen.queryByText('Preview: sample.pdf')).toBeNull(),
    )
    await screen.findByText(/Signed out/)
  })

  it('preserves the document if sign-out fails', async () => {
    vi.mocked(signOutAccount).mockRejectedValue(new Error('network'))
    const user = userEvent.setup()
    session.user = { uid: 'member-1', displayName: 'Test Member' }
    renderApp(
      <>
        <UploadCard />
        <LoginCard />
      </>,
    )
    await chooseDocument(user)
    await user.click(
      screen.getByRole('button', { name: 'Sign out and clear document' }),
    )
    await screen.findByText(/couldn’t sign you out/)
    expect(screen.getByText('Preview: sample.pdf')).toBeTruthy()
  })

  it('prevents duplicate sign-in requests while a request is pending', async () => {
    let complete: () => void = () => {
      throw new Error('Sign-in was not started')
    }
    vi.mocked(signInWithGoogle).mockImplementation(
      () =>
        new Promise((resolve) => {
          complete = resolve
        }),
    )
    const user = userEvent.setup()
    renderApp(<LoginCard />)
    await user.click(
      screen.getByRole('button', { name: 'Continue with Google' }),
    )
    const button = screen.getByRole('button', { name: 'Signing in…' })
    expect((button as HTMLButtonElement).disabled).toBe(true)
    await user.click(button)
    expect(signInWithGoogle).toHaveBeenCalledTimes(1)
    complete()
    await screen.findByRole('button', { name: 'Continue with Google' })
  })

  it.each([
    ['auth/popup-blocked', /browser blocked/],
    ['auth/network-request-failed', /Check your connection/],
    ['auth/not-configured', /currently unavailable/],
  ])('explains %s with an actionable message', async (code, message) => {
    vi.mocked(signInWithGoogle).mockRejectedValue({ code })
    const user = userEvent.setup()
    renderApp(<LoginCard />)
    await user.click(
      screen.getByRole('button', { name: 'Continue with Google' }),
    )
    await screen.findByText(message)
  })
})

it('enters the workspace when an already signed-in member selects a ready document', async () => {
  session.user = { uid: 'member-1', displayName: 'Test Member' }
  const user = userEvent.setup()
  renderApp(<App />)
  expect(
    screen.queryByRole('heading', { name: 'Your document is ready.' }),
  ).toBeNull()
  await chooseDocument(user)
  await screen.findByRole('heading', { name: 'Your document is ready.' })
  await user.click(
    screen.getByRole('button', { name: 'Choose a different document' }),
  )
  await screen.findByLabelText('Choose a form from your device')
  expect(screen.getByText('Signed in as Test Member')).toBeTruthy()
})

it('does not enter the workspace before document preview succeeds', async () => {
  session.user = { uid: 'member-1', displayName: 'Test Member' }
  session.previewReady = false
  const user = userEvent.setup()
  renderApp(<App />)
  await chooseDocument(user)
  expect(
    screen.queryByRole('heading', { name: 'Your document is ready.' }),
  ).toBeNull()
})

it('shows a clearly unavailable chatbot after login without accepting messages', async () => {
  vi.mocked(signInWithGoogle).mockImplementation(async () => {
    session.listener?.({ uid: 'member-1', displayName: 'Test Member' })
  })
  const user = userEvent.setup()
  renderApp(<App />)
  await chooseDocument(user)
  await user.click(screen.getByRole('button', { name: 'Continue with Google' }))
  await screen.findByText('Under construction')
  expect(screen.getByRole('log', { name: 'Agent conversation' })).toBeTruthy()
  const composer = screen.getByRole<HTMLTextAreaElement>('textbox', {
    name: 'Message your assistant',
  })
  expect(composer.disabled).toBe(true)
  expect(
    screen.getByText(/No document information has been sent to AI/),
  ).toBeTruthy()
})

it('returns to document selection and clears the document when signing out of the workspace', async () => {
  session.user = { uid: 'member-1', displayName: 'Test Member' }
  vi.mocked(signOutAccount).mockImplementation(async () => {
    session.listener?.(null)
  })
  const user = userEvent.setup()
  renderApp(<App />)
  await chooseDocument(user)
  await screen.findByText('Under construction')
  await user.click(
    screen.getByRole('button', { name: 'Sign out and clear document' }),
  )
  await screen.findByLabelText('Choose a form from your device')
  expect(screen.queryByText('Under construction')).toBeNull()
  expect(screen.queryByText('Preview: sample.pdf')).toBeNull()
})
