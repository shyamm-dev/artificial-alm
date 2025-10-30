import { getServerSession } from "@/lib/get-server-session";
import { db } from "@/db/drizzle";
import { account } from "@/auth-schema";
import { eq, and } from "drizzle-orm";

export async function hasAtlassianAccount(): Promise<boolean> {
  const session = await getServerSession();
  
  if (!session?.user) return false;
  
  const atlassianAccount = await db.query.account.findFirst({
    where: and(
      eq(account.userId, session.user.id),
      eq(account.providerId, "atlassian")
    )
  });
  
  return !!atlassianAccount;
}
