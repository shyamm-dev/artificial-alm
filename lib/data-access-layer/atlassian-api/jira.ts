import { getAtlassianAccessToken } from "@/lib/get-server-secrets";
import type { JiraPaginatedProjectsResponse } from "./types";
import { Result, tryCatch } from "@/lib/utils/try-catch";

export interface JiraRequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"; // now required
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  body?: any;
}

/**
 * Makes a Jira API request and wraps result in Result<T, Error>.
 * Method must be explicitly provided.
 */
export async function makeJiraRequest<T = any>(cloudId: string, endpoint: string, options: JiraRequestOptions): Promise<Result<T>> {
  return tryCatch(
    (async () => {
      const token = await getAtlassianAccessToken();
      if (!token) throw new Error("No Atlassian access token available");

      let url = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3${endpoint}`;

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
          Authorization: `Bearer ${token}`,
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
 * Get paginated Jira projects using cloudId
 */
export async function getPaginatedProjects(cloudId: string, startAt = 0, maxResults = 50): Promise<Result<JiraPaginatedProjectsResponse>> {
  return makeJiraRequest<JiraPaginatedProjectsResponse>(
    cloudId,
    "/project/search",
    { method: "GET", params: { startAt, maxResults } }
  );
}
