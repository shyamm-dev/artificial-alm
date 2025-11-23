"use client"

import { StandaloneSearch } from "./standalone-search";
import { StandaloneProjectsClient } from "./standalone-projects-client";
import { CreateProjectDialog } from "./create-project-dialog";
import { useState } from "react";
import { standaloneProject, standaloneProjectCompliance } from "@/db/schema";

type StandaloneProjectWithCompliance = {
  project: typeof standaloneProject.$inferSelect;
  compliance: typeof standaloneProjectCompliance.$inferSelect | null;
  customRuleCount: number;
  stats: {
    success: number;
    failed: number;
    inProgress: number;
    pending: number;
    total: number;
  };
};

interface StandaloneProjectsProps {
  projectsData: StandaloneProjectWithCompliance[];
}

export function StandaloneProjectsWrapper({ projectsData }: StandaloneProjectsProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-muted-foreground">Create and manage projects independently</p>
      </div>
      <div className="flex items-center justify-between mb-4">
        <StandaloneSearch onSearchChange={setSearchQuery} />
        <CreateProjectDialog />
      </div>
      <StandaloneProjectsClient projectsData={projectsData} searchQuery={searchQuery} />
    </>
  );
}
