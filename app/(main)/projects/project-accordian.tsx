"use client"

import { use } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ExternalLinkIcon } from "lucide-react"
import JiraProjectCard from "./jira-project-card"
import { jiraProject } from "@/db/schema/jira-project-schema"

type ProjectWithStats = {
  project: typeof jiraProject.$inferSelect & { complianceStandards: string[] }
  stats: {
    success: number
    failed: number
    inProgress: number
    pending: number
    total: number
  }
  customRuleCount: number
  siteName: string
  siteUrl: string
}

export default function ProjectAccordian({ projectsWithStatsPromise, searchQuery = "", showOrgCount = false }: { projectsWithStatsPromise: Promise<ProjectWithStats[]>, searchQuery?: string, showOrgCount?: boolean }) {
  const projectsWithStats = use(projectsWithStatsPromise);

  const sites = (() => {
    const sitesMap = new Map();
    projectsWithStats.forEach(({ siteName, siteUrl }) => {
      if (!sitesMap.has(siteName)) {
        sitesMap.set(siteName, { name: siteName, url: siteUrl });
      }
    });
    return Array.from(sitesMap.values());
  })();

  if (projectsWithStats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" className="h-16 w-16 text-muted-foreground">
          <path d="M108.023 16H61.805c0 11.52 9.324 20.848 20.847 20.848h8.5v8.226c0 11.52 9.328 20.848 20.848 20.848V19.977A3.98 3.98 0 00108.023 16zm0 0" fill="currentColor" />
          <path d="M85.121 39.04H38.902c0 11.519 9.325 20.847 20.844 20.847h8.504v8.226c0 11.52 9.328 20.848 20.848 20.848V43.016a3.983 3.983 0 00-3.977-3.977zm0 0" fill="currentColor" />
          <path d="M62.219 62.078H16c0 11.524 9.324 20.848 20.848 20.848h8.5v8.23c0 11.52 9.328 20.844 20.847 20.844V66.059a3.984 3.984 0 00-3.976-3.98zm0 0" fill="currentColor" />
        </svg>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">No Jira projects found</h3>
          <p className="text-sm text-muted-foreground">Sync with Jira to import your projects</p>
        </div>
      </div>
    );
  }

  const filteredSites = sites.map(site => {
    const siteProjects = projectsWithStats.filter(({ project, siteName }) =>
      siteName === site.name &&
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { site, projects: siteProjects };
  }).filter(({ projects }) => projects.length > 0);

  return (
    <>
      {showOrgCount && (
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">TOTAL ORG :</span> {sites.length} {sites.length === 1 ? 'organization' : 'organizations'}
          </p>
        </div>
      )}
      {filteredSites.length === 0 && searchQuery ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No projects found matching &quot;{searchQuery}&quot;</p>
        </div>
      ) : (
        <Accordion type="multiple" className="space-y-4" defaultValue={filteredSites.map(({ site }) => site.name)}>
          {filteredSites.map(({ site, projects: siteProjects }) => {

          return (
            <AccordionItem key={site.name} value={site.name} className="border rounded-lg">
              <AccordionTrigger className="px-4 md:px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3 w-full">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={site.avatarUrl || undefined} alt={site.name} />
                    <AvatarFallback>{site.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="text-left space-y-1 min-w-0 flex-1">
                    <div className="text-base">
                      <span className="font-medium text-foreground">Org Name :</span>{' '}
                      <span className="font-semibold text-foreground">{site.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-base text-muted-foreground">
                      <span className="font-medium text-foreground">Org URL :</span>{' '}
                      <a href={site.url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate" onClick={(e) => e.stopPropagation()}>
                        {site.url}
                      </a>
                      <ExternalLinkIcon className="h-3.5 w-3.5 shrink-0" />
                    </div>
                    <div className="text-base text-muted-foreground">
                      <span className="font-medium text-foreground">Projects you can access :</span>{' '}
                      <span className="font-semibold">{siteProjects.length}</span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 md:px-6 pb-6">
                <Separator className="mb-4" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {siteProjects.map(({ project, stats, customRuleCount }) => (
                    <JiraProjectCard
                      key={project.id}
                      project={project}
                      stats={stats}
                      customRuleCount={customRuleCount}
                    />
                  ))}
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
