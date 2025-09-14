import { getAtlassianAccessToken } from "@/lib/get-server-access-token";
import type { AtlassianResourceResponse, AtlassianResourceWithProjects, BulkFetchJiraIssuesResponse, JiraProjectsPaginatedResponse, JiraSearchResponse } from "../types";
import { tryCatch } from "@/lib/try-catch";
import { syncAtlassianDataWithDB } from "../atlassian-resource-sync/db-sync";


interface JiraRequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
}

interface MakeJiraRequestArgs {
  cloudId: string,
  endpoint: string,
  options: JiraRequestOptions
}

class JiraClient {
  private static readonly ACCESSIBLE_RESOURCE_ENDPOINT = 'https://api.atlassian.com/oauth/token/accessible-resources';
  private static readonly JIRA_CLOUD_ENDPOINT = 'https://api.atlassian.com/ex/jira/<cloudId>/rest/api/3<endpoint>';
  private static readonly JIRA_PROJECT_DEFAULT_EXPAND = 'description,issueTypes';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async makeRequest<T = any>(args: MakeJiraRequestArgs) {
    return tryCatch(
      (async () => {
        const token = await getAtlassianAccessToken();
        if (!token)
          throw new Error("No Session or Atlassian access token available");

        let url = JiraClient.JIRA_CLOUD_ENDPOINT.replace('<cloudId>', args.cloudId).replace('<endpoint>', args.endpoint);

        if (args.options.params) {
          const params = new URLSearchParams();
          Object.entries(args.options.params).forEach(([key, value]) => {
            params.append(key, String(value));
          });
          url += `?${params.toString()}`;
        }

        console.log("body : ", JSON.stringify(args.options.body))

        const res = await fetch(url, {
          method: args.options.method,
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
            ...args.options.headers,
          },
          ...(args.options.body && { body: JSON.stringify(args.options.body) }),
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
    const payload: MakeJiraRequestArgs = {
      cloudId: cloudId,
      endpoint: "/project/search",
      options: { method: "GET", params: { expand: JiraClient.JIRA_PROJECT_DEFAULT_EXPAND } }
    }
    return this.makeRequest<JiraProjectsPaginatedResponse>(payload);
  }

  public async getAtlassianResourceWithProjects() {
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

  public async searchJiraIssues(cloudId: string, jql: string, fields: string[] = ["summary", "issuetype", "description"], maxResults: number = 10) {
    const payload: MakeJiraRequestArgs = {
      cloudId,
      endpoint: "/search",
      options: {
        method: "POST",
        body: {
          jql,
          fields,
          maxResults
        }
      }
    }
    return this.makeRequest<JiraSearchResponse>(payload);
  }

  public async bulkFetchJiraIssues(cloudId: string, issueKeys: string[], fields: string[] = ["summary", "issuetype", "description", "attachment"]) {
    const payload: MakeJiraRequestArgs = {
      cloudId,
      endpoint: "/issue/bulkfetch",
      options: {
        method: "POST",
        body: {
          issueIdsOrKeys: issueKeys,
          fields
        }
      }
    }
    return this.makeRequest<BulkFetchJiraIssuesResponse>(payload);
  }

  public async syncAtlassianResourceAndJiraProjects() {
    return tryCatch(
      (async () => {
        const apiData = await this.getAtlassianResourceWithProjects();
        if (apiData.error)
          throw apiData.error;

        return syncAtlassianDataWithDB(apiData.data);
      })()
    );
  }
}

// Export singleton instance
export const jiraClient = new JiraClient();
