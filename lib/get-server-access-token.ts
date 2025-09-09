import { cache } from "react";
import { auth } from "./auth";
import { getServerSession } from "./get-server-session";

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
