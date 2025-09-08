import { headers } from "next/headers"
import { auth } from "./auth"
import { cache } from "react";

/**
 * Retrieves the server session using the authentication API.
 * This function is cached to prevent redundant calls.
 * @returns {Promise<Session | null>} A promise that resolves to the server session or null if not found.
 */
export const getServerSession = cache(async () => {
  return await auth.api.getSession({ headers: await headers() });
})

/**
 * Retrieves the Atlassian access token for the current user session.
 * This function is cached to prevent redundant calls.
 * @returns {Promise<string | null>} A promise that resolves to the Atlassian access token or null if not found.
 */
export const getAtlassianAccessToken = cache(async () => {
  const session = await getServerSession();

  if (!session) return null;

  return await auth.api.getAccessToken({
    body: {
      providerId: 'atlassian',
      userId: session.user.id
    }
  })
})
