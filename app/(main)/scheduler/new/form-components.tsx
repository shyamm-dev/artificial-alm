import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { IconInfoCircle } from "@tabler/icons-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"
import type { JiraIssue } from "@/data-access-layer/types"

export function JobNameField({ form }: { form: any }) {
  return (
    <FormField
      control={form.control}
      name="jobName"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            Job Name
            <Tooltip>
              <TooltipTrigger asChild>
                <IconInfoCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Group multiple individual tasks. Useful for filtering</p>
              </TooltipContent>
            </Tooltip>
          </FormLabel>
          <FormControl>
            <Input placeholder="Enter job name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function IssueSearchDialog({ 
  selectedProject, 
  searchQuery, 
  setSearchQuery, 
  isSearching, 
  searchResults, 
  selectedIssues, 
  toggleIssue, 
  selectedIssueTypes, 
  availableIssueTypes,
  hasError 
}: any) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          disabled={!selectedProject}
          className={hasError ? "border-red-500" : ""}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Issues
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search Issues</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="max-h-96 overflow-y-auto space-y-2">
            {isSearching && <div className="text-center py-4">Searching...</div>}
            {!isSearching && searchQuery && searchResults.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-lg font-medium mb-2">No issues found</div>
                <div className="text-sm">
                  No issues found in <span className="font-medium">{selectedProject?.name}</span>
                  {selectedIssueTypes.length > 0 && (
                    <span>
                      {" "}for issue type{selectedIssueTypes.length > 1 ? 's' : ''}: {" "}
                      <span className="font-medium">
                        {selectedIssueTypes.map((typeId: string) => {
                          const issueType = availableIssueTypes.find((t: any) => t.id === typeId)
                          return issueType?.name
                        }).filter(Boolean).join(', ')}
                      </span>
                    </span>
                  )}
                  {" "}matching "{searchQuery}"
                </div>
              </div>
            )}
            {searchResults.map((issue: JiraIssue) => {
              const isSelected = selectedIssues.some((i: JiraIssue) => i.id === issue.id)
              return (
                <div key={issue.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2 flex-1">
                    {issue.fields.issuetype.iconUrl && (
                      <Image
                        src={issue.fields.issuetype.iconUrl}
                        alt={issue.fields.issuetype.name}
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                    )}
                    <div>
                      <div className="font-medium">{issue.key}</div>
                      <div className="text-sm text-muted-foreground">{issue.fields.summary}</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={isSelected ? "destructive" : "default"}
                    onClick={() => toggleIssue(issue)}
                  >
                    {isSelected ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}