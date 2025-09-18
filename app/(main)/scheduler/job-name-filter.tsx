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

interface JobNameFilterProps {
  jobNames: string[]
}

export function JobNameFilter({ jobNames }: JobNameFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentJobName = searchParams.get("jobName") || ""
  const [open, setOpen] = useState(false)

  const handleJobNameChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("jobName", value)
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
          className="w-48 justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            {currentJobName ? (
              <span className="truncate">{currentJobName}</span>
            ) : (
              <span className="text-muted-foreground">Select job...</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0">
        <Command>
          <CommandInput placeholder="Search jobs..." />
          <CommandList>
            <CommandEmpty>No job found.</CommandEmpty>
            <CommandGroup>
              {jobNames.map((jobName) => (
                <CommandItem
                  key={jobName}
                  value={jobName}
                  onSelect={() => handleJobNameChange(jobName)}
                  className="flex items-center justify-between"
                >
                  <span className="truncate">{jobName}</span>
                  <Check
                    className={cn(
                      "h-4 w-4",
                      currentJobName === jobName ? "opacity-100" : "opacity-0"
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