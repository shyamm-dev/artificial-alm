"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ExternalLinkIcon } from "lucide-react"
import { SiteWithProjects } from "./page"
import ProjectCard from "./project-card"
import { JiraProject } from "@/data-access-layer/atlassian-cloud-api/types"

interface ExtendedProject extends JiraProject {
  isSelected: boolean;
  complianceStandards: string[];
  lastSync: string;
}

interface ExtendedSite extends Omit<SiteWithProjects, 'projects'> {
  projects: ExtendedProject[];
}

interface ProjectsAccordianProps {
  sitesData: SiteWithProjects[];
}

const availableStandards = [
  "IEC 62304",
  "ISO 13485",
  "ISO 27001",
  "FDA 21 CFR Part 820",
  "GDPR",
  "HIPAA",
  "CAN-SPAM",
  "SOX",
  "PCI DSS",
]

export default function ProjectAccordian({ sitesData }: ProjectsAccordianProps) {
  const transformedSites = sitesData.map(site => ({
    ...site,
    projects: site.projects.map(project => ({
      ...project,
      description: project.description || "No description available",
      isSelected: false,
      complianceStandards: ["IEC 62304", "ISO 13485"],
      lastSync: new Date().toISOString(),
    }))
  }));

  const [sites, setSites] = useState<ExtendedSite[]>(transformedSites)
  const [selectedProject, setSelectedProject] = useState<ExtendedProject | null>(null)

  const handleProjectSelection = (siteId: string, projectId: string, isSelected: boolean) => {
    setSites((prevSites) =>
      prevSites.map((site) =>
        site.id === siteId
          ? {
            ...site,
            projects: site.projects.map((project) =>
              project.id === projectId ? { ...project, isSelected } : project,
            ),
          }
          : site,
      ),
    )
  }

  const handleComplianceStandardToggle = (standard: string) => {
    if (!selectedProject) return

    const updatedStandards = selectedProject.complianceStandards.includes(standard)
      ? selectedProject.complianceStandards.filter((s: string) => s !== standard)
      : [...selectedProject.complianceStandards, standard]

    setSelectedProject({ ...selectedProject, complianceStandards: updatedStandards })

    setSites((prevSites) =>
      prevSites.map((site) => ({
        ...site,
        projects: site.projects.map((project) =>
          project.id === selectedProject.id ? { ...project, complianceStandards: updatedStandards } : project,
        ),
      })),
    )
  }

  return (
    <>
      <Accordion type="multiple" className="space-y-4">
        {sites.map((site) => (
          <AccordionItem key={site.id} value={site.id} className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center justify-between w-full mr-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={site.avatarUrl} alt={site.name} />
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
                    {site.projects.filter((p) => p.isSelected).length}/{site.projects.length} synced
                  </Badge>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <Separator className="mb-4" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {site.projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    siteId={site.id}
                    onProjectSelection={handleProjectSelection}
                    onSettingsClick={setSelectedProject}
                    selectedProject={selectedProject}
                    siteName={site.name}
                    siteUrl={site.url}
                    availableStandards={availableStandards}
                    onComplianceStandardToggle={handleComplianceStandardToggle}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  )
}
