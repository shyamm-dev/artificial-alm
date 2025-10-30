import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function StandaloneProjectsProgress({ hasProjects }: { hasProjects: boolean }) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Standalone Projects Progress</CardTitle>
        <CardDescription>
          Track progress for standalone projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Standalone projects progress tracking coming soon.
        </p>
      </CardContent>
    </Card>
  );
}
