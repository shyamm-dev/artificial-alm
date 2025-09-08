// ----- User's resources

export interface JiraAccessibleResource {
  id: string; // cloudId
  name: string;
  url: string;
  scopes: string[];
  avatarUrl: string;
}

export type JiraAccessibleResourcesResponse = JiraAccessibleResource[];

// ----- Jira Projects

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  self: string;
  description?: string;
  avatarUrls: {
    "48x48": string;
    "24x24": string;
    "16x16": string;
    "32x32": string;
  };
  simplified?: boolean;
  style?: string;
  isPrivate?: boolean;
  properties?: Record<string, any>;
  entityId?: string;
  uuid?: string;
  expand?: string;
}

// Paginated response for /project/search
export interface JiraPaginatedProjectsResponse {
  self: string;
  maxResults: number;
  startAt: number;
  total: number;
  isLast: boolean;
  values: JiraProject[];
}
