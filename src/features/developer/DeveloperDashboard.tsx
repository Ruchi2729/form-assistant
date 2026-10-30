import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button'

type Version = { version: string; commit: string; builtAt: string }
type Run = {
  id: number
  html_url: string
  status: string
  conclusion: string | null
  head_sha: string
  created_at: string
  run_number: number
}
type DashboardState = {
  loading: boolean
  version: Version | null
  healthy: boolean | null
  runs: Run[]
  error: string
}

async function readVersion(signal: AbortSignal): Promise<Version> {
  const response = await fetch('/version.json', { signal, cache: 'no-store' })
  if (!response.ok) throw new Error('Build metadata is unavailable.')
  const data: unknown = await response.json()
  if (
    !data ||
    typeof data !== 'object' ||
    !('version' in data) ||
    typeof data.version !== 'string' ||
    !('commit' in data) ||
    typeof data.commit !== 'string' ||
    !('builtAt' in data) ||
    typeof data.builtAt !== 'string'
  )
    throw new Error('Build metadata has an unexpected format.')
  return { version: data.version, commit: data.commit, builtAt: data.builtAt }
}

function isRun(value: unknown): value is Run {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'number' &&
    'html_url' in value &&
    typeof value.html_url === 'string' &&
    value.html_url.startsWith(
      'https://github.com/Ruchi2729/form-assistant/actions/runs/',
    ) &&
    'status' in value &&
    typeof value.status === 'string' &&
    'conclusion' in value &&
    (value.conclusion === null || typeof value.conclusion === 'string') &&
    'head_sha' in value &&
    typeof value.head_sha === 'string' &&
    'created_at' in value &&
    typeof value.created_at === 'string' &&
    'run_number' in value &&
    typeof value.run_number === 'number'
  )
}

async function readRuns(signal: AbortSignal): Promise<Run[]> {
  const response = await fetch(
    'https://api.github.com/repos/Ruchi2729/form-assistant/actions/runs?branch=main&event=push&per_page=8',
    { signal, headers: { Accept: 'application/vnd.github+json' } },
  )
  if (!response.ok)
    throw new Error(
      response.status === 403 || response.status === 429
        ? 'GitHub’s public API rate limit was reached. Use the Actions link below.'
        : 'GitHub deployment status is unavailable.',
    )
  const data: unknown = await response.json()
  if (
    !data ||
    typeof data !== 'object' ||
    !('workflow_runs' in data) ||
    !Array.isArray(data.workflow_runs)
  )
    throw new Error('GitHub returned an unexpected response.')
  return data.workflow_runs.filter(isRun)
}

export default function DeveloperDashboard() {
  const [refresh, setRefresh] = useState(0)
  const [state, setState] = useState<DashboardState>({
    loading: true,
    version: null,
    healthy: null,
    runs: [],
    error: '',
  })
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      const [version, health, runs] = await Promise.allSettled([
        readVersion(controller.signal),
        fetch('/health', { signal: controller.signal, cache: 'no-store' }).then(
          async (response) => response.ok && (await response.text()) === 'ok',
        ),
        readRuns(controller.signal),
      ])
      if (controller.signal.aborted) return
      const errors = [version, runs].flatMap((result) =>
        result.status === 'rejected'
          ? [
              result.reason instanceof Error
                ? result.reason.message
                : 'Status unavailable.',
            ]
          : [],
      )
      setState({
        loading: false,
        version: version.status === 'fulfilled' ? version.value : null,
        healthy: health.status === 'fulfilled' ? health.value : null,
        runs: runs.status === 'fulfilled' ? runs.value : [],
        error: errors.join(' '),
      })
    }
    void load()
    return () => controller.abort()
  }, [refresh])

  function refreshStatus() {
    setState((current) => ({ ...current, loading: true }))
    setRefresh((value) => value + 1)
  }

  return (
    <main className="mx-auto max-w-6xl space-y-7 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">FORM ASSISTANT · DEVELOPER</p>
          <h1 className="!my-3 !text-3xl !tracking-tight">
            Deployment dashboard
          </h1>
        </div>
        <div>
          <Button onClick={refreshStatus} disabled={state.loading}>
            {state.loading ? 'Checking…' : 'Refresh status'}
          </Button>
        </div>
      </div>
      <p className="text-sm text-[#5d6d61]">
        Public operational metadata only. Google Cloud administration and logs
        require your Google account. No API keys, user details, or documents are
        shown here.
      </p>
      <p role="status" className="text-sm">
        {state.error ||
          (state.loading
            ? 'Loading current status…'
            : 'Status checked. Refresh to update.')}
      </p>
      <section
        aria-label="Current deployment"
        className="grid gap-4 md:grid-cols-3"
      >
        <article className="rounded-xl border border-[#dbe1d3] bg-white p-5">
          <h2 className="!mt-0 !text-base !tracking-normal">
            Application health
          </h2>
          <p className="font-semibold">
            {state.healthy === null
              ? 'Unknown'
              : state.healthy
                ? 'Healthy'
                : 'Unhealthy'}
          </p>
          <p className="mt-2 text-xs">
            HTTP check of this deployment’s /health endpoint.
          </p>
        </article>
        <article className="rounded-xl border border-[#dbe1d3] bg-white p-5">
          <h2 className="!mt-0 !text-base !tracking-normal">
            Deployed version
          </h2>
          <p className="font-semibold">
            {state.version?.version || 'Unavailable'}
          </p>
          <p className="mt-2 break-all font-mono text-xs">
            Commit: {state.version?.commit || 'Unknown'}
          </p>
        </article>
        <article className="rounded-xl border border-[#dbe1d3] bg-white p-5">
          <h2 className="!mt-0 !text-base !tracking-normal">Build time</h2>
          <p className="text-sm">
            {state.version
              ? new Date(state.version.builtAt).toLocaleString()
              : 'Unavailable'}
          </p>
          <p className="mt-2 text-xs">
            Build timestamp; not the time deployment completed.
          </p>
        </article>
      </section>
      <section aria-labelledby="runs-title">
        <h2 id="runs-title" className="!text-xl !tracking-tight">
          Recent production pipeline runs
        </h2>
        <p className="mb-4 text-sm">
          A running or failed pipeline is separate from the health of the
          currently deployed app. Open a run to inspect its deploy job.
        </p>
        <div className="overflow-x-auto rounded-xl border border-[#dbe1d3] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#dbe1d3] bg-[#f2f5eb]">
              <tr>
                <th className="p-4">Run</th>
                <th className="p-4">Pipeline status</th>
                <th className="p-4">Commit</th>
                <th className="p-4">Started</th>
              </tr>
            </thead>
            <tbody>
              {state.runs.map((run) => (
                <tr key={run.id} className="border-b border-[#edf0e9]">
                  <td className="p-4">
                    <a className="underline" href={run.html_url}>
                      #{run.run_number}
                    </a>
                  </td>
                  <td className="p-4">{run.conclusion || run.status}</td>
                  <td className="p-4 font-mono">
                    {run.head_sha.slice(0, 8)}
                    {state.version?.commit === run.head_sha
                      ? ' · deployed'
                      : ''}
                  </td>
                  <td className="whitespace-nowrap p-4">
                    {new Date(run.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!state.loading && !state.runs.length && (
            <p className="p-4">No pipeline runs available.</p>
          )}
        </div>
      </section>
      <nav
        aria-label="Developer tools"
        className="flex flex-wrap gap-5 text-sm underline"
      >
        <a href="/">Open application</a>
        <a href="https://github.com/Ruchi2729/form-assistant/actions">
          GitHub Actions
        </a>
        <a href="https://console.cloud.google.com/run/detail/us-central1/form-assistant?project=form-assistant-better-life">
          Cloud Run service &amp; logs
        </a>
        <a href="https://console.cloud.google.com/billing?project=form-assistant-better-life">
          Billing
        </a>
      </nav>
    </main>
  )
}
