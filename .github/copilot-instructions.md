# ISPW Action Utilities - Copilot Instructions

## Project Overview
Shared utility library for ISPW (Integrated Source and Process for Workload) GitHub Actions. Provides common functions for interacting with CES (Common Enterprise Services) REST APIs, validating inputs, and managing HTTP requests to mainframe ISPW systems.

## Architecture & Components

### Core Module (`index.js`)
Single-file library exporting utility functions. Key responsibilities:
- **Input handling**: Parse and validate GitHub Action inputs and BuildParms objects
- **HTTP communication**: Axios-based POST requests with token/certificate authentication to CES
- **URL assembly**: Normalize CES URLs (strip `/compuware`, `/ispw`, trailing slashes)
- **Polling**: Long-running operations with timeout/interval (e.g., `pollSetStatus` for deployment tracking)
- **Security**: DOMPurify sanitization on all URLs before axios calls

### Set Status Constants
Deployment states: `Complete`, `Closed`, `Failed`, `Held`, `Released`, `Terminated`, `Waiting-Approval`, `Waiting-Lock`, `Deploy-Failed`

## Critical Patterns

### URL Normalization (`assembleRequestUrl`)
Always strips legacy suffixes from CES URLs:
```javascript
// Input: 'https://ces:48226/Compuware/ispw/'
// Output: 'https://ces:48226' + requestPath
```

### BuildParms Validation
Required fields vary by action. Use `validateBuildParms(buildParms, ['containerId', 'taskLevel'])` with custom field arrays. Logs specific missing input messages.

### Status Message Handling
CES responses contain `statusMsg` as string OR array. Always use `getStatusMessageToPrint(statusMsg)` to flatten to single string.

### HTTP Authentication
Two modes:
- Token auth: `getHttpPostPromise(url, token, body)`
- Certificate auth: `getHttpPostPromiseWithCert(url, cert, host, port, body)` with custom headers (`cpwr_hci_host`, `javax.servlet.request.X509Certificate`)

## Development Workflow

### Testing
```bash
npm run test      # Mocha + nyc coverage (excludes dist/, coverage/, test/)
npm run coverage  # Enforces 80% coverage on lines/branches/statements/functions
npm run check     # Full suite: lint + test + coverage
```

### Local Testing (Before Publishing)
1. `npm pack` → creates `.tgz` tarball
2. In consuming action: `npm install path/to/tarball.tgz`
3. **Never commit tarball paths to package.json**

### Publishing
1. Update version in `package.json`
2. `npm publish --access public` (runs `prepublishOnly` hook → lint/test/coverage)
3. Update consuming actions to new version

## Breaking Changes Policy
**Critical**: Never modify function signatures without updating ALL consuming GitHub actions. This library is used across multiple ISPW actions.

## Code Style
- ESLint with `@eslint/js` recommended config
- Mocha/Chai tests with `chai.assert` and `chai.expect`
- Nock for HTTP mocking
- JSDoc comments on all exported functions
- Google-style ESLint config (dev dependency)

## Dependencies
- **Production**: `axios` (HTTP), `dompurify` + `jsdom` (XSS prevention)
- **Test**: `nock` (HTTP mocking), `mocha`, `chai`, `nyc` (coverage)
- **Build**: `@vercel/ncc` (bundle for GitHub Actions)

## Common Pitfalls
- Set status polling requires handling `Waiting-Approval` with retry count logic (`approvalCount > 2`)
- `stringHasContent` checks null/undefined/empty - use for all string validation
- CES URLs are case-insensitive when checking for `/compuware` or `/ispw` suffixes
