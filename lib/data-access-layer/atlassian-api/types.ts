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

export interface JiraAvatarUrls {
  "16x16": string;
  "24x24": string;
  "32x32": string;
  "48x48": string;
}

export interface JiraUser {
  self: string;
  accountId: string;
  accountType: string;
  avatarUrls: JiraAvatarUrls;
  displayName: string;
  active: boolean;
}

export interface JiraIssueType {
  self: string;
  id: string;
  description: string;
  iconUrl: string;
  name: string;
  subtask: boolean;
  avatarId: number;
  hierarchyLevel: number;
}

export interface JiraProjectPermissions {
  canEdit: boolean;
}

export interface JiraProjectInsight {
  totalIssueCount: number;
  lastIssueUpdateTime: string; // ISO timestamp
}

export interface JiraProject {
  expand: string;
  self: string;
  id: string;
  key: string;
  name: string;
  description: string;
  lead: JiraUser;
  issueTypes: JiraIssueType[];
  avatarUrls: JiraAvatarUrls;
  projectKeys: string[];
  projectTypeKey: string;
  simplified: boolean;
  style: string;
  isPrivate: boolean;
  permissions: JiraProjectPermissions;
  properties: Record<string, unknown>;
  entityId: string;
  uuid: string;
  insight: JiraProjectInsight;
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
