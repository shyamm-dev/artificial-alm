"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Layers, FolderIcon, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { JiraIcon } from "@/components/jira-icon";

interface Project {
  id: string;
  name: string;
  source: "standalone" | "jira";
}

interface ProjectSelectorProps {
  projects: Project[];
  currentProjectId?: string;
  hasAtlassian?: boolean;
  disabled?: boolean;
}

export function ProjectSelector({ projects, hasAtlassian = false, disabled = false }: ProjectSelectorProps) {
  const router = useRouter();
  const standaloneProjects = projects.filter(p => p.source === "standalone");
  const jiraProjects = projects.filter(p => p.source === "jira");

  const getInitialSource = () => {
    if (typeof window === 'undefined') return null;
    const savedSource = localStorage.getItem('selectedSource') as "standalone" | "jira" | null;
    
    // Validate saved source is still valid
    if (savedSource === 'standalone' && standaloneProjects.length > 0) return savedSource;
    if (savedSource === 'jira' && (jiraProjects.length > 0 || hasAtlassian)) return savedSource;
    
    // Default to standalone first, then jira
    const defaultSource = standaloneProjects.length > 0 ? 'standalone' : jiraProjects.length > 0 ? 'jira' : null;
    if (defaultSource) localStorage.setItem('selectedSource', defaultSource);
    return defaultSource;
  };

  const [open, setOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<"standalone" | "jira" | null>(null);
  const [displaySource, setDisplaySource] = useState<"standalone" | "jira" | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const source = getInitialSource();
    setDisplaySource(source);
    setIsLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSourceSelect = (source: "standalone" | "jira") => {
    setSelectedSource(source);
  };

  const handleConfirm = () => {
    if (selectedSource) {
      localStorage.setItem('selectedSource', selectedSource);
      setDisplaySource(selectedSource);
      setOpen(false);
      window.dispatchEvent(new CustomEvent('workspace-changed'));
      router.refresh();
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      const savedSource = localStorage.getItem('selectedSource') as "standalone" | "jira" | null;
      if (savedSource) {
        handleSourceSelect(savedSource);
      }
    } else {
      setSelectedSource(null);
    }
  };

  const currentProjects = selectedSource === "standalone" ? standaloneProjects : selectedSource === "jira" ? jiraProjects : [];

  if (!isLoaded) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Workspace :</span>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" className="h-9 px-3 gap-2" disabled={disabled}>
            {displaySource === "standalone" ? (
              <FolderIcon className="h-4 w-4 shrink-0" />
            ) : displaySource === "jira" ? (
              <JiraIcon className="h-4 w-4 shrink-0" />
            ) : (
              <Layers className="h-4 w-4 shrink-0" />
            )}
            <span className="text-sm">{displaySource ? displaySource.charAt(0).toUpperCase() + displaySource.slice(1) : "Select Source"}</span>
          </Button>
        </DialogTrigger>
      <DialogContent className="sm:max-w-3xl p-0">
        <DialogHeader className="px-6 pt-4">
          <DialogTitle>Select Your Workspace</DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="flex h-[300px]">
          <div className="w-[220px] px-6 py-4">
            <h3 className="text-xs font-medium mb-3 text-muted-foreground uppercase tracking-wider">Sources</h3>
            <div className="space-y-1">
              {standaloneProjects.length > 0 && (
                <div
                  onClick={() => handleSourceSelect("standalone")}
                  className={`flex items-center gap-3 px-4 py-2 rounded-md cursor-pointer transition-colors border ${
                    selectedSource === "standalone" ? "bg-accent border-primary" : "hover:bg-accent/50 border-transparent"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selectedSource === "standalone" ? "border-primary" : "border-muted-foreground"
                  }`}>
                    {selectedSource === "standalone" && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <FolderIcon className="h-4 w-4 shrink-0" />
                  <span className="font-medium mr-1">Standalone</span>
                </div>
              )}
              {(jiraProjects.length > 0 || !hasAtlassian) && (
                <div
                  onClick={() => handleSourceSelect("jira")}
                  className={`flex items-center gap-3 px-4 py-2 rounded-md cursor-pointer transition-colors border ${
                    selectedSource === "jira" ? "bg-accent border-primary" : "hover:bg-accent/50 border-transparent"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selectedSource === "jira" ? "border-primary" : "border-muted-foreground"
                  }`}>
                    {selectedSource === "jira" && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <JiraIcon className="h-4 w-4 shrink-0" />
                  <span className="font-medium mr-1">Jira</span>
                </div>
              )}
            </div>
          </div>
          <Separator orientation="vertical" className="h-auto" />
          <div className="flex-1 px-6 py-4">
            <h3 className="text-xs font-medium mb-3 text-muted-foreground uppercase tracking-wider">Projects In This Source</h3>
            {selectedSource ? (
              <>
                {selectedSource === "jira" && !hasAtlassian ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <JiraIcon className="h-16 w-16" />
                    <div className="text-center space-y-2">
                      <h3 className="text-sm font-semibold">Atlassian Account Required</h3>
                      <p className="text-xs text-muted-foreground">Link your Atlassian account in the integrations page to access Jira projects</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="overflow-y-auto space-y-1 pr-2 mb-3 max-h-[200px]">
                      {currentProjects.map((project) => (
                        <div
                          key={project.id}
                          className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50"
                        >
                          <Check className="h-4 w-4 text-primary" />
                          <span className="text-sm">{project.name}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentProjects.length === 1 ? '1 project' : `All ${currentProjects.length} projects`} {selectedSource === "jira" ? "fetched from Jira will be available in your workspace" : "will be available in your workspace"}
                    </p>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground text-center">Select a source to view projects</p>
              </div>
            )}
          </div>
        </div>
        <Separator className="!my-0" />
        <div className="flex justify-end gap-2 px-6 pb-3">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          {selectedSource === "jira" && !hasAtlassian ? (
            <Link href="/integrations/atlassian">
              <Button onClick={() => setOpen(false)}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Go to Integrations
              </Button>
            </Link>
          ) : (
            <Button onClick={handleConfirm} disabled={!selectedSource}>Confirm & Continue</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </div>
  );
}
