import { getAtlassianAccessToken } from "@/lib/get-server-access-token";
import type { AtlassianResourceResponse, AtlassianResourceWithProjects, JiraProjectsPaginatedResponse } from "../types";
import { Failure, tryCatch } from "@/lib/try-catch";

export interface JiraRequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
}

export class JiraClient {
  private static readonly ACCESSIBLE_RESOURCE_ENDPOINT = 'https://api.atlassian.com/oauth/token/accessible-resources';
  private static readonly JIRA_CLOUD_ENDPOINT = 'https://api.atlassian.com/ex/jira/<cloudId>/rest/api/3<endpoint>';
  private static readonly JIRA_PROJECT_DEFAULT_EXPAND = 'description,issueTypes';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async makeRequest<T = any>(cloudId: string, endpoint: string, options: JiraRequestOptions) {
    return tryCatch(
      (async () => {
        const token = await getAtlassianAccessToken();
        if (!token) throw new Error("No Atlassian access token available");

        let url = JiraClient.JIRA_CLOUD_ENDPOINT.replace('<cloudId>', cloudId).replace('<endpoint>', endpoint);

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

  private async getAtlassianResources() {
    return tryCatch(
      (async () => {
        const token = await getAtlassianAccessToken();
        if (!token) throw new Error("No Atlassian access token available");

        const res = await fetch(JiraClient.ACCESSIBLE_RESOURCE_ENDPOINT, {
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

        return (await res.json()) as AtlassianResourceResponse;
      })()
    );
  }

  private async getPaginatedProjects(cloudId: string) {
    return this.makeRequest<JiraProjectsPaginatedResponse>(
      cloudId,
      "/project/search",
      { method: "GET", params: { expand: JiraClient.JIRA_PROJECT_DEFAULT_EXPAND } }
    );
  }

  public async getSyncedAtlassianResourceWithProjects() {
    return tryCatch(
      (async () => {
        const resourcesResult = await jiraClient.getAtlassianResources();
        if (resourcesResult.error)
          throw resourcesResult.error;

        const sitesWithProjects: AtlassianResourceWithProjects[] = await Promise.all(
          resourcesResult.data.map(async (site) => {
            const projectsResult = await jiraClient.getPaginatedProjects(site.id);
            if (projectsResult.error)
              throw projectsResult.error;

            return {
              ...site,
              projects: projectsResult.data?.values || [],
            };
          })
        );

        return sitesWithProjects;
      })()
    );
  }
}

// Export singleton instance
export const jiraClient = new JiraClient();
