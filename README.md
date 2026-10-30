# Form Assistant: first screen

A standalone React application for the Form Assistant product. This milestone is an accessible login-screen preview. Google sign-in is intentionally not connected: the button announces the setup state, without fabricating a session. No documents or credentials are collected.

## Run locally

From this directory: `npm ci`, then `npm run dev`. In this workspace, existing parent dependencies also allow `../node_modules/.bin/vite --host 127.0.0.1 --port 5174` without a fresh install. Build using `npm run build`.

## Layout and React concepts

- `index.html` is the HTML shell; `#root` is where React mounts.
- `src/App.tsx` supplies semantic `header`, `main`, `section`, and `footer` landmarks.
- `App`, `DocumentIllustration`, and `GoogleMark` are components: reusable functions returning JSX.
- `useState` holds the sign-in notice. Clicking the button updates state and React updates the status region.
- CSS Grid arranges two columns; the media query below 700px switches to one column. Flexbox aligns smaller rows.
- Padding is space inside a box; margin is space outside it; gap is spacing between layout children. `border-box` includes padding and borders in declared widths.
- Headings express structure; buttons perform actions; links navigate; `details` offers native expandable information.
- The skip link, visible focus, live status, responsive sizing and reduced-motion rule support accessibility. This is not a completed accessibility audit.

## CI/CD to Google Cloud

The workflow at `.github/workflows/deploy.yml` runs on relevant pull requests and main-branch changes. CI installs reproducibly using the lockfile, builds React, and checks the container build. Deployment runs only after CI passes, on main, and when enabled.

Deployment: GitHub OIDC → Workload Identity Federation → deployment service account → Artifact Registry → Cloud Run revision. No service-account key is stored in GitHub. The frontend is a static Nginx container listening on 8080. This does not provide a backend authentication service.

Before enabling deployment:

1. Create a Google Cloud project with billing; enable Cloud Run, Artifact Registry, IAM Credentials and Security Token Service APIs.
2. Create a regional Docker repository in Artifact Registry and a runtime service account without application permissions for this static preview.
3. Create a deployment service account with Artifact Registry Writer on that repository, Cloud Run Developer on the project, and Service Account User on the runtime identity. Configure the Cloud Run service to use the runtime identity before enabling CI deployments.
4. Configure Workload Identity Federation for GitHub OIDC. Restrict trust to your exact repository and main branch (prefer immutable repository/owner IDs). Grant the federated principal Workload Identity User on the deployment service account.
5. Set GitHub variables: GCP_PROJECT_ID, GCP_REGION (for example us-central1), GCP_ARTIFACT_REPOSITORY, GCP_WORKLOAD_IDENTITY_PROVIDER (full provider resource path), GCP_DEPLOY_SERVICE_ACCOUNT (email).
6. Create the GitHub `production` environment; configure branch restrictions and any review policy you want.
7. Set FORM_ASSISTANT_DEPLOY_ENABLED=true only when ready. Public website access is a separate explicit Cloud Run IAM setup step: the deploy workflow does not change access policy. The initial service may require an administrator to provision it and its runtime identity first.
8. Set billing alerts and monitoring, verify the deployed URL and /health, and rehearse rollback to a prior Cloud Run revision. Maximum instances is initially 3 for this preview; tune using measured demand and quotas. It is not a guarantee of a hard spending limit.

The prototype is deployed to Cloud Run in `form-assistant-better-life`, region `us-central1`. See [live deployment](docs/LIVE_DEPLOYMENT.md). This workflow becomes active when this standalone repository is pushed to GitHub.

## Next milestone: real authentication

Enable Google as an Identity Platform/Firebase Authentication provider; configure authorized domains and minimal identity scopes. Add the supported SDK, error states, sign-out, and session restoration. Add a backend that verifies tokens and enforces authorization on every protected endpoint. Never treat decoded browser claims or UI visibility as authorization. Publish actual privacy/terms before enabling account creation.

At 1–2 million accounts, separately model monthly active users, concurrent sessions, pages processed, regional needs, quotas and costs. A deployed login page is not evidence that the full product can handle that load.

## Agentic product direction

See [Agent architecture and learning milestones](docs/AGENT_ARCHITECTURE.md). The LLM guides understanding and proposes actions; application code enforces permissions, approvals, document writes and billing. This architecture is a proposal; no LLM integration is implemented yet.

## Shared UI and Tailwind

Tailwind CSS is enabled through `@tailwindcss/vite` and the CSS import in `src/styles.css`. Layout and shared controls use utilities; custom illustration and typography rules remain in the components CSS layer so utilities take precedence.

`src/App.tsx` composes page sections. `src/components/ui` is our internal shared library: Button accepts children and native button props, Disclosure wraps native details/summary, and BenefitList maps data to a semantic list. Feature-specific content lives under `src/features`. No paid component library is required.

For example, `<Button onClick={handleContinue}>Continue</Button>` reuses appearance and behavior while `children` supplies its label. Keep complete Tailwind class names in source so the build can discover them. New controls should preserve native HTML semantics and keyboard access.
