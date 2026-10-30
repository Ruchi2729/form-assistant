import { test, expect } from '@playwright/test'

test('developer dashboard shows build metadata and pipeline status', async ({
  page,
}) => {
  let requests = 0
  await page.route(
    /api\.github\.com\/repos\/Ruchi2729\/form-assistant\/actions\/runs/,
    async (route) => {
      requests += 1
      await route.fulfill({
        json: {
          workflow_runs: [
            {
              id: 123,
              html_url:
                'https://github.com/Ruchi2729/form-assistant/actions/runs/123',
              status: 'completed',
              conclusion: 'success',
              head_sha: 'abc12345',
              created_at: '2026-10-29T12:00:00Z',
              run_number: 12,
            },
          ],
        },
      })
    },
  )
  await page.route('**/health', (route) => route.fulfill({ body: 'ok' }))
  await page.goto('/developer')
  await expect(
    page.getByRole('heading', { name: 'Deployment dashboard' }),
  ).toBeVisible()
  await expect(page.getByText('Healthy', { exact: true })).toBeVisible()
  await expect(page.getByText('0.1.0', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: '#12' })).toBeVisible()
  await expect(
    page.getByRole('cell', { name: 'success', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Refresh status' }).click()
  await expect.poll(() => requests).toBeGreaterThanOrEqual(2)
  await expect(
    page.getByRole('button', { name: 'Refresh status' }),
  ).toBeEnabled()
})

test('GitHub API failure does not hide the deployed version or app health', async ({
  page,
}) => {
  await page.route(
    /api\.github\.com\/repos\/Ruchi2729\/form-assistant\/actions\/runs/,
    (route) =>
      route.fulfill({ status: 429, json: { message: 'Rate limited' } }),
  )
  await page.route('**/health', (route) => route.fulfill({ body: 'ok' }))
  await page.goto('/developer')
  await expect(page.getByRole('status')).toContainText('rate limit')
  await expect(page.getByText('0.1.0', { exact: true })).toBeVisible()
  await expect(page.getByText('Healthy', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'GitHub Actions' }),
  ).toHaveAttribute(
    'href',
    'https://github.com/Ruchi2729/form-assistant/actions',
  )
})
