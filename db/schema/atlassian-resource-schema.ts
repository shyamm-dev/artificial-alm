import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestamps } from "../helper/timestamp-helper";

export const atlassianResource = sqliteTable("atlassian_resource", {
  cloudId: text("cloud_id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  scopes: text("scopes", { mode: "json" }).$type<string[]>().notNull(),
  avatarUrl: text("avatar_url"),

  ...timestamps
});
