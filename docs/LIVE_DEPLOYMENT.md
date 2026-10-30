# Prototype deployment

- URL: https://form-assistant-35hyxw4m3a-uc.a.run.app
- Project: form-assistant-better-life (313979383533)
- Region: us-central1
- Service: form-assistant
- GitHub: https://github.com/Ruchi2729/form-assistant
- Pipeline: pull requests run CI; main runs CI followed by Cloud Run deployment and public HTTP checks.
- Identity: repository-restricted Workload Identity Federation; no service-account key.
- Runtime: frontend-runtime service account, zero minimum instances, three maximum instances, 256 MiB RAM, one CPU. Instance limits do not cap total billing.
- Access: public invocation on this static frontend. Future backend access must enforce application authentication independently.
- Health route: /health. Cloud Run intercepts /healthz, so it is not used for public application health checks.

The current prototype is the frontend only. Google sign-in, document upload, agent/LLM integration, and payments are not connected.

To inspect revisions and roll back, use the Cloud Run console: https://console.cloud.google.com/run/detail/us-central1/form-assistant/revisions?project=form-assistant-better-life

Future pushes to main deploy automatically after checks pass. Development should use branches and pull requests. No browser-based accessibility or visual audit has been completed for this deployment.
