# Testing and code quality

## Run locally

- `npm run dev -- --host 127.0.0.1 --port 5174`: interactive app.
- `npm test`: file-validation unit tests and React authentication-flow tests.
- `npm run format:check`: consistent readable formatting.
- `npm run lint`: React and JavaScript checks.
- `npm run build`: production frontend.
- `npx playwright install chromium`: one-time browser install.
- `npm run test:e2e`: browser checks against the production build, served automatically on port 4175. Run the build first.

Browser tests cover desktop and a mobile viewport using Chromium: image decoding, real two-page PDF rendering and readable text, page navigation, spoofed/damaged files, retry, removal, repeated selection and reload clearing. Fixtures are synthetic. A mobile viewport is not a real-device Safari test.

React tests mock only the authentication service and preview component. They exercise successful/cancelled/blocked/failed sign-in, duplicate-click protection, document preservation and sign-out clearing. These tests do not authenticate a real Google account or establish server authorization.

## Live Google sign-in setup

Firebase initialization was denied by the API for the current account. In https://console.firebase.google.com/ add Firebase to the existing form-assistant-better-life project, initialize Authentication and enable Google with a support email. Register a Web app and obtain the public Firebase configuration.

Populate `src/features/auth/firebase-config.json` with apiKey, authDomain, projectId and appId, or use the corresponding VITE_FIREBASE_* variables locally. Never include OAuth client secrets, service-account keys or access tokens. Vite variables are compiled into browser code, so only public Firebase configuration belongs there.

Authorized domains must include localhost, 127.0.0.1 and form-assistant-35hyxw4m3a-uc.a.run.app. Confirm a successful real sign-in, popup cancellation, session restoration, sign-out and document preservation manually before calling live authentication verified. User credentials are entered only on Google's page.

## CI and deployment

Pull requests run formatting, unit/component tests, lint, build, Playwright desktop/mobile tests, Docker build and container HTTP smoke checks. Browser traces/reports are uploaded on failure and expire after seven days. The deploy job depends on the check job, so a failing test prevents deployment. Production deployment runs only from main.

## Module boundaries

- `features/auth/firebase.js`: SDK configuration and identity-provider operations.
- `features/auth/useAuth.js`: auth-state subscription and cleanup.
- `features/auth/LoginCard.jsx`: account UI, loading and error states.
- `features/documents/validateFile.js`: file acceptance rules; independent of React.
- `features/documents/UploadCard.jsx`: selected-document lifecycle and account composition.
- `features/documents/DocumentPreview.jsx`: chooses the appropriate preview.
- `features/documents/PdfPreview.jsx`: lazy PDF.js loading, rendering and page text.
- `features/documents/ImagePreview.jsx`: local image URL lifecycle.

Files are held in page memory, not uploaded. Sign-in uses a popup to preserve selection. Refreshing clears the selection; successful sign-out clears it as well. Client checks are UX safeguards and must be repeated independently if server uploads are added.
