# User data, voice, LLMs and analytics: proposed strategy

## Requirements to remember

- Google sign-in and local document selection/preview are the current milestone.
- Future: LLM-guided form interpretation and structured tool calling.
- Future: voice input, document read-aloud, and natural-language translation. Keep original form wording available; confirm translations and speech transcripts before applying sensitive answers.
- Future: our own product analytics and evaluation/model development.

## Database is different from a model dataset

Firebase Authentication / Identity Platform manages identities and stable UIDs. Users sign in with their own Google accounts; the app's project belongs to the developer. Firebase browser configuration identifies the project and is public configuration, not user authorization. Future APIs must verify Firebase ID tokens and resource ownership on every request.

Firestore is the proposed initial operational database: small user records, preferences, consent choices, document-session metadata and export entitlement records. It offers managed scaling and integrates with authentication. Model access patterns and read/write costs before committing to schema or indexes. Use transactions and a server-verified payment ledger for entitlements. Consider Cloud SQL/PostgreSQL if billing relationships, reporting joins or transactional complexity become dominant. No database has been created for this milestone.

Private Cloud Storage is for consented document objects and, only where needed, transient audio. Do not store PDF bytes in Firestore. Do not retain raw audio by default; voice playback does not itself require a permanent audio archive. Time-limited access and deletion controls must be enforced in code and storage policies. Revisions, soft-delete settings and backups affect actual deletion/retention.

BigQuery is for an allowlisted event stream and analytical datasets, not login/session authorization. Start with coarse events such as file_selected (type and size bucket only), preview_ready, guided_step_completed and export_completed. Avoid filenames, extracted text, answers, signatures, tokens, raw audio and prompts. An opaque user ID is pseudonymous, not automatically anonymous; restrict joins and retention. Define applicable notice/consent before collecting events.

## LLM context and training

Ordinary inference can use an approved document excerpt without creating a training dataset or vector database. Sending a document to the LLM does not authorize retaining it for our research or training. Review actual provider/region retention and logging settings.

Start evaluation with synthetic forms, fabricated answers, and appropriately licensed examples. A separate, explicit opt-in is required before using customer content for model development; keep provenance, permitted purposes, consent revision, review/redaction status and deletion handling. A training corpus must not be the raw production user database. Build evaluation quality before fine-tuning.

## Suggested minimal records (not implemented)

- users/{uid}: createdAt, accessibility preferences, preferred locale. Authentication already holds identity details; avoid duplicate profile information without a purpose.
- consentRecords: uid, purpose, document revision/scope, policy version, grant/revocation timestamps.
- documentSessions: uid, status, timestamps, retention expiry and optional consented storage reference. No filename or answer text by default.
- exportEntitlements: uid, document revision identifier, paid-page count, verified transaction reference and entitlement status. Exact unique-document semantics still require a decision.
- analytics events: event type, coarse timestamp, app version, duration/size buckets; actor linkage only when justified.

Define retention, erasure, access control, auditability and regional requirements before provisioning stores. Separate development and production identities/data as the product matures. No user-content collection for training or analytics is enabled by this document.

## Official references

- https://firebase.google.com/docs/projects/api-keys
- https://firebase.google.com/docs/firestore
- https://cloud.google.com/storage/docs/access-control
- https://docs.cloud.google.com/bigquery/docs/query-overview
