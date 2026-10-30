import test from 'node:test'
import assert from 'node:assert/strict'
import {
  appReducer,
  createInitialState,
  canEnterWorkspace,
} from '../src/state/appReducer.js'

const user = { uid: 'member-1' }
const document = { selectionId: 'doc-1', file: { name: 'sample.pdf' } }
const reduce = (state, ...actions) => actions.reduce(appReducer, state)

test('document-first selection survives the first login', () => {
  const state = reduce(
    createInitialState(false),
    { type: 'document/selected', document },
    { type: 'document/ready', selectionId: 'doc-1' },
    { type: 'auth/resolved', user },
  )
  assert.equal(state.document.file.name, 'sample.pdf')
  assert.equal(canEnterWorkspace(state), true)
})
test('login-first waits until the selected document is ready', () => {
  let state = reduce(
    createInitialState(true),
    { type: 'auth/resolved', user },
    { type: 'document/selected', document },
  )
  assert.equal(canEnterWorkspace(state), false)
  state = appReducer(state, { type: 'document/ready', selectionId: 'doc-1' })
  assert.equal(canEnterWorkspace(state), true)
})
test('anonymous users can preview without entering the workspace', () => {
  const state = reduce(
    createInitialState(false),
    { type: 'document/selected', document },
    { type: 'document/ready', selectionId: 'doc-1' },
  )
  assert.equal(canEnterWorkspace(state), false)
})
test('sign-out or switching accounts clears the previous document', () => {
  const state = reduce(
    createInitialState(false),
    { type: 'auth/resolved', user },
    { type: 'document/selected', document },
  )
  assert.equal(
    appReducer(state, { type: 'auth/resolved', user: null }).document,
    null,
  )
  assert.equal(
    appReducer(state, {
      type: 'auth/resolved',
      user: { uid: 'another-member' },
    }).document,
    null,
  )
})
test('a stale preview completion cannot mark a replacement document ready', () => {
  const state = reduce(createInitialState(false), {
    type: 'document/selected',
    document: { ...document, selectionId: 'doc-2' },
  })
  assert.equal(
    appReducer(state, { type: 'document/ready', selectionId: 'doc-1' }),
    state,
  )
})
test('clearing a document retains the authenticated user', () => {
  const state = reduce(
    createInitialState(false),
    { type: 'auth/resolved', user },
    { type: 'document/selected', document },
    { type: 'document/cleared' },
  )
  assert.equal(state.user, user)
  assert.equal(state.document, null)
  assert.equal(canEnterWorkspace(state), false)
})
test('authentication failure clears sensitive page state', () => {
  const state = reduce(
    createInitialState(false),
    { type: 'auth/resolved', user },
    { type: 'document/selected', document },
    { type: 'auth/failed', message: 'Session lost' },
  )
  assert.equal(state.user, null)
  assert.equal(state.document, null)
  assert.equal(state.authError, 'Session lost')
})
