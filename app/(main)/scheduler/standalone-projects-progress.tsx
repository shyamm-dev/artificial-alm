import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StandaloneTable } from "./standalone-table";
import { getStandaloneScheduledJobRequirements } from "@/db/queries/standalone-scheduled-jobs-queries";

interface StandaloneProjectsProgressProps {
  hasProjects: boolean
  dataPromise?: Promise<[
    Awaited<ReturnType<typeof getStandaloneScheduledJobRequirements>>,
    { id: string; name: string }[],
    string[],
    { requirementName: string }[]
  ]>
  searchParams?: Record<string, string | string[] | undefined>
}

export function StandaloneProjectsProgress({ hasProjects, dataPromise, searchParams }: StandaloneProjectsProgressProps) {
  if (!hasProjects) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Standalone Projects Progress</CardTitle>
          <CardDescription>
            No standalone projects available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Create a standalone project first before continuing.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!dataPromise || !searchParams) {
    return null;
  }

  return <StandaloneTable dataPromise={dataPromise} searchParams={searchParams} />;
}
