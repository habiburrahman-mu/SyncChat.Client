# SyncChat.Client

SyncChat.Client is the Angular frontend application for SyncChat, a real-time chat platform designed with security, scalability, and clean architecture in mind.

The frontend integrates with SyncChat.Backend (.NET) using JWT-based authentication, refresh tokens, and optional Google login. All sensitive operations such as token issuance, validation, and identity linking are handled exclusively by the backend.

---

## Tech Stack

Angular 20

TypeScript

Google Identity Services (GIS)

JWT + Refresh Token authentication

SignalR (via backend)

Angular Proxy (local development)

Environment-based configuration

---

## Environment Configuration for Local Development

SyncChat follows a strict separation between source code and secrets.

For local development, sensitive configuration is stored in:

`src/environments/environment.dev.ts`

This file is intentionally NOT committed and git ignored.

Example content:

```tsx
export const environment = {
  production: false,
  apiBaseUrl: '/api',
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID'
};
```

Why this approach:

- Prevents accidental exposure of credentials
- Allows safe rotation of OAuth configuration
- Supports multiple environments cleanly
- Keeps the repository environment-agnostic

Environment file usage:

- environment.ts → default / fallback
- environment.prod.ts → production
- environment.dev.ts → local secrets (not committed, git ignored)

Secrets must never be committed, even if they are technically “public”.

---

## Angular Build and Serve Configuration

Angular treats build and serve as separate pipelines.

SyncChat.Client explicitly wires serve configurations to build configurations so the correct environment file is used.

Expected behavior:

- `ng serve` → development environment
- `ng build --configuration=production` → production environment

When adding new environment files, ensure both build and serve targets are updated in angular.json.

---

## Proxy Configuration (Why It Is Needed)

During local development, the frontend and backend run on different ports. This causes:

- CORS issues
- Problems with HTTP-only cookies
- SameSite / Secure cookie restrictions

To avoid these issues, SyncChat.Client uses an Angular proxy only for development.

---

### Proxy Configuration Example

proxy.conf.json

```json
{
  "/api": {
    "target": "https://localhost:5001",
    "secure": false,
    "changeOrigin": true
  },
  "/hub/notifications": {
    "target": "https://localhost:5001",
    "secure": false,
    "changeOrigin": true,
    "ws": true
  }
}
```

Enable the proxy in angular.json:

```json
"serve": {
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

With this setup:

- `/api/*` → backend REST APIs
- `/hub/notifications/*` → SignalR hubs

No backend CORS configuration is required for local development.

---

## Authentication (Frontend Responsibility)

SyncChat.Client does not generate or validate tokens.

Supported login methods:

- Username / Password (Local)
- Google Login (OAuth)

Google login flow (frontend perspective):

1. Initialize Google Identity Services
2. Receive Google ID token
3. Send the token to the backend
4. Backend verifies the token, links or creates the user, and issues:
    - Access Token (JWT)
    - Refresh Token (HTTP-only cookie)

The frontend never:

- Verifies Google tokens
- Generates JWTs
- Reads refresh tokens

---

## Running the Application Locally

Prerequisites:

- Node.js (LTS)
- Angular CLI
- SyncChat.Backend running on [https://localhost:5001](https://localhost:5001/)

Steps:

```bash
npm install
ng serve
```

Ensure:

- environment.dev.ts exists
- Proxy is enabled
- Backend is running
