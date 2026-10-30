import { test, expect } from '@playwright/test'
import { png, samplePdf } from './fixtures.js'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('previews a photo before sign-in without transmitting its contents', async ({
  page,
}) => {
  const outboundWrites = []
  page.on('request', (request) => {
    if (['POST', 'PUT', 'PATCH'].includes(request.method()))
      outboundWrites.push(request.url())
  })
  await page
    .getByLabel('Choose a form from your device')
    .setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: png })
  const image = page.getByRole('img', { name: 'Your selected form: photo.png' })
  await expect(image).toBeVisible()
  await expect
    .poll(() =>
      image.evaluate((element) => element.complete && element.naturalWidth > 0),
    )
    .toBe(true)
  expect(outboundWrites).toEqual([])
  await page.getByRole('button', { name: 'Remove document' }).click()
  await expect(image).toHaveCount(0)
})

test('renders a real two-page PDF and exposes its text accessibly', async ({
  page,
}) => {
  await page.getByLabel('Choose a form from your device').setInputFiles({
    name: 'form.pdf',
    mimeType: 'application/pdf',
    buffer: samplePdf(),
  })
  await expect(page.getByText('Page 1 of 2', { exact: true })).toBeVisible()
  const canvas = page.getByRole('img', { name: /Preview of PDF page 1/ })
  await expect(canvas).toBeVisible()
  await expect
    .poll(() =>
      canvas.evaluate((element) => {
        const data = element
          .getContext('2d')
          .getImageData(0, 0, element.width, element.height).data
        return data.some(
          (value, index) =>
            index % 4 === 0 && value < 200 && data[index + 3] > 0,
        )
      }),
    )
    .toBe(true)
  await page
    .getByText('Read available text from this page', { exact: true })
    .click()
  await expect(
    page.getByText('Sample application form', { exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Next page' }).click()
  await expect(page.getByText('Page 2 of 2', { exact: true })).toBeVisible()
  await expect(
    page.getByText('Second page instructions', { exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Previous page' }).click()
  await expect(page.getByText('Page 1 of 2', { exact: true })).toBeVisible()
})

test('rejects a spoofed PDF and recovers with a valid selection', async ({
  page,
}) => {
  await page.getByLabel('Choose a form from your device').setInputFiles({
    name: 'fake.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('<html>not a PDF</html>'),
  })
  await expect(page.getByRole('alert')).toContainText('wasn’t recognized')
  await page
    .getByLabel('Choose a form from your device')
    .setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: png })
  await expect(
    page.getByRole('img', { name: 'Your selected form: photo.png' }),
  ).toBeVisible()
  await expect(page.getByRole('alert')).toBeEmpty()
})

test('handles a damaged PDF without crashing and allows retry', async ({
  page,
}) => {
  await page.getByLabel('Choose a form from your device').setInputFiles({
    name: 'broken.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.7\ninvalid body'),
  })
  await expect(page.getByText(/couldn’t read this PDF/)).toBeVisible()
  await page.getByRole('button', { name: 'Remove document' }).click()
  await page.getByLabel('Choose a form from your device').setInputFiles({
    name: 'form.pdf',
    mimeType: 'application/pdf',
    buffer: samplePdf(),
  })
  await expect(page.getByText('Page 1 of 2', { exact: true })).toBeVisible()
})

test('allows reselecting the same document and clears it on reload', async ({
  page,
}) => {
  const input = page.getByLabel('Choose a form from your device')
  const file = {
    name: 'form.pdf',
    mimeType: 'application/pdf',
    buffer: samplePdf(),
  }
  await input.setInputFiles(file)
  await expect(page.getByText('Page 1 of 2', { exact: true })).toBeVisible()
  await input.setInputFiles(file)
  await expect(page.getByText('Page 1 of 2', { exact: true })).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole('button', { name: 'Remove document' }),
  ).toHaveCount(0)
})
