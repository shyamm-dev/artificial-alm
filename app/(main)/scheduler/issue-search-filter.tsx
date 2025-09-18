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

interface IssueSearchFilterProps {
  issues: { issueKey: string; summary: string; issueTypeIconUrl: string | null; issueTypeName: string | null }[]
}

export function IssueSearchFilter({ issues }: IssueSearchFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSearch = searchParams.get("search") || ""
  const [open, setOpen] = useState(false)

  const selectedIssue = issues.find(issue => 
    issue.issueKey === currentSearch || issue.summary === currentSearch
  )

  const handleIssueChange = (value: string) => {
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
            {selectedIssue ? (
              <>
                {selectedIssue.issueTypeIconUrl && (
                  <Image 
                    src={selectedIssue.issueTypeIconUrl} 
                    alt="Issue Type" 
                    width={16} 
                    height={16}
                    className="flex-shrink-0"
                  />
                )}
                <span className="truncate">{selectedIssue.issueKey} - {selectedIssue.summary}</span>
              </>
            ) : currentSearch ? (
              <span className="truncate">{currentSearch}</span>
            ) : (
              <span className="text-muted-foreground">Search by issue key or summary...</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full lg:w-96 p-0">
        <Command>
          <CommandInput placeholder="Search issues..." />
          <CommandList>
            <CommandEmpty>No issue found.</CommandEmpty>
            <CommandGroup>
              {issues.map((issue) => (
                <CommandItem
                  key={issue.issueKey}
                  value={`${issue.issueKey} ${issue.summary}`}
                  onSelect={() => handleIssueChange(issue.issueKey)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-start gap-2 truncate flex-1">
                    {issue.issueTypeIconUrl && (
                      <Image 
                        src={issue.issueTypeIconUrl} 
                        alt="Issue Type" 
                        width={16} 
                        height={16}
                        className="flex-shrink-0 mt-0.5"
                      />
                    )}
                    <div className="flex flex-col gap-1 truncate flex-1">
                      <span className="font-medium truncate">{issue.issueKey}</span>
                      <span className="text-sm text-muted-foreground truncate">{issue.summary}</span>
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4 ml-2 flex-shrink-0",
                      (currentSearch === issue.issueKey || currentSearch === issue.summary) ? "opacity-100" : "opacity-0"
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