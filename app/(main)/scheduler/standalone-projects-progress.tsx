import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function StandaloneProjectsProgress() {
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
