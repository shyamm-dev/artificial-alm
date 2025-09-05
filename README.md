# Artificial AML v3

This is a Next.js project bootstrapped with `create-next-app`.

## Development Notes

### Server Actions

- **Server actions should only be used for mutations** (e.g., creating, updating, or deleting data).
- **Any action that fetches data must not use a server action.** Instead, fetch data directly in your components or use Route Handlers.

Using server actions for data fetching is discouraged because it issues an internal POST request. This has two major drawbacks:
1.  **Caching:** Data fetched through POST requests cannot be cached by Next.js's Data Cache.
2.  **Parallelism:** It breaks request parallelism. A new mutation, when triggered, has to wait until the previous data-fetching POST request completes.

### Data Access and Security

- **Centralize Data Operations:** All third-party API calls and database interactions must be handled through a dedicated Data Access Layer (DAL), located in `/lib/data-access-layer`. This ensures a single source of truth for data fetching and mutations.
- **Session Verification:** Every method within the DAL must verify that a valid user session exists before proceeding with any operation.
- **Access Token Validation:** For routes or methods that interact with protected third-party APIs, the access token must be retrieved and validated before making the external request.
