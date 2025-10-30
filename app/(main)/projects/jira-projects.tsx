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

  return <JiraProjectsWrapper sitesWithProjectsPromise={sitesWithProjectsPromise} />;
}
