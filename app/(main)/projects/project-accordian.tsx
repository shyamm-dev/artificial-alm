"use client"

import { use, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ExternalLinkIcon } from "lucide-react"
import ProjectCard from "./project-card"
import { COMPLIANCE_FRAMEWORKS } from "@/constants/compliance"
import { getUserResourcesAndProjects } from "@/db/queries/user-project-queries"
import { jiraProject } from "@/db/schema/jira-project-schema"

const availableStandards = [...COMPLIANCE_FRAMEWORKS];

type UserAccessData = Awaited<ReturnType<typeof getUserResourcesAndProjects>>;

export default function ProjectAccordian({ sitesWithProjectsPromise }: { sitesWithProjectsPromise: Promise<UserAccessData> }) {
  const userAccessData = use(sitesWithProjectsPromise);

  const sites = (() => {
    const sitesMap = new Map();
    userAccessData.forEach((access) => {
      const { resource } = access;
      if (!sitesMap.has(resource.cloudId)) {
        sitesMap.set(resource.cloudId, resource);
      }
    });
    return Array.from(sitesMap.values());
  })();

  const [projectCompliance, setProjectCompliance] = useState(new Map<string, string[]>());
  const [selectedProject, setSelectedProject] = useState<(typeof jiraProject.$inferSelect & { complianceStandards: string[] }) | null>(null);

  const handleComplianceStandardToggle = (standard: string) => {
    if (!selectedProject) return;

    const currentStandards = projectCompliance.get(selectedProject.id) || [];
    const updatedStandards = currentStandards.includes(standard)
      ? currentStandards.filter(s => s !== standard)
      : [...currentStandards, standard];

    setProjectCompliance(prev => new Map(prev.set(selectedProject.id, updatedStandards)));
    setSelectedProject({ ...selectedProject, complianceStandards: updatedStandards });
  };

  return (
    <>
      <Accordion type="multiple" className="space-y-4">
        {sites.map((site) => {
          const siteProjects = userAccessData.filter(access => access.resource.cloudId === site.cloudId && access.project);

          return (
            <AccordionItem key={site.cloudId} value={site.cloudId} className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center justify-between w-full mr-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={site.avatarUrl || undefined} alt={site.name} />
                      <AvatarFallback>{site.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-left text-sm grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                      <span className="font-medium text-foreground">Site Name</span>
                      <span className="text-muted-foreground font-semibold">: {site.name}</span>
                      <span className="font-medium text-foreground">Site URL</span>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <a href={site.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          : {site.url}
                        </a>
                        <ExternalLinkIcon className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {siteProjects.length} Projects
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <Separator className="mb-4" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {siteProjects.map((access) => {
                    const project = {
                      ...access.project!,
                      complianceStandards: projectCompliance.get(access.project!.id) || access.project!.compliance?.frameworks || []
                    };

                    return (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onSettingsClick={setSelectedProject}
                        selectedProject={selectedProject}
                        siteName={site.name}
                        siteUrl={site.url}
                        availableStandards={availableStandards}
                        onComplianceStandardToggle={handleComplianceStandardToggle}
                      />
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </>
  )
}
