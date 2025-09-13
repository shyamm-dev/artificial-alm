import { headers } from "next/headers";
import { auth } from "./auth";
import { cache } from "react";

/**
 * Retrieves the server session using the authentication API.
 * This function is cached to prevent redundant calls.
 */
export const getServerSession = cache(async () => {
  return await auth.api.getSession({ headers: await headers() });
})

/**
 * Retrieves the server session using the authentication API.
 * This function is cached to prevent redundant calls.
 * For use in client components, wrap your component tree with `ServerSessionProvider`
 * and access the promise via `useServerSession` hook, then resolve with React's `use` hook.
 */
export const getServerSessionPromise = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
})
