# Artificial AML v3

This project uses the following Tech stack and Libs,
Next.js + BetterAuth + Turso + Drizzle + Shadcn

## Development Notes

### Server Actions

- **Server actions should only be used for mutations** (e.g., creating, updating, or deleting data).
- **Any action that fetches data must not use a server action.** Instead, fetch data directly in your components or use Route Handlers.

Using server actions for data fetching is discouraged because it issues an internal POST request. This has two major drawbacks:
1.  **Caching:** Data fetched through POST requests cannot be cached by Next.js's Data Cache.
2.  **Parallelism:** It breaks request parallelism. A new mutation, when triggered, has to wait until the previous data-fetching POST request completes.

### Data Access and Security

- **Centralize Data Operations:** All third-party API calls and database interactions must be handled through a dedicated Data Access Layer (DAL), located in `/data-access-layer`. This ensures a single source of truth for data fetching and mutations.
- **Third-Party API Access:** All external API calls must go through the DAL - never call third-party APIs directly from components or other parts of the application.
- **Third-Party API Client Usage:** All third-party API calls must be made only through their respective DAL clients (e.g., `jiraClient` for Jira APIs). This applies to both React Server Components (RSC) and API routes. Never make direct fetch calls to third-party APIs.
- **Session Verification:** Every method within the DAL must verify that a valid user session exists before proceeding with any operation.
- **Access Token Validation:** For routes or methods that interact with protected third-party APIs, the access token must be retrieved and validated before making the external request.

### Local Database Development

To run a local database for development, you need to set the `TURSO_CONNECTION_URL` environment variable in your `.env.local` file:

```
TURSO_CONNECTION_URL=http://localhost:8080
```

Then, use Turso to start the local database:

```bash
turso dev --db-file local.db
```

This command starts a local Turso database using `local.db` as the file.

### Database Migrations

After making changes to your Drizzle schema (`db/schema.ts`), you need to:

1.  **Generate a new migration:**
    ```bash
    pnpm drizzle-kit generate:sqlite
    ```
    This command will create a new migration file in the `migrations` directory.

2.  **Apply the migration to your database:**
    ```bash
    pnpm drizzle-kit migrate
    ```
    This command applies the pending migrations to your `local.db` database.

### Viewing Drizzle Studio

To view your database schema and data using Drizzle Studio:

```bash
pnpm drizzle-kit studio
```
This command will open Drizzle Studio in your browser, allowing you to inspect your database.

### Database Schema Structure

#### Schema Files
- **Main Schema:** Define tables in `db/schema.ts`
- **Relations:** Write all table relations in `db/relations.ts`
- **New Schema Files:** For additional schema files, export them and add to `db/index.ts`

```typescript
// db/index.ts
export * from './schema'
export * from './relations'
export * from './new-schema-file'
```

#### Database Types
Infer types from your schema:

```typescript
import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { users } from './schema'

export type User = InferSelectModel<typeof users>
export type NewUser = InferInsertModel<typeof users>
```

### Query Structure

- **Simple Queries:** Use direct Drizzle queries in components
- **Complex Queries:** Create reusable query functions in `/lib/queries`
- **Mutations:** Handle through server actions with proper validation

### Validation

- **Input Validation:** Use Zod schemas for all form inputs and API endpoints
- **Database Validation:** Validate data before database operations
- **Type Safety:** Leverage TypeScript and Drizzle's type inference

### Session Management

- **Server:** Session is fetched on the server side
- **Client:** Session is passed through a provider and accessed in client components using the session hook
- **Authentication:** All protected routes and API calls must verify session validity
