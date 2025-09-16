"use client"

import { use, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { ExternalLinkIcon } from "lucide-react"
import ProjectCard from "./project-card"
import { COMPLIANCE_FRAMEWORKS } from "@/constants/shared-constants"
import { getUserResourcesAndProjects } from "@/db/queries/user-project-queries"


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

  const [projectCompliance, setProjectCompliance] = useState(() => {
    const initialCompliance = new Map<string, string[]>();
    userAccessData.forEach((access) => {
      if (access.project) {
        initialCompliance.set(access.project.id, access.project.compliance?.frameworks || []);
      }
    });
    return initialCompliance;
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleComplianceStandardToggle = (standard: string) => {
    if (!selectedProjectId) return;

    const currentStandards = projectCompliance.get(selectedProjectId) || [];
    const updatedStandards = currentStandards.includes(standard)
      ? currentStandards.filter(s => s !== standard)
      : [...currentStandards, standard];

    setProjectCompliance(prev => new Map(prev.set(selectedProjectId, updatedStandards)));
  };

  if (sites.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No Atlassian sites or projects found. Use the sync button to connect your resources.</p>
      </div>
    );
  }

  const filteredSites = sites.map(site => {
    const siteProjects = userAccessData.filter(access =>
      access.resource.cloudId === site.cloudId &&
      access.project &&
      access.project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { site, projects: siteProjects };
  }).filter(({ projects }) => projects.length > 0);

  return (
    <>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {filteredSites.length === 0 && searchQuery ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No projects found matching &quot;{searchQuery}&quot;</p>
        </div>
      ) : (
        <Accordion type="multiple" className="space-y-4" defaultValue={filteredSites.map(({ site }) => site.cloudId)}>
          {filteredSites.map(({ site, projects: siteProjects }) => {

          return (
            <AccordionItem key={site.cloudId} value={site.cloudId} className="border rounded-lg">
              <AccordionTrigger className="px-4 md:px-6 py-4 hover:no-underline">
                <div className="flex flex-col md:flex-row md:items-center justify-between w-full mr-4 gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={site.avatarUrl || undefined} alt={site.name} />
                      <AvatarFallback>{site.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-left text-sm space-y-1">
                      <div>
                        <span className="font-medium text-foreground">Org Name: </span>
                        <span className="text-muted-foreground font-semibold">{site.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium text-foreground">Org URL: </span>
                        <a href={site.url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                          {site.url}
                        </a>
                        <ExternalLinkIcon className="h-3 w-3 flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Atlassian
                    </Badge>
                    <Badge variant="outline">
                      {siteProjects.length} Project{siteProjects.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 md:px-6 pb-6">
                <Separator className="mb-4" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {siteProjects.map((access) => {
                    const project = {
                      ...access.project!,
                      complianceStandards: projectCompliance.get(access.project!.id) || access.project!.compliance?.frameworks || [],
                      compliance: access.project!.compliance
                    };

                    return (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onSettingsClick={(proj) => setSelectedProjectId(proj.id)}
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
      )}
    </>
  )
}
