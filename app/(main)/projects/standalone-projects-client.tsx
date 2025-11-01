"use client"

import { useState } from "react";
import StandaloneProjectCard from "./standalone-project-card";
import { COMPLIANCE_FRAMEWORKS } from "@/constants/shared-constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { standaloneProject, standaloneProjectCompliance } from "@/db/schema";

const availableStandards = [...COMPLIANCE_FRAMEWORKS];

type ProjectData = {
  project: typeof standaloneProject.$inferSelect;
  compliance: typeof standaloneProjectCompliance.$inferSelect | null;
};

export function StandaloneProjectsClient({ projectsData, searchQuery = "" }: { projectsData: ProjectData[], searchQuery?: string }) {
  const [projectCompliance, setProjectCompliance] = useState(() => {
    const initialCompliance = new Map<string, string[]>();
    projectsData.forEach(({ project, compliance }) => {
      if (project) {
        initialCompliance.set(project.id, compliance?.frameworks || []);
      }
    });
    return initialCompliance;
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleComplianceStandardToggle = (standard: string) => {
    if (!selectedProjectId) return;

    const currentStandards = projectCompliance.get(selectedProjectId) || [];
    const updatedStandards = currentStandards.includes(standard)
      ? currentStandards.filter(s => s !== standard)
      : [...currentStandards, standard];

    setProjectCompliance(prev => new Map(prev.set(selectedProjectId, updatedStandards)));
  };

  const handleResetCompliance = (projectId: string) => {
    const originalProject = projectsData.find(({ project }) => project.id === projectId);
    if (originalProject) {
      setProjectCompliance(prev => new Map(prev.set(projectId, originalProject.compliance?.frameworks || [])));
    }
  };

  const filteredProjects = projectsData.filter(({ project }) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="border rounded-lg bg-transparent">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Standalone Projects</CardTitle>
          <Badge variant="outline">
            {filteredProjects.length} Project{filteredProjects.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            {searchQuery ? (
              <p className="text-muted-foreground">
                No projects found matching &quot;{searchQuery}&quot;
              </p>
            ) : (
              <div className="text-muted-foreground">
                <p>Looks like you just deleted all your projects... 😐</p>
                <p>Create a new project and configure compliance for test case generation</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map(({ project, compliance }) => {
              const projectWithCompliance = {
                ...project,
                complianceStandards: projectCompliance.get(project.id) || compliance?.frameworks || [],
                compliance,
              };

              return (
                <StandaloneProjectCard
                  key={project.id}
                  project={projectWithCompliance}
                  onSettingsClick={(proj) => setSelectedProjectId(proj.id)}
                  availableStandards={availableStandards}
                  onComplianceStandardToggle={handleComplianceStandardToggle}
                  onResetCompliance={handleResetCompliance}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
