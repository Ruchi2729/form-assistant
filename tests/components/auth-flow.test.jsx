import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UploadCard from '../../src/features/documents/UploadCard.jsx'
import LoginCard from '../../src/features/auth/LoginCard.jsx'
import {
  signInWithGoogle,
  signOutAccount,
} from '../../src/features/auth/firebase.js'

vi.mock('../../src/features/auth/firebase.js', () => ({
  signInWithGoogle: vi.fn(),
  signOutAccount: vi.fn(),
}))

// Preview rendering is exercised with actual files in Playwright, not simulated here.
vi.mock('../../src/features/documents/DocumentPreview.jsx', () => ({
  default: ({ document }) => <p>Preview: {document.file.name}</p>,
}))

beforeEach(() => {
  Blob.prototype.arrayBuffer = function () {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsArrayBuffer(this)
    })
  }
})
afterEach(cleanup)

async function chooseDocument(user) {
  await user.upload(
    screen.getByLabelText('Choose a form from your device'),
    new File(['%PDF-1.7\n'], 'sample.pdf', { type: 'application/pdf' }),
  )
  await screen.findByText('Preview: sample.pdf')
}

describe('authentication and selected document ownership', () => {
  it('preserves the selected document when sign-in is cancelled', async () => {
    signInWithGoogle.mockRejectedValue({ code: 'auth/popup-closed-by-user' })
    const user = userEvent.setup()
    render(<UploadCard user={null} loading={false} />)
    await chooseDocument(user)
    await user.click(
      screen.getByRole('button', { name: 'Continue with Google' }),
    )
    await screen.findByText(/Sign-in cancelled/)
    expect(screen.getByText('Preview: sample.pdf')).toBeTruthy()
  })

  it('preserves the document after successful sign-in and the parent receives the user', async () => {
    signInWithGoogle.mockResolvedValue({ user: { displayName: 'Test Member' } })
    const user = userEvent.setup()
    const view = render(<UploadCard user={null} loading={false} />)
    await chooseDocument(user)
    await user.click(
      screen.getByRole('button', { name: 'Continue with Google' }),
    )
    await screen.findByText(/You’re signed in/)
    view.rerender(
      <UploadCard user={{ displayName: 'Test Member' }} loading={false} />,
    )
    expect(screen.getByText('Signed in as Test Member')).toBeTruthy()
    expect(screen.getByText('Preview: sample.pdf')).toBeTruthy()
  })

  it('clears the selected document after a successful sign-out', async () => {
    signOutAccount.mockResolvedValue()
    const user = userEvent.setup()
    render(<UploadCard user={{ displayName: 'Test Member' }} loading={false} />)
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
    signOutAccount.mockRejectedValue(new Error('network'))
    const user = userEvent.setup()
    render(<UploadCard user={{ displayName: 'Test Member' }} loading={false} />)
    await chooseDocument(user)
    await user.click(
      screen.getByRole('button', { name: 'Sign out and clear document' }),
    )
    await screen.findByText(/couldn’t sign you out/)
    expect(screen.getByText('Preview: sample.pdf')).toBeTruthy()
  })

  it('prevents duplicate sign-in requests while a request is pending', async () => {
    let complete
    signInWithGoogle.mockImplementation(
      () =>
        new Promise((resolve) => {
          complete = resolve
        }),
    )
    const user = userEvent.setup()
    render(<LoginCard user={null} loading={false} onSignedOut={() => {}} />)
    await user.click(
      screen.getByRole('button', { name: 'Continue with Google' }),
    )
    const button = screen.getByRole('button', { name: 'Signing in…' })
    expect(button.disabled).toBe(true)
    await user.click(button)
    expect(signInWithGoogle).toHaveBeenCalledTimes(1)
    complete({ user: {} })
    await screen.findByRole('button', { name: 'Continue with Google' })
  })

  it.each([
    ['auth/popup-blocked', /browser blocked/],
    ['auth/network-request-failed', /Check your connection/],
    ['auth/not-configured', /currently unavailable/],
  ])('explains %s with an actionable message', async (code, message) => {
    signInWithGoogle.mockRejectedValue({ code })
    const user = userEvent.setup()
    render(<LoginCard user={null} loading={false} onSignedOut={() => {}} />)
    await user.click(
      screen.getByRole('button', { name: 'Continue with Google' }),
    )
    await screen.findByText(message)
  })
})
