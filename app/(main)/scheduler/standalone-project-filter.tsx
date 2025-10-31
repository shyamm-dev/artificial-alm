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

interface StandaloneProjectFilterProps {
  projects: { id: string; name: string }[]
}

export function StandaloneProjectFilter({ projects }: StandaloneProjectFilterProps) {
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
          className="w-full sm:w-64 justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            {selectedProject ? (
              <span className="truncate">{selectedProject.name}</span>
            ) : (
              <span className="text-muted-foreground">Select project...</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full sm:w-64 p-0">
        <Command>
          <CommandInput placeholder="Search projects..." />
          <CommandList>
            <CommandEmpty>No project found.</CommandEmpty>
            <CommandGroup>
              {projects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={project.name}
                  onSelect={() => handleProjectChange(project.id)}
                  className="flex items-center justify-between"
                >
                  <span className="truncate">{project.name}</span>
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
