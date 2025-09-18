"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"

interface ProjectFilterProps {
  projects: { id: string; name: string; key: string; avatarUrl: string | null }[]
}

export function ProjectFilter({ projects }: ProjectFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentProject = searchParams.get("projectId") || ""
  const [open, setOpen] = useState(false)

  const selectedProject = projects.find(p => p.id === currentProject)

  const handleProjectChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("projectId", value)
    params.set("page", "1")
    router.push(`?${params.toString()}`)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-64 justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            {selectedProject ? (
              <>
                {selectedProject.avatarUrl && (
                  <Image 
                    src={selectedProject.avatarUrl} 
                    alt="Project Avatar" 
                    width={16} 
                    height={16}
                    className="rounded flex-shrink-0"
                  />
                )}
                <span className="truncate">{selectedProject.key} - {selectedProject.name}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Select project...</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <Command>
          <CommandInput placeholder="Search projects..." />
          <CommandList>
            <CommandEmpty>No project found.</CommandEmpty>
            <CommandGroup>
              {projects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={`${project.key} ${project.name}`}
                  onSelect={() => handleProjectChange(project.id)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 truncate">
                    {project.avatarUrl && (
                      <Image 
                        src={project.avatarUrl} 
                        alt="Project Avatar" 
                        width={16} 
                        height={16}
                        className="rounded flex-shrink-0"
                      />
                    )}
                    <span className="truncate">{project.key} - {project.name}</span>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4",
                      currentProject === project.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}