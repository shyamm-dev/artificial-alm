import { getUserResourcesAndProjects } from "@/db/queries/user-project-queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { JiraProjectsWrapper } from "./jira-projects-wrapper";

interface JiraProjectsProps {
  hasAtlassian: boolean;
  userId: string;
}

export async function JiraProjects({ hasAtlassian, userId }: JiraProjectsProps) {
  const sitesWithProjectsPromise = hasAtlassian ? getUserResourcesAndProjects(userId) : Promise.resolve([]);

  if (!hasAtlassian) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atlassian Account Required</CardTitle>
          <CardDescription>
            Link your Atlassian account to access Jira projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            To use Jira features, you need to link your Atlassian account. This will allow you to:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2 mb-4">
            <li>Access your Jira projects</li>
            <li>Sync issues and requirements</li>
            <li>Deploy test cases back to Jira</li>
            <li>Manage compliance frameworks at project level</li>
            <li>Bulk testcase generation</li>
          </ul>
          <Link href="/integrations/atlassian">
            <Button>Link Atlassian Account</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return <JiraProjectsWrapper sitesWithProjectsPromise={sitesWithProjectsPromise} />;
}
