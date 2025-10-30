import { getServerSession } from "@/lib/get-server-session";
import { redirect } from "next/navigation";
import { hasAtlassianAccount } from "@/lib/check-atlassian-account";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TabNavigation } from "./tab-navigation";
import { JiraProjects } from "./jira-projects";
import { StandaloneProjectsServer } from "./standalone-projects-server";
import { createDefaultStandaloneProject } from "@/db/queries/standalone-project-queries";
import { AutoSync } from "./auto-sync";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

interface ProjectsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const session = await getServerSession();
  if (!session)
    redirect("/login");

  const [userRecord] = await db.select({ onboarded: user.onboarded }).from(user).where(eq(user.id, session.user.id)).limit(1);
  const wasOnboarded = userRecord?.onboarded || false;

  await createDefaultStandaloneProject(session.user.id);

  const hasAtlassian = await hasAtlassianAccount();
  const shouldAutoSync = !wasOnboarded && hasAtlassian;
  const params = await searchParams;
  const tab = params.tab || "standalone";

  return (
    <div className="px-4 lg:px-6">
      <AutoSync shouldSync={shouldAutoSync} />
      <h1 className="text-2xl font-bold mb-6">Projects</h1>
      
      <Tabs value={tab}>
        <TabNavigation />
        
        <TabsContent value="standalone" className="mt-6">
          <StandaloneProjectsServer userId={session.user.id} />
        </TabsContent>
        
        <TabsContent value="jira" className="mt-6">
          <JiraProjects hasAtlassian={hasAtlassian} userId={session.user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
