"use client"

import { useState, useEffect } from "react";
import StandaloneProjectCard from "./standalone-project-card";
import { standaloneProject, standaloneProjectCompliance } from "@/db/schema";

type ProjectData = {
  project: typeof standaloneProject.$inferSelect;
  compliance: typeof standaloneProjectCompliance.$inferSelect | null;
  stats: {
    success: number;
    failed: number;
    inProgress: number;
    pending: number;
    total: number;
  };
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

  // Update compliance state when projectsData changes (after router.refresh())
  useEffect(() => {
    const updatedCompliance = new Map<string, string[]>();
    projectsData.forEach(({ project, compliance }) => {
      if (project) {
        updatedCompliance.set(project.id, compliance?.frameworks || []);
      }
    });
    setProjectCompliance(updatedCompliance);
  }, [projectsData]);

  const filteredProjects = projectsData.filter(({ project }) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredProjects.length === 0 && searchQuery) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No projects found matching &quot;{searchQuery}&quot;
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filteredProjects.map(({ project, compliance, stats }) => {
        const projectWithCompliance = {
          ...project,
          complianceStandards: projectCompliance.get(project.id) || compliance?.frameworks || [],
          compliance,
        };

        return (
          <StandaloneProjectCard
            key={`${project.id}-${project.updatedAt}-${projectWithCompliance.complianceStandards.join(',')}`}
            project={projectWithCompliance}
            stats={stats}
          />
        );
      })}
    </div>
  );
}
