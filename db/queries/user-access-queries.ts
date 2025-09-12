import { db } from "@/db/drizzle";
import { userAtlassianProjectAccess } from "@/db/schema/user-resource-join-schema";
import { eq, and, isNull } from "drizzle-orm";
import { userAccessInsertSchema } from "@/db/helper/sync-helpers";

export function getUserAccess(userId: string) {
  return db
    .select()
    .from(userAtlassianProjectAccess)
    .where(eq(userAtlassianProjectAccess.userId, userId));
}

export function insertUserAccess(row: typeof userAtlassianProjectAccess.$inferInsert) {
  const parsedRow = userAccessInsertSchema.parse(row);
  return db.insert(userAtlassianProjectAccess).values(parsedRow);
}

export function deleteUserAccess(row: typeof userAtlassianProjectAccess.$inferSelect) {
  return db.delete(userAtlassianProjectAccess).where(
    and(
      eq(userAtlassianProjectAccess.userId, row.userId),
      eq(userAtlassianProjectAccess.cloudId, row.cloudId),
      row.projectId
        ? eq(userAtlassianProjectAccess.projectId, row.projectId)
        : isNull(userAtlassianProjectAccess.projectId)
    )
  );
}
