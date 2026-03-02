# SyncChat.Client

SyncChat.Client is the Angular frontend application for SyncChat, a real-time chat platform designed with security, scalability, and clean architecture in mind.

The frontend integrates with SyncChat.Backend (.NET) using JWT-based authentication, refresh tokens, and optional Google login. All sensitive operations such as token issuance, validation, and identity linking are handled exclusively by the backend.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Angular 20 (standalone components) |
| Language | TypeScript (strict mode) |
| Styling | SCSS + Tailwind CSS 4 + Angular Material |
| Real-time | SignalR (`@microsoft/signalr`) |
| Authentication | JWT + Refresh Token + Google Identity Services (GIS) |
| Animations | Lottie (`ngx-lottie`) |
| Reactivity | RxJS + Angular Signals |
| Testing | Karma + Jasmine |
| Dev Proxy | Angular Proxy (local development) |

---

## Project Architecture

The project follows a **layered, feature-based architecture** using Angular standalone components (no NgModules).

```
src/app/
 core/        # Singleton services, guards, interceptors, enums, models, constants, types
 features/    # Feature modules (auth, chat, settings)  lazy loaded
 pages/       # Standalone page components (home, not-found)
 shared/      # Reusable presentational components, pipes, directives
```

- `core/`  app-wide singletons. All services use `providedIn: 'root'`. Never lazy-loaded.
- `features/`  self-contained feature areas, each with their own `components/`, `models/`, and `services/`.
- `pages/`  top-level page components not tied to a feature.
- `shared/`  dumb components and utilities reusable across features.

---

## Folder Structure (Detailed)

```
src/
 app/
    core/
       constants/       # API routes, app route paths, UI constants
       enums/           # App-wide enums (ConversationType, HubMethods, UserStatus, etc.)
       guards/          # Functional route guards (authGuard, mobileOnlyGuard)
       interceptors/    # HTTP interceptors (auth, refresh-token, http-error)
       models/          # Core interfaces (DecodedToken, ChatNotification, etc.)
       services/        # Singleton services (AuthService, NotificationService, etc.)
       types/           # TypeScript utility types (JsonPatchDocument, ToasterType, etc.)
       utils/           # Shared utilities
    features/
       auth/            # Login, Register components + AuthHttpService
       chat/            # Full chat UI + ChatStateService (central state)
       settings/        # (placeholder)
    pages/
       home/
       not-found/
    shared/
        components/      # CustomToasterComponent, GoogleIconComponent
        directives/
        pipes/           # ChatTimestampPipe
 assets/
 environments/
 themes/
```

Every sub-folder exposes a barrel `index.ts` that re-exports all its members. Consumers use TypeScript path aliases:

- `@core/*`  `src/app/core/*`
- `@features/*`  `src/app/features/*`
- `@shared/*`  `src/app/shared/*`
- `@pages/*`  `src/app/pages/*`
- `@environments/*`  `src/environments/*`

---

## Routing

Routes are organized using exported `Routes` array constants spread into the root `routes`:

```ts
// app.routes.ts
export const routes: Routes = [
  ...FEATURE_ROUTES,
  ...PAGES_ROUTES
];
```

- **Feature routes** use `loadChildren` for child route bundles (lazy-loaded module-equivalent).
- **Page routes** use `loadComponent` for single standalone components.
- **Route path strings** are centralized in `core/constants/app-routes.ts`  never hardcoded inline.

```ts
// app-routes.ts
export const FEATURE_ROUTE_PATH = { Auth: 'auth', Chat: 'chat' };
export const AUTH_ROUTE_PATH    = { Login: 'login', Register: 'register' };
export const CHAT_ROUTE_PATH    = { List: 'list' };
```

---

## Component Conventions

| Convention | Detail |
|---|---|
| Change Detection | `OnPush` globally (set in `angular.json` schematics) |
| Standalone | All components are `standalone: true` (no NgModules) |
| Selector prefix | `chat` (e.g. `<chat-sidebar>`) |
| Styles | SCSS, one file per component |
| File suffix | `.component.ts` / `.component.html` / `.component.scss` |
| Nested components | Feature sub-components live under their parent folder (e.g. `chat-detail-panel/components/`) |

---

## Dependency Injection

The modern `inject()` function is preferred over constructor injection for most services:

```ts
private readonly _authService = inject(AuthService);
```

Constructor injection is used in a few older services (`ToasterService`, `UserStoreService`). New code should use `inject()`.

---

## State Management

The project uses a **hybrid reactive approach**:

### Angular Signals  synchronous UI state

`ChatStateService` is the central signal-based state store for the chat feature:

- `conversations`  `WritableSignal<Map<number, Conversation>>`
- `selectedConversationId`  `WritableSignal<number | null>`
- `messagesLoading`  `WritableSignal<Map<number, boolean>>`
- `selectedChatTypingIndicators`  `WritableSignal<Set<number>>`
- `chatDetailPanelOpen`, `chatListPanelOpen`, `chatListPanelPinned`
- **Computed**: `conversationList`, `selectedConversation`, `isSelectedConversationTyping`

The `Conversation` domain model itself has `WritableSignal` fields for `messages` and `olderMessageLoading`.

### RxJS  async streams

- `BehaviorSubject` for auth state (`isAuthenticated$`) and user store.
- `Subject` for SignalR event bus in `NotificationService`.
- `rxResource` in `UserStateService` for auto-fetching reactive data.

---

## HTTP & API Patterns

### API Routes

All endpoints are defined as typed `const` objects in `core/constants/api-routes.ts`:

```ts
export const API_ROUTES = {
  Auth: {
    Login: `${BASE_URL}/auth/login` as const,
    Refresh: `${BASE_URL}/auth/refresh` as const,
    // ...
  },
  Conversation: { ... },
  Message: { ... },
};
```

### Feature HTTP Services

Each feature has its own HTTP service(s) (`AuthHttpService`, `ConversationService`, `MessageService`, `UserService`, etc.) that return typed `Observable<T>`.

### Interceptors (functional `HttpInterceptorFn`)

| Interceptor | Role |
|---|---|
| `authInterceptor` | Attaches `Authorization: Bearer <token>` header |
| `refreshTokenInterceptor` | Handles 401  refresh flow with concurrent request queuing |
| `httpErrorInterceptor` | Delegates all HTTP errors to `ErrorHandlerService` |

---

## Real-Time Communication  SignalR

`NotificationService` wraps the SignalR `HubConnection`:

- Uses Angular **signals** for `_isConnected` and `_joinedGroups`.
- All server-sent events flow through a typed `Subject<ChatNotification<T>>`.
- `.listen<T>(eventType)` returns a filtered observable for a specific event type.
- `ChatStateService.onInitialize()` subscribes to: `HasNewMessage`, `NewConversationCreated`, `NewMemberAdded`, `AddedToConversation`, `RemovedFromConversation`, `MemberRemoved`, `MemberRoleChanged`, `MemberDemoted`.

---

## Model / DTO Pattern

| Layer | Naming | Purpose |
|---|---|---|
| API response | `*DTO` (e.g. `MessageDTO`) | Raw API shape |
| Domain | plain name (e.g. `Message`) | App-internal model, may include signals |
| Request | `*Request` (e.g. `SendMessageRequest`) | Typed request bodies |
| Response | `*Response` (e.g. `GetMessagesResponse`) | Typed response wrappers |

Mapper utilities convert DTOs to domain models (e.g. `MessageMapper.fromDTO(dto)`), including JSON parsing of `metaData` fields.

---

## Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Files | `kebab-case` with type suffix | `auth.service.ts`, `conversation-type.enum.ts` |
| Enums | `PascalCase`, `string` values preferred | `ConversationType.Direct = 'direct'` |
| Interfaces / Models | `PascalCase` with descriptive suffix | `DecodedToken`, `SendMessageRequest` |
| Constants objects | `UPPER_SNAKE_CASE` | `API_ROUTES`, `FEATURE_ROUTE_PATH`, `UI_CONSTANTS` |
| Guards / Interceptors | `camelCase` functional exports | `authGuard`, `authInterceptor` |
| Route arrays | `UPPER_SNAKE_CASE` | `AUTH_ROUTES`, `CHAT_ROUTES`, `PAGES_ROUTES` |
| Private members | `_` prefix | `_localStorageService`, `_isConnected`, `_emit()` |

---

## Environment Configuration

`Environment` is a typed interface (`environment.model.ts`):

```ts
export interface Environment {
  production: boolean;
  apiBaseUrl: string;
  notificationHubUrl: string;
  googleClientId: string;
}
```

| File | Purpose |
|---|---|
| `environment.ts` | Default / fallback (used for `ng serve`) |
| `environment.prod.ts` | Production (swapped via `fileReplacements` in `angular.json`) |
| `environment.dev.ts` | Local secrets  **not committed, git-ignored** |

Secrets must never be committed, even if technically "public".

---

## Proxy Configuration

During local development, the frontend and backend run on different ports, causing CORS issues and HTTP-only cookie restrictions. SyncChat.Client uses an Angular dev proxy to avoid this.

**`proxy.conf.json`**:

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

- `/api/*`  backend REST APIs
- `/hub/notifications/*`  SignalR hub (WebSocket)

No backend CORS configuration is required for local development.

---

## Authentication

SyncChat.Client does not generate or validate tokens. Supported login methods:

- **Username / Password** (local)
- **Google Login** (OAuth via Google Identity Services)

Google login flow (frontend perspective):

1. Initialize Google Identity Services
2. Receive Google ID token from GIS
3. Send token to backend (`/auth/googleAuth`)
4. Backend verifies and issues: Access Token (JWT) + Refresh Token (HTTP-only cookie)

The frontend never verifies Google tokens, generates JWTs, or reads refresh tokens.

Token refresh is handled automatically by `refreshTokenInterceptor` on any 401 response, with concurrent request queuing to prevent multiple simultaneous refresh calls.

---

## Running the Application Locally

**Prerequisites:**

- Node.js (LTS)
- Angular CLI
- SyncChat.Backend running on `https://localhost:5001`

**Steps:**

```bash
npm install
ng serve
```

Ensure:

- `src/environments/environment.dev.ts` exists with your `googleClientId`
- Proxy is enabled (`proxyConfig` in `angular.json`)
- Backend is running
