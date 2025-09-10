// ----- Atlassian resources

export interface AtlassianResource {
  id: string; // cloudId
  url: string;
  name: string;
  scopes: string[];
  avatarUrl: string;
}

export type AtlassianResourceResponse = AtlassianResource[];

// ----- Jira Projects

export type JiraIssueType = {
  self: string;
  id: string;
  description: string;
  iconUrl: string;
  name: string;
  subtask: boolean;
  avatarId?: number;
  hierarchyLevel: number;
};

export type JiraProject = {
  expand: string;
  self: string;
  id: string;
  key: string;
  description: string;
  issueTypes: JiraIssueType[];
  name: string;
  avatarUrls: {
    "48x48": string;
    "32x32": string;
    "24x24": string;
    "16x16": string;
  };
  projectTypeKey: string;
  simplified: boolean;
  style: string;
  isPrivate: boolean;
  properties: Record<string, unknown>;
  entityId: string;
  uuid: string;
};

export type JiraProjectsPaginatedResponse = {
  self: string;
  maxResults: number;
  startAt: number;
  total: number;
  isLast: boolean;
  values: JiraProject[];
};

// ----- Jira sites with projects

export interface AtlassianResourceWithProjects extends AtlassianResource {
  projects: JiraProject[];
}
