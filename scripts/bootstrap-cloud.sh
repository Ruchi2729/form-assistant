#!/usr/bin/env bash
# One-time infrastructure setup. Requires a project administrator's gcloud session.
set -euo pipefail
PROJECT_ID=form-assistant-better-life
REGION=us-central1
REPOSITORY=form-assistant
DEPLOY_ACCOUNT="github-deploy@$PROJECT_ID.iam.gserviceaccount.com"
RUNTIME_ACCOUNT="frontend-runtime@$PROJECT_ID.iam.gserviceaccount.com"
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')

gcloud services enable run.googleapis.com artifactregistry.googleapis.com iam.googleapis.com iamcredentials.googleapis.com sts.googleapis.com --project="$PROJECT_ID" --quiet
if ! gcloud artifacts repositories describe "$REPOSITORY" --location="$REGION" --project="$PROJECT_ID" >/dev/null 2>&1; then
  gcloud artifacts repositories create "$REPOSITORY" --repository-format=docker --location="$REGION" --project="$PROJECT_ID" --description='Form Assistant frontend containers' --quiet
fi
for account in github-deploy frontend-runtime; do
  if ! gcloud iam service-accounts describe "$account@$PROJECT_ID.iam.gserviceaccount.com" --project="$PROJECT_ID" >/dev/null 2>&1; then
    gcloud iam service-accounts create "$account" --project="$PROJECT_ID" --display-name="$account" --quiet
  fi
done

gcloud artifacts repositories add-iam-policy-binding "$REPOSITORY" --location="$REGION" --project="$PROJECT_ID" --member="serviceAccount:$DEPLOY_ACCOUNT" --role=roles/artifactregistry.writer --quiet >/dev/null
gcloud projects add-iam-policy-binding "$PROJECT_ID" --member="serviceAccount:$DEPLOY_ACCOUNT" --role=roles/run.developer --condition=None --quiet >/dev/null
gcloud iam service-accounts add-iam-policy-binding "$RUNTIME_ACCOUNT" --project="$PROJECT_ID" --member="serviceAccount:$DEPLOY_ACCOUNT" --role=roles/iam.serviceAccountUser --quiet >/dev/null

if ! gcloud iam workload-identity-pools describe github-actions --location=global --project="$PROJECT_ID" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools create github-actions --location=global --project="$PROJECT_ID" --display-name='GitHub Actions' --quiet
fi
if ! gcloud iam workload-identity-pools providers describe github --workload-identity-pool=github-actions --location=global --project="$PROJECT_ID" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools providers create-oidc github --workload-identity-pool=github-actions --location=global --project="$PROJECT_ID" --issuer-uri=https://token.actions.githubusercontent.com --attribute-mapping='google.subject=assertion.sub,attribute.repository_id=assertion.repository_id' --attribute-condition="assertion.repository_id == '1439141132' && assertion.repository_owner_id == '20729220' && assertion.ref == 'refs/heads/main'" --quiet
fi
gcloud iam service-accounts add-iam-policy-binding "$DEPLOY_ACCOUNT" --project="$PROJECT_ID" --role=roles/iam.workloadIdentityUser --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions/attribute.repository_id/1439141132" --quiet >/dev/null
printf 'Project: %s\nRegion: %s\nProvider: projects/%s/locations/global/workloadIdentityPools/github-actions/providers/github\n' "$PROJECT_ID" "$REGION" "$PROJECT_NUMBER"
