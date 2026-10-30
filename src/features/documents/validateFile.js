export const MAX_FILE_BYTES = 10 * 1024 * 1024

const formats = {
  pdf: { extensions: ['pdf'], mime: 'application/pdf' },
  png: { extensions: ['png'], mime: 'image/png' },
  jpeg: { extensions: ['jpg', 'jpeg'], mime: 'image/jpeg' },
  webp: { extensions: ['webp'], mime: 'image/webp' },
}

export async function validateFile(file) {
  if (!file || file.size === 0)
    throw new Error('Choose a file that isn’t empty.')
  if (file.size > MAX_FILE_BYTES)
    throw new Error('This file is too large. Choose a file under 10 MB.')
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  const text = String.fromCharCode(...header)
  let format
  if (text.startsWith('%PDF-')) format = 'pdf'
  else if ([137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => header[i] === n))
    format = 'png'
  else if (header[0] === 255 && header[1] === 216 && header[2] === 255)
    format = 'jpeg'
  else if (text.startsWith('RIFF') && text.slice(8, 12) === 'WEBP')
    format = 'webp'
  if (!format)
    throw new Error(
      'Choose a PDF, JPG, PNG, or WebP image. This file’s format wasn’t recognized.',
    )
  const extension = file.name.split('.').pop().toLowerCase()
  const expected = formats[format]
  if (
    !expected.extensions.includes(extension) ||
    (file.type && file.type !== expected.mime)
  ) {
    throw new Error(
      'The file contents don’t match its name or type. Export it as a PDF or supported image and try again.',
    )
  }
  return { kind: format === 'pdf' ? 'pdf' : 'image', mime: expected.mime }
}
