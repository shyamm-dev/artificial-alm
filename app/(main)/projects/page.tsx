import { getServerSession } from "@/lib/get-server-session";
import { redirect } from "next/navigation";
import { hasAtlassianAccount } from "@/lib/check-atlassian-account";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TabNavigation } from "./tab-navigation";
import { JiraProjects } from "./jira-projects";
import { StandaloneProjects } from "./standalone-projects";

interface ProjectsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const session = await getServerSession();
  if (!session)
    redirect("/login");

  const hasAtlassian = await hasAtlassianAccount();
  const params = await searchParams;
  const tab = params.tab || "standalone";

  return (
    <div className="px-4 lg:px-6">
      <h1 className="text-2xl font-bold mb-6">Projects</h1>
      
      <Tabs value={tab}>
        <TabNavigation hasAtlassian={hasAtlassian} />
        
        <TabsContent value="standalone" className="mt-6">
          <StandaloneProjects />
        </TabsContent>
        
        <TabsContent value="jira" className="mt-6">
          <JiraProjects hasAtlassian={hasAtlassian} userId={session.user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
