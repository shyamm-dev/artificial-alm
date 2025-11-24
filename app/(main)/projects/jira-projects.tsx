import { getUserResourcesAndProjects } from "@/db/queries/user-project-queries";
import { getJiraProjectTestCaseStats } from "@/db/queries/jira-project-stats-queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { JiraProjectsWrapper } from "./jira-projects-wrapper";

interface JiraProjectsProps {
  hasAtlassian: boolean;
  userId: string;
}

export async function JiraProjects({ hasAtlassian, userId }: JiraProjectsProps) {
  const projectsWithStatsPromise = hasAtlassian
    ? getUserResourcesAndProjects(userId).then(async (userAccessData) => {
        const projectsWithStats = await Promise.all(
          userAccessData
            .filter((access) => access.project)
            .map(async (access) => ({
              project: {
                ...access.project!,
                complianceStandards: access.project!.compliance?.frameworks || [],
              },
              stats: await getJiraProjectTestCaseStats(access.project!.id, userId),
              customRuleCount: access.customRuleCount,
              siteName: access.resource.name,
              siteUrl: access.resource.url,
            }))
        );
        return projectsWithStats;
      })
    : Promise.resolve([]);

  if (!hasAtlassian) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manage Jira projects and compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Checkout Atlassian integration to use this feature.
          </p>
          <Link href="/integrations/atlassian">
            <Button>Go to Integrations</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return <JiraProjectsWrapper projectsWithStatsPromise={projectsWithStatsPromise} />;
}
