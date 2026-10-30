# Agentic Form Assistant: product and learning direction

## Core objective
Reduce the cognitive overload of complex paperwork using accessible tools and a guided, agentic experience. The product includes web and mobile apps. Inputs include PDFs and photos/scans; image-to-PDF conversion alone does not extract text or identify editable fields. Completing forms is free; download/print costs $0.50 per page, with repeat exports of the same entitled completed document included. Registered-user ambition: 1–2 million, subject to active-load and cost planning. No absolute safety guarantee.

## Responsibility boundaries
- LLM: explain field wording, interpret dependencies, suggest the next useful question, flag ambiguity and propose mappings from user-confirmed answers to known field IDs.
- Document tools: extract PDF fields, OCR photos, record page coordinates, preserve original text, render previews and write PDFs. OCR results require uncertainty handling and review.
- Application code: authentication, ownership, consent, state transitions, schema and semantic validation, payment verification, export entitlements, approval checks and PDF mutations.
- User: supplies facts, resolves ambiguity and approves external AI sharing, sensitive changes, signatures and final export. No autonomous submission.

## Architecture proposal, not implemented
React client → authenticated Node.js/TypeScript API on Cloud Run → bounded agent runner → model adapter (initial candidate: Gemini through Vertex AI) and allowlisted tools.

The client retains document bytes locally where feasible. The user previews and approves any outbound excerpt. Server validation enforces the approved scope; hidden fields, filenames, images and answer values are not automatically included. If consent is declined, local/manual completion remains available. Cloud model processing is external processing even within the same cloud provider.

Use service identity / Application Default Credentials for backend model access; never embed a service-account key or model secret in Vite/browser code. Select model, region, quotas, retention configuration and cost limits after reviewing current provider documentation and representative evaluations.

## Bounded agent loop
1. Extract known fields and source evidence; assign stable IDs independently of the LLM.
2. Establish an explicit workflow state and allowed next actions.
3. Send approved minimal context, permitted tools and response schema to the model.
4. Validate output schema, known field IDs, evidence references, ownership and permitted transition.
5. For a proposed tool call, application code decides whether to execute, reject or request approval. Models propose calls; they do not execute tools directly.
6. Return the tool result to the model only when another reasoning step is useful.
7. Render one actionable question, explanation or review item in accessible UI.
8. Stop on completion, missing consent, uncertainty, cancellation, or configured step/time/token budget. Offer manual recovery on provider failure.

Store factual answers and workflow progress in application state, separate from chat text. Do not send the entire conversation or PDF on every turn. Revalidate approval against the current document revision before acting.

Initial read/proposal tools: inspectFields, explainField, proposeNextQuestion, proposeAnswerMapping, proposeSignaturePlacement. Execution tools such as fillPdf and exportPdf require deterministic checks and appropriate user approval. The model receives no payment, arbitrary network, or submission tool.

## First LLM learning slice
Use a synthetic two-page form. Start with one endpoint that returns a plain-language explanation for a selected field and exactly one next question. Return structured data: fieldId, explanation, question, evidence references and needsClarification. Validate types, lengths, allowed field IDs and evidence against the supplied source. Schema conformity does not establish factual correctness.

Then introduce one tool: proposeAnswerMapping. The UI previews the proposed answer before code applies it. Expand to dependent questions, deferred fields and validation only after this slice is reliable. Do not begin with an unrestricted chat interface or multiple agents. Retrieval/vector storage and fine-tuning are not required for the initial single-document flow.

## Learning milestones
1. HTML/CSS/React: semantic login screen, responsive layout, state and accessibility.
2. Identity: real Google sign-in, sessions and server token verification.
3. Extraction: PDF fields and OCR, stable field IDs and evidence.
4. First model call: prompts, tokens, structured responses, provider adapter and error handling.
5. Tool calling: bounded runner, deterministic permissions and approval UI.
6. Evaluation: synthetic fixtures, source-grounded explanations, ambiguity, false assumptions, prompt injection, revoked consent and inaccessible/error states.
7. Operations: CI evaluation gates, model/prompt version tracking, latency/cost budgets, quotas, rollback and content-free operational telemetry.

## Quality criteria
Measure completion rate, corrections, perceived cognitive effort and trust alongside unsupported claims, invented answers, unauthorized actions, time to next question and cost per completed form. Include keyboard, screen-reader and varied cognitive-accessibility users. Assess model upgrades against the same dataset before rollout.

Treat all document content as untrusted data, including text that instructs the agent to ignore rules. Tool permissions and approval gates must hold even if the model follows malicious text. Prompt instructions alone do not provide that guarantee. Do not log raw forms, personal answers, signatures or model payloads by default.

## Official references
- https://ai.google.dev/gemini-api/docs/function-calling
- https://docs.cloud.google.com/vertex-ai/generative-ai/docs/multimodal/function-calling
- https://blog.google/security/mitigating-prompt-injection-attacks/
