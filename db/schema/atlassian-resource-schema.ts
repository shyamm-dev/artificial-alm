import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";
import { timestamps } from "../helper/timestamp-helper";

export const atlassianResource = sqliteTable("atlassian_resource", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cloudId: text("cloud_id").notNull().unique(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  scopes: text("scopes", { mode: "json" }).$type<string[]>().notNull(),
  avatarUrl: text("avatar_url"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),

  ...timestamps
},
  (table) => [index("idx_atlassian_resource_userId").on(table.userId)]
);
