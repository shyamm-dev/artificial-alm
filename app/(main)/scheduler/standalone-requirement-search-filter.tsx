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

interface StandaloneRequirementSearchFilterProps {
  requirements: { requirementName: string }[]
}

export function StandaloneRequirementSearchFilter({ requirements }: StandaloneRequirementSearchFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSearch = searchParams.get("search") || ""
  const [open, setOpen] = useState(false)

  const selectedRequirement = requirements.find(req => req.requirementName === currentSearch)

  const handleRequirementChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("search", value)
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
          className="w-full lg:w-96 justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            {selectedRequirement ? (
              <span className="truncate">{selectedRequirement.requirementName}</span>
            ) : currentSearch ? (
              <span className="truncate">{currentSearch}</span>
            ) : (
              <span className="text-muted-foreground">Search by requirement name...</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full lg:w-96 p-0">
        <Command>
          <CommandInput placeholder="Search requirements..." />
          <CommandList>
            <CommandEmpty>No requirement found.</CommandEmpty>
            <CommandGroup>
              {requirements.map((requirement) => (
                <CommandItem
                  key={requirement.requirementName}
                  value={requirement.requirementName}
                  onSelect={() => handleRequirementChange(requirement.requirementName)}
                  className="flex items-center justify-between"
                >
                  <span className="truncate">{requirement.requirementName}</span>
                  <Check
                    className={cn(
                      "h-4 w-4 ml-2 flex-shrink-0",
                      currentSearch === requirement.requirementName ? "opacity-100" : "opacity-0"
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
