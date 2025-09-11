import { headers } from "next/headers"
import { auth } from "./auth"
import { cache } from "react";

/**
 * Retrieves the server session using the authentication API.
 * This function is cached to prevent redundant calls.
 * @returns {Promise<Session | null>} A promise that resolves to the server session or null if not found.
 */
export const getServerSession = cache(async () => {
  // TODO: Check if its ok to navigate user to /login page if session dosen't exist
  return await auth.api.getSession({ headers: await headers() });
})
