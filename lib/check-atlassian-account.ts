import { getServerSession } from "@/lib/get-server-session";
import { db } from "@/db/drizzle";
import { account } from "@/auth-schema";
import { eq, and } from "drizzle-orm";
import { tryCatch } from "@/lib/try-catch";

export async function hasAtlassianAccount(): Promise<boolean> {
  const session = await getServerSession();
  if (!session?.user) return false;

  const result = await tryCatch(
    db.select()
      .from(account)
      .where(
        and(
          eq(account.userId, session.user.id),
          eq(account.providerId, "atlassian")
        )
      )
      .limit(1)
  );

  if (result.error) {
    console.error("Error checking Atlassian account:", result.error);
    return false;
  }

  return result.data.length > 0;
}
