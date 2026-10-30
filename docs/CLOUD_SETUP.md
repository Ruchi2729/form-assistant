# First Google Cloud deployment

## Deployment configuration

Project: `form-assistant-better-life` (313979383533). Region: `us-central1`. Repository: `Ruchi2729/form-assistant`. Nonsecret deployment identifiers are checked into the workflow. Deployment runs after CI passes on main; pull requests run checks only.

Run `scripts/bootstrap-cloud.sh` as a project administrator for initial registry, service identities and Workload Identity Federation setup. Public Cloud Run invocation is configured separately by the administrator after initial deployment.

## Original setup checklist (reference)

The frontend build and local lint pass. GitHub Actions runs lint, a production build, a Docker build, and HTTP smoke checks against the container. Cloud deployment requires the setup below. Google sign-in, uploads and LLM calls are not connected; publishing the frontend does not enable those features.

## 1. Create a project

1. Open https://console.cloud.google.com/ and sign in.
2. Project selector → New Project → name: Form Assistant. A personal account can use No organization.
3. Record the project ID, which is different from its display name and numeric project number.
4. Link a billing account. Review current Cloud Run and Artifact Registry pricing. Set a billing budget and email alerts; a budget is an alert, not a spending cap.
5. Open Cloud Shell using the terminal icon. It has gcloud installed. Confirm the intended project/account before creating resources.

Send the project ID to continue setup. Do not share passwords, access tokens or service-account keys in chat.

## 2. One-time infrastructure configuration

Use a region selected for the initial audience, for example us-central1. Enable run.googleapis.com, artifactregistry.googleapis.com, iam.googleapis.com, iamcredentials.googleapis.com and sts.googleapis.com.

Create a regional Artifact Registry Docker repository, a dedicated deployment service account and a dedicated runtime service account. The static frontend runtime does not need access to documents, databases or models.

The deployment account needs Artifact Registry Writer on the image repository, Cloud Run Developer on the project, and Service Account User on the runtime account. An administrator configures public invocation separately; the workflow does not grant public access.

Create a Workload Identity Pool/provider for GitHub OIDC. Map google.subject to assertion.sub and a repository_id attribute to assertion.repository_id. Restrict provider acceptance to repository ID 1439141132 (Ruchi2729/form-assistant), owner ID 20729220, and refs/heads/main. Grant the corresponding repository principalSet Workload Identity User on the deployment account. Trust must work with the production GitHub environment subject. Avoid a downloadable service-account key.

## 3. GitHub settings

Create a production environment and configure these environment variables:

| Variable | Value |
| --- | --- |
| GCP_PROJECT_ID | Google Cloud project ID |
| GCP_REGION | Selected region |
| GCP_ARTIFACT_REPOSITORY | Docker repository name |
| GCP_WORKLOAD_IDENTITY_PROVIDER | Full projects/NUMBER/locations/global/workloadIdentityPools/POOL/providers/PROVIDER resource |
| GCP_DEPLOY_SERVICE_ACCOUNT | Deployment service-account email |
| GCP_RUNTIME_SERVICE_ACCOUNT | Runtime service-account email |

The current workflow uses checked-in nonsecret values instead of these variables; no enable variable is required. This table documents the equivalent configurable values.

## 4. Deploy and verify

Run the workflow from Actions on main. CI must pass before the deploy job starts. After the first successful deployment, an administrator grants public access to this static frontend if permitted by organization policy. Check the service URL, /health, root HTML, CSS/JS asset requests, mobile layout and keyboard interactions. A successful build alone is not a verified deployment.

The initial maximum of three instances reduces potential scaling but is not a hard cost cap. Artifact storage and other services can incur costs independently.

## 5. Rollback

Cloud Run keeps revisions. Inspect revision traffic and route traffic back to a known-good revision from the Cloud Run console if necessary. Keep the previous image available. Each deployment image is tagged with the GitHub commit SHA.

## Official references

- https://docs.cloud.google.com/resource-manager/docs/creating-managing-projects
- https://cloud.google.com/run/pricing
- https://cloud.google.com/artifact-registry/pricing
- https://github.com/google-github-actions/auth
- https://docs.cloud.google.com/run/docs/authenticating/public
