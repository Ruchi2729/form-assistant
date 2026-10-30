import type { DocumentKind } from '../src/state/types'
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  validateFile,
  MAX_FILE_BYTES,
} from '../src/features/documents/validateFile'

function file(name: string, type: string, bytes: BlobPart): File {
  return new File([bytes], name, { type })
}

test('recognizes PDFs and supported image signatures', async () => {
  const examples: [File, DocumentKind][] = [
    [file('form.pdf', 'application/pdf', '%PDF-1.7\n'), 'pdf'],
    [
      file(
        'form.png',
        'image/png',
        new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
      ),
      'image',
    ],
    [
      file('form.jpg', 'image/jpeg', new Uint8Array([255, 216, 255, 224])),
      'image',
    ],
    [file('form.webp', 'image/webp', 'RIFF0000WEBP'), 'image'],
  ]
  for (const [input, kind] of examples)
    assert.equal((await validateFile(input)).kind, kind)
})
test('accepts an empty browser MIME type only with matching bytes and extension', async () => {
  assert.equal(
    (await validateFile(file('FORM.PDF', '', '%PDF-1.7\n'))).kind,
    'pdf',
  )
})
test('rejects empty files', async () => {
  await assert.rejects(
    validateFile(file('form.pdf', 'application/pdf', '')),
    /empty/,
  )
})
test('rejects files over the size limit before reading their contents', async () => {
  const oversized = file('big.pdf', 'application/pdf', '%PDF-1.7')
  Object.defineProperty(oversized, 'size', { value: MAX_FILE_BYTES + 1 })
  await assert.rejects(validateFile(oversized), /too large/)
})
test('rejects HTML disguised as a PDF', async () => {
  await assert.rejects(
    validateFile(file('form.pdf', 'application/pdf', '<html>bad</html>')),
    /wasn’t recognized/,
  )
})
test('rejects a signature that does not match the file extension', async () => {
  await assert.rejects(
    validateFile(file('form.png', 'image/png', '%PDF-1.7\n')),
    /don’t match/,
  )
})
test('rejects a mismatched nonempty MIME type', async () => {
  await assert.rejects(
    validateFile(file('form.pdf', 'text/html', '%PDF-1.7\n')),
    /don’t match/,
  )
})
test('rejects SVG documents rather than embedding active markup', async () => {
  await assert.rejects(
    validateFile(file('form.svg', 'image/svg+xml', '<svg></svg>')),
    /wasn’t recognized/,
  )
})
