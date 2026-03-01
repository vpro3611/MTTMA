## OrgProject – Organizations, Members, Tasks & Audit

OrgProject is a full‑stack application for managing **organizations**, their **members**, **tasks**, and **invitations**, with a full **audit trail** of important actions.  
It consists of:

- **Backend**: Node.js + TypeScript + Express + PostgreSQL
- **Frontend**: Vue 3 + TypeScript (Vite SPA)
- **Infrastructure**: Docker Compose for db/backend/frontend

The system is designed around clear domain modules (users, organizations, members, tasks, invitations, audit events) and enforces validation, authentication, and transactional consistency.

---

## Application Overview – How It Works

- **Authentication & Users**
  - Users register and log in with email and password via `/pub/register` and `/pub/login`.
  - The backend issues **JWT access tokens** and **refresh tokens** using `AuthService` and `AuthController`.
  - Refresh tokens are stored as **http‑only cookies** and **hashed** in the database; they can be rotated via `/pub/refresh` and revoked via `/api/logout`.
  - The Vue frontend (`App.vue`) calls `authApi.refresh()` on startup to restore the session, then fetches the current user with `authApi.me()` and stores it in `authStore`.

- **Organizations & Membership**
  - Authenticated users can create organizations via `/org/create` and then manage them under `/org/...`.
  - Organizations have **members** with roles (e.g., owner, member). Membership APIs live under `/org/:orgId/members...` and `/org/:orgId/role/:targetUserId`.
  - The frontend exposes these flows primarily through pages like `OrganizationsPage.vue`, `OrganizationsView.vue`, `MemberProfileView.vue`, `OrganizationInvitationsView.vue`, and `OrganizationAuditView.vue`.

- **Tasks**
  - Each organization can have multiple tasks, managed under `/org/:orgId/tasks...`.
  - Endpoints support listing, creating, updating (title, description, status), and deleting tasks:
    - `GET /org/:orgId/tasks` – list tasks for an organization
    - `POST /org/:orgId/tasks/create` – create a task
    - `PATCH /org/:orgId/tasks/:taskId/{title|description|status}` – update task fields
    - `DELETE /org/:orgId/tasks/:orgTaskId` – delete a task
  - The frontend uses typed APIs (e.g. `task_types.ts`) and pages like `TaskView.vue` to present and edit tasks.

- **Invitations**
  - Organization members with appropriate permissions can send invitations via:
    - `POST /org/:orgId/invite/:invitedUserId`
  - Users can view their invitations with:
    - `GET /api/invitations` and `GET /api/invitations/:invId/view`
  - They can accept or reject them via:
    - `PATCH /api/:invitationId/accept`
    - `PATCH /api/:invitationId/reject`
  - Organization‑scoped invitation views live under:
    - `GET /org/:orgId/invitations`
    - `GET /org/:orgId/invitations/:invId/view`
  - Vue pages such as `MyInvitationsView.vue`, `InvitationView.vue`, and `OrganizationInvitationsView.vue` surface these flows.

- **Audit Log**
  - Important actions (creating organizations, changing roles, creating/changing/deleting tasks, handling invitations, etc.) are recorded as **audit events** in PostgreSQL.
  - The audit module exposes endpoints like:
    - `GET /org/:orgId/audit_events/all`
    - `GET /org/:orgId/audit_events/filtered`
  - `OrganizationAuditView.vue` consumes these endpoints to let users inspect the history of changes and filter audit events.

- **Background Jobs (Cron)**
  - On startup (`src/index.ts`), the app creates a `RunCron` instance that schedules a job every 10 minutes:
    - `RunCron` → `JobRunner` → `ScanForExpiredPG` → `scanExpiredInvitations()`
  - This job runs inside a database transaction and **cleans up expired invitations**.

---

## Backend (Node.js + TypeScript + Express)

The backend code lives under `src/` and is organized by domain modules.

- **Entry Point & Server Bootstrapping**
  - `src/index.ts`:
    - Loads environment variables via `dotenv`.
    - Instantiates a PostgreSQL transaction manager (`TransactionManagerPg`) and cron job runner (`RunCron`).
    - Starts the Express server by calling `startServer()`.
  - `src/server.ts`:
    - Calls `assembleContainer()` (dependency wiring) and then `createApp(dependencies)`.
    - Binds the Express app to `PORT` (default `3000`).

- **Dependency Injection Container**
  - `src/container.ts` assembles all core services:
    - **Repositories**: `UserRepositoryPG`, `OrganizationRepositoryPG`, `OrganizationTasksRepositoryPG`, `OrganizationMemberRepositoryPG`, `AuditEventsRepositoryPg`, invitation repositories, etc.
    - **Use cases & services**: user registration/login, password and email changes, organization CRUD, member hire/fire/role changes, task lifecycle, audit queries, invitation flows.
    - **Auth components**: `RefreshTokensRepository`, `JWTTokenService`, `AuthService`, `AuthController`.
  - This wiring gives each controller the concrete dependencies it needs without hard‑coding infrastructure inside controllers.

- **Express App & Routing**
  - `src/app.ts` configures:
    - **Middleware**:
      - `loggerMiddleware` – request logging.
      - `cors` – restricted to known frontend and backend hosts.
      - `express.json` / `express.urlencoded` – body parsing.
      - `cookieParser` – cookie parsing (for refresh tokens).
      - `validateZodMiddleware`, `validate_params`, and `validateQuery` – input validation via `zod`.
      - `errorMiddleware` – centralized error handling.
    - **Routers**:
      - `publicRouter` mounted at `/pub` – unauthenticated endpoints (register, login, refresh).
      - `privateRouter` mounted at `/api` – authenticated user‑scoped endpoints (logout, profile, membership checks, user lists, personal invitations).
      - `organizationRouter` mounted at `/org` – authenticated organization‑scoped endpoints (organizations, members, tasks, invitations, audit).
    - **Authentication**:
      - `createAuthMiddleware` wraps `privateRouter` and `organizationRouter`, enforcing JWT access token validation on those routes.

- **Domain Modules**
  - `modules/user` – user entity, registration/login use cases, profile checks, password/email change flows, and read‑only user querying.
  - `modules/organization` – organization creation, rename, delete, view, search, and “my organizations” queries, including role‑aware views.
  - `modules/organization_members` – membership management (hire, fire, change role), membership checks, and listing members or organizations with roles.
  - `modules/organization_task` – CRUD for organization tasks plus reader repositories for listing and finding tasks by id.
  - `modules/invitations` – invitation creation, cancellation, retrieval, and user/organization‑level views.
  - `modules/audit_events` – append‑only audit logging and queries, including filtered views.
  - `modules/transaction_manager` – abstraction around PostgreSQL transactions (`runInTransaction`) used by many services and jobs.
  - `modules/cron_manager` – cron orchestration and job repository for scanning expired invitations.

- **Authentication Implementation Details**
  - `Auth/auth_service/auth_service.ts`:
    - Generates JWT access and refresh tokens.
    - Hashes refresh tokens with `sha256` before persisting them.
    - Uses transactional flows for register/login so user creation and refresh token creation are atomic.
    - Supports `refresh` (rotate refresh tokens and issue new access tokens) and `logout` (revoke refresh tokens by hash).
  - `Auth/auth_controller/auth_controller.ts`:
    - HTTP handlers for `register`, `login`, `refresh`, `logout`.
    - Uses `zod` schemas to validate payloads and sets `httpOnly` cookies for refresh tokens.

---

## Database Schema

The PostgreSQL database is created and evolved using `node-pg-migrate` migrations in the `migrations/` folder. The core tables and relationships are:

- **`users`**

  | Column          | Type          | Notes                                 |
  |-----------------|---------------|----------------------------------------|
  | `id`            | `uuid`        | Primary key                            |
  | `email`         | `text`        | Unique, not null                       |
  | `password_hash` | `text`        | Hashed user password                   |
  | `status`        | `user_status` | Enum: `active`, `banned`, `suspended` |
  | `created_at`    | `timestamp`   | Creation timestamp                     |

- **`organizations`**

  | Column       | Type        | Notes             |
  |--------------|-------------|-------------------|
  | `id`         | `uuid`      | Primary key       |
  | `name`       | `text`      | Unique, not null  |
  | `created_at` | `timestamp` | Creation time     |

- **`organization_members`**

  | Column           | Type               | Notes                                                 |
  |------------------|--------------------|--------------------------------------------------------|
  | `organization_id`| `uuid`             | PK part, FK → `organizations(id)` (cascade on delete) |
  | `user_id`        | `uuid`             | PK part, FK → `users(id)` (cascade on delete)         |
  | `role`           | `organization_role`| Enum: `OWNER`, `ADMIN`, `MEMBER`                      |
  | `joined_at`      | `timestamp`        | When the user joined the organization                 |

- **`tasks`**

  | Column           | Type         | Notes                                                           |
  |------------------|--------------|------------------------------------------------------------------|
  | `id`             | `uuid`       | Primary key                                                      |
  | `organization_id`| `uuid`       | FK → `organizations(id)`, cascade on delete                      |
  | `title`          | `text`       | Not null                                                         |
  | `description`    | `text`       | Optional                                                         |
  | `status`         | `task_status`| Enum: `TODO`, `COMPLETED`, `CANCELED`, `IN_PROGRESS`            |
  | `assigned_to`    | `uuid`       | Optional FK → `users(id)`                                       |
  | `created_by`     | `uuid`       | FK → `users(id)`, user who created the task                     |
  | `created_at`     | `timestamp`  | Creation timestamp                                               |

- **`audit_events`**

  | Column           | Type        | Notes                                                             |
  |------------------|-------------|--------------------------------------------------------------------|
  | `id`             | `uuid`      | Primary key                                                        |
  | `actor_user_id`  | `uuid`      | Optional FK → `users(id)`                                         |
  | `organization_id`| `uuid`      | Optional FK → `organizations(id)`, cascade on delete              |
  | `action`         | `text`      | Human‑readable description of the action                          |
  | `created_at`     | `timestamp` | When the audit event was recorded                                 |

- **`refresh_tokens`**

  | Column       | Type        | Notes                                              |
  |--------------|-------------|-----------------------------------------------------|
  | `id`         | `uuid`      | Primary key                                        |
  | `user_id`    | `uuid`      | FK → `users(id)`, cascade on delete               |
  | `token_hash` | `text`      | SHA‑256 hash of the refresh token                 |
  | `expires_at` | `timestamp` | Expiry timestamp                                   |
  | `revoked_at` | `timestamp` | When the token was revoked (nullable)             |
  | `created_at` | `timestamp` | Creation timestamp (default `NOW()`)              |

- **`organization_invitations`**

  | Column              | Type         | Notes                                                                                 |
  |---------------------|--------------|----------------------------------------------------------------------------------------|
  | `id`                | `uuid`       | Primary key                                                                            |
  | `organization_id`   | `uuid`       | FK → `organizations(id)`, cascade on delete                                           |
  | `invited_user_id`   | `uuid`       | FK → `users(id)` (user being invited)                                                 |
  | `invited_by_user_id`| `uuid`       | FK → `users(id)`, inviter, `ON DELETE RESTRICT`                                       |
  | `role`              | `varchar(50)`| Role to grant on acceptance (e.g. `MEMBER`, `ADMIN`)                                  |
  | `status`            | `varchar(20)`| `PENDING`, `ACCEPTED`, `REJECTED`, `EXPIRED`, `CANCELLED`                             |
  | `created_at`        | `timestamp`  | When the invitation was created                                                       |
  | `expires_at`        | `timestamp`  | When the invitation automatically expires                                             |

  There is also a unique partial index on `(organization_id, invited_user_id)` for `status = 'PENDING'` to prevent duplicate active invitations.

---

## Frontend (Vue 3 + TypeScript + Vite)

The frontend application lives under `frontend/` and is a single‑page app built with Vue 3 and Vue Router.

- **Entry Point**
  - `frontend/src/main.ts`:
    - Imports global styles and the root `App.vue`.
    - Installs `router` and mounts the app to `#app`.
  - `frontend/src/App.vue`:
    - On mount, initializes the theme (`themeStore.init()`).
    - Calls `authApi.refresh()` and `authApi.me()` to bootstrap authentication state.
    - Stores the authenticated user in `authStore` or clears tokens if refresh fails.
    - Renders the current route via `<router-view />`.

- **Routing & Pages**
  - The router (in `frontend/src/router`) maps paths to pages such as:
    - `AuthPage.vue` – login and registration UI (`Login.vue`, `Register.vue` components).
    - `Dashboard.vue` – main entry after login, providing quick navigation to profile, users, organizations, search, invitations.
    - `OrganizationsPage.vue` – “My Organizations,” including creation and navigation to a specific organization view.
    - `OrganizationsView.vue`, `PublicOrganizationView.vue` – detailed organization views.
    - `TaskView.vue` – viewing and editing tasks.
    - `MyInvitationsView.vue`, `InvitationView.vue`, `InvitationFullView.vue`, `OrganizationInvitationsView.vue` – invitation management.
    - `OrganizationAuditView.vue` – audit log visualization.
    - `Profile.vue`, `MemberProfileView.vue`, `UserList.vue` – user and member details.

- **API Configuration & Types**
  - `frontend/src/config.ts`:
    - Exposes `UrlConfig.apiBaseUrl` derived from `VITE_API_BASE_URL`.
    - API modules (e.g. `authApi`, `organizationsAPI`) use this base URL and typically send credentials (cookies) with requests.
  - `frontend/src/types`:
    - Defines TypeScript interfaces like `OrganizationType` and `TaskType` to type API responses and component props.

- **State Management**
  - Lightweight custom stores (e.g. `auth_store.ts`, `theme_store.ts`) manage cross‑cutting state.
  - `authStore` holds the current user, access token, and bootstrapping flag so components can react once auth is initialized.

- **UI/UX**
  - The UI uses a modern, card‑based layout with responsive sections.
  - Pages emphasize clear calls to action (e.g. “Create organization”, “View invitations”), and errors are surfaced using helpers like `errorMessage`.

---

## Docker & docker-compose

The project includes a ready‑to‑run Docker Compose setup in `docker-compose.yml` that orchestrates the **database**, **backend**, and **frontend**.

- **Services**
  - **`db`** (PostgreSQL)
    - Image: `postgres:16-alpine`
    - Exposes port `5433` on the host mapped to `5432` in the container.
    - Environment:
      - `POSTGRES_USER: org_user`
      - `POSTGRES_PASSWORD: org_password`
      - `POSTGRES_DB: org_db`
    - Persists data using a named volume `db_data`.
  - **`backend`**
    - Build:
      - `context: .` (project root)
      - `dockerfile: Dockerfile.backend`
    - Exposes port `3000:3000`.
    - Depends on `db`.
    - Environment:
      - `NODE_ENV: production`
      - `PORT: 3000`
      - `DATABASE_URL`, `TEST_DATABASE_URL` (defaults point to the `db` service but can be overridden)
      - `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` used by JWT token service (must be provided via environment)
    - Command: `node dist/index.js` (expects the TypeScript code compiled to `dist/`).
  - **`frontend`**
    - Build:
      - `context: .`
      - `dockerfile: frontend/Dockerfile.frontend`
      - `args`:
        - `VITE_API_BASE_URL: http://localhost:3000`
    - Exposes port `5173:80` (frontend served via a web server such as nginx).
    - Depends on `backend`.

- **Running with Docker**
  - Build and start all services:

    ```bash
    docker-compose up --build
    ```

  - After startup:
    - Backend API is available at `http://localhost:3000`.
    - Frontend SPA is available at `http://localhost:5173`.
    - PostgreSQL is accessible on `localhost:5433`.

- **Configuration Notes**
  - For production deployments you should:
    - Provide **secrets only via environment variables** (for example using a `.env` file and `docker compose --env-file .env up`), not committed to version control.
    - Set at minimum `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, and optionally override `DATABASE_URL` / `TEST_DATABASE_URL`.
    - Adjust `VITE_API_BASE_URL` build arg to point to your deployed backend URL.

  - Example `.env` for local Docker:

    ```bash
    ACCESS_TOKEN_SECRET=replace_with_strong_random_string
    REFRESH_TOKEN_SECRET=replace_with_strong_random_string
    DATABASE_URL=postgres://org_user:org_password@db:5432/org_db
    TEST_DATABASE_URL=postgres://org_user:org_password@db:5432/org_db
    ```

---

## Strengths

- **Clear domain modularization**
  - Backend is split into focused modules (`user`, `organization`, `organization_members`, `organization_task`, `invitations`, `audit_events`, `cron_manager`), making the codebase easier to navigate and reason about.

- **Type‑safe, validated API**
  - Written in TypeScript end‑to‑end (backend and frontend).
  - Request payloads and route parameters are validated with `zod`, reducing runtime errors and enforcing contracts.

- **Robust authentication & session model**
  - JWT access and refresh tokens with **hashed refresh tokens** in the database.
  - `httpOnly` cookies for refresh tokens provide better protection against XSS.
  - Automatic session refresh and bootstrap on the frontend through `authApi.refresh()` and `authStore`.

- **Transactional consistency**
  - Critical flows (register, login, invitation cleanup, many domain use cases) run within `TransactionManagerPg.runInTransaction`, ensuring data integrity across multiple repository calls.

- **Auditing & observability**
  - Most important actions generate audit events that can be queried and filtered.
  - Logger middleware and centralized error handling make troubleshooting easier.

- **Dockerized, reproducible environment**
  - `docker-compose.yml` provides a single command to bring up database, backend, and frontend with sensible defaults.

---

## Weaknesses & Potential Improvements

- **CORS configuration**
  - Allowed origins are hard‑coded in `src/app.ts` (`localhost` and internal docker hosts).
  - **Improvement**: make CORS configuration environment‑driven to simplify deployment in multiple environments.

- **Limited documentation for API contracts**
  - While routes and schemas exist in code, there is no generated OpenAPI/Swagger documentation.
  - **Improvement**: add an OpenAPI spec or Swagger UI so clients can discover endpoints and payloads more easily.

- **Error handling UX on the frontend**
  - Errors are surfaced, but some flows may only show generic messages.
  - **Improvement**: unify API error shapes and present more contextual feedback in the UI.


---

## Running Locally (Without Docker)

- **Backend**
  - Install dependencies and compile:

    ```bash
    npm install
    npm run build
    ```

  - Ensure PostgreSQL is running and `DATABASE_URL` is set (matching your local db).
  - Run migrations:

    ```bash
    npm run migrate
    ```

  - Start in dev mode:

    ```bash
    npm run dev
    ```

  - Run tests (Jest):

    ```bash
    # All tests (default jest config)
    npm test

    # Domain / unit tests
    npm run test:dom

    # Application / use‑case tests
    npm run test:app

    # Integration tests (hitting the DB / HTTP)
    npm run test:int

    # CI‑friendly (sequential) run
    npm run test:ci
    ```

- **Frontend**
  - From the `frontend/` directory:

    ```bash
    cd frontend
    npm install
    npm run dev
    ```

  - By default Vite serves the frontend at `http://localhost:5173` and expects the API at `VITE_API_BASE_URL` (configured in `.env` or via Docker build args).

