import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";

export function StandaloneProjects() {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-muted-foreground">Create and manage projects independently</p>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search projects..." 
            className="pl-9"
          />
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Standalone Projects</CardTitle>
          <CardDescription>
            Create and manage projects without Jira integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Standalone projects feature coming soon. You&apos;ll be able to create projects and manage requirements without connecting to Jira.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
