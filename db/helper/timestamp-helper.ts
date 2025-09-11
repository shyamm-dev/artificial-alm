import { integer } from "drizzle-orm/sqlite-core";

export const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .defaultNow()
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
};
