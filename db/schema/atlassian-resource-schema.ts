import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { timestamps } from "../helper/timestamp-helper";
import { jiraProject } from "./jira-project-schema";
import { userAtlassianProjectAccess } from "./user-resource-join-schema";

export const atlassianResource = sqliteTable("atlassian_resource", {
  cloudId: text("cloud_id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  avatarUrl: text("avatar_url"),

  ...timestamps
},
  (table) => [index("idx_resource_cloudId").on(table.cloudId)]
);

export const atlassianResourceRelations = relations(atlassianResource, ({ many }) => ({
  projects: many(jiraProject),
  userAccess: many(userAtlassianProjectAccess),
}));
