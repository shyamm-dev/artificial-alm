import { getServerSession } from "@/lib/get-server-session";
import { redirect } from "next/navigation";
import { hasAtlassianAccount } from "@/lib/check-atlassian-account";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { LinkAtlassianButton } from "./link-button";
import { SyncHandler } from "./sync-handler";

export default async function AtlassianIntegrationPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const hasAtlassian = await hasAtlassianAccount();

  return (
    <div className="px-4 lg:px-6">
      <SyncHandler />
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Atlassian Integration</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Connect your Atlassian account to access Jira projects</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            {hasAtlassian ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Connected
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-muted-foreground" />
                Not Connected
              </>
            )}
          </CardTitle>
          <CardDescription>
            {hasAtlassian
              ? "Your Atlassian account is connected. You can access Jira projects and sync data."
              : "Connect your Atlassian account to access Jira projects, sync issues, and manage compliance."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {hasAtlassian ? "Your Atlassian account is connected. You can now:" : "Link your Atlassian account to unlock:"}
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>Access your Jira projects</li>
              <li>Sync issues and requirements</li>
              <li>Deploy test cases back to Jira</li>
              <li>Manage compliance frameworks at project level</li>
              <li>Bulk testcase generation</li>
            </ul>
            {hasAtlassian ? (
              <Link href="/projects?tab=jira">
                <Button>Go to Projects</Button>
              </Link>
            ) : (
              <LinkAtlassianButton />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
