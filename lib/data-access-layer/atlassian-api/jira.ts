import { getAtlassianAccessToken } from "@/lib/get-server-secrets";
import type { JiraAccessibleResourcesResponse, JiraPaginatedProjectsResponse } from "./types";
import { tryCatch } from "@/lib/try-catch";

export interface JiraRequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  body?: any;
}

const AccessibleResourceEndpoint = 'https://api.atlassian.com/oauth/token/accessible-resources';
const JiraCloudEndpoint = 'https://api.atlassian.com/ex/jira/<cloudId>/rest/api/3<endpoint>';

/**
 * Makes a Jira API request and wraps result in Result<T, Error>.
 * Method must be explicitly provided.
 */
export async function makeJiraRequest<T = any>(cloudId: string, endpoint: string, options: JiraRequestOptions) {
  return tryCatch(
    (async () => {
      const token = await getAtlassianAccessToken();
      if (!token) throw new Error("No Atlassian access token available");

      let url = JiraCloudEndpoint.replace('<cloudId>', cloudId).replace('<endpoint>', endpoint);

      if (options.params) {
        const params = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
          params.append(key, String(value));
        });
        url += `?${params.toString()}`;
      }

      const res = await fetch(url, {
        method: options.method,
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...(options.body && { body: JSON.stringify(options.body) }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Jira API request failed ${res.status}: ${text}`);
      }

      if (res.status === 204) return {} as T;
      return (await res.json()) as T;
    })()
  );
}

/**
 * Fetch all Jira accessible resources (sites) for the current user.
 */
export async function getAccessibleResources() {
  return tryCatch(
    (async () => {
      const token = await getAtlassianAccessToken();
      if (!token) throw new Error("No Atlassian access token available");

      const res = await fetch(AccessibleResourceEndpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          Accept: "application/json",
        }
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch accessible resources ${res.status}: ${text}`);
      }

      return (await res.json()) as JiraAccessibleResourcesResponse;
    })()
  );
}


/**
 * Get paginated Jira projects using cloudId
 */
export async function getPaginatedJiraProjects(cloudId: string) {
  return makeJiraRequest<JiraPaginatedProjectsResponse>(
    cloudId,
    "/project/search",
    { method: "GET", params: { expand: "description,lead,issueTypes,url,projectKeys,permissions,insight" } }
  );
}
