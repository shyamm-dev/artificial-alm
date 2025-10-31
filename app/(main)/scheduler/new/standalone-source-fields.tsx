"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { CheckIcon, ChevronsUpDownIcon, FolderIcon, PlusIcon, Trash2Icon, FileIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { UseFormReturn, FieldValues } from "react-hook-form"

interface StandaloneProject {
  id: string
  name: string
  description: string | null
  compliance: { frameworks: string[] } | null
}

interface StandaloneSourceFieldsProps {
  form: UseFormReturn<FieldValues>
  projects: StandaloneProject[]
  validateRef: React.RefObject<{ validate: () => boolean; getRequirements: () => Requirement[] }>
}

interface Requirement {
  id: string
  name: string
  content: string
  file: File | null
  nameError?: string
  contentError?: string
}

export function StandaloneSourceFields({ form, projects, validateRef }: StandaloneSourceFieldsProps) {
  const [open, setOpen] = useState(false)
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [showErrors, setShowErrors] = useState(false)
  const selectedProject = form.watch("projectId")
  const currentProject = projects.find(p => p.id === selectedProject)

  useEffect(() => {
    if (validateRef.current) {
      validateRef.current.getRequirements = () => requirements
      validateRef.current.validate = () => {
        setShowErrors(true)
        if (requirements.length === 0) return false
        const updatedRequirements = requirements.map(req => {
          const nameError = !req.name ? "Name is required" : req.name.length < 3 ? "Name must be at least 3 characters" : undefined
          const contentError = !req.content && !req.file ? "Either content or file is required" : undefined
          return { ...req, nameError, contentError }
        })
        setRequirements(updatedRequirements)
        return updatedRequirements.every(req => !req.nameError && !req.contentError)
      }
    }
  }, [requirements, validateRef])

  const addRequirement = () => {
    setRequirements([...requirements, { id: crypto.randomUUID(), name: "", content: "", file: null }])
  }

  const removeRequirement = (id: string) => {
    setRequirements(requirements.filter(req => req.id !== id))
  }

  const updateRequirement = (id: string, field: keyof Requirement, value: string | File | null) => {
    setRequirements(requirements.map(req => {
      if (req.id === id) {
        const updated = { ...req, [field]: value }
        if (showErrors) {
          updated.nameError = !updated.name ? "Name is required" : updated.name.length < 3 ? "Name must be at least 3 characters" : undefined
          updated.contentError = !updated.content && !updated.file ? "Either content or file is required" : undefined
        }
        return updated
      }
      return req
    }))
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="projectId"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-base">Project</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground",
                          fieldState.error && "!border-destructive"
                        )}
                      >
                        <span className="truncate">
                          {field.value
                            ? projects.find((project) => project.id === field.value)?.name
                            : projects.length === 0 ? "None" : "Select project..."}
                        </span>
                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-screen max-w-md p-0">
                    <Command>
                      <CommandInput placeholder="Search project..." />
                      <CommandList>
                        <CommandEmpty>No project found.</CommandEmpty>
                        <CommandGroup>
                          {projects.map((project) => (
                            <CommandItem
                              value={project.name}
                              key={project.id}
                              onSelect={() => {
                                form.setValue("projectId", project.id)
                                form.clearErrors("projectId")
                                setOpen(false)
                              }}
                              className="flex justify-start"
                            >
                              <div className="flex justify-between items-center w-full">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <FolderIcon className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{project.name}</span>
                                </div>
                                <CheckIcon
                                  className={cn("h-4 w-4",
                                    project.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          {currentProject && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Compliance:</span>
              {currentProject.compliance?.frameworks?.length ? (
                <div className="flex flex-wrap gap-1">
                  {currentProject.compliance.frameworks.map((framework, index) => (
                    <Badge key={index} variant="secondary">
                      {framework}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">NA</span>
              )}
            </div>
          )}
        </div>
      </div>
      <Separator />
      <div className="space-y-4">
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRequirement}
            disabled={!selectedProject}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Requirement
          </Button>
        </div>
        {showErrors && requirements.length === 0 && (
          <p className="text-sm text-destructive text-center">At least one requirement is needed</p>
        )}
        {requirements.length > 0 && (
          <Accordion type="single" collapsible className="space-y-4">
            {requirements.map((requirement, index) => (
            <AccordionItem key={requirement.id} value={requirement.id} className={cn("border rounded-lg px-4", showErrors && (requirement.nameError || requirement.contentError) && "border-destructive")}>
              <AccordionTrigger className={cn(showErrors && (requirement.nameError || requirement.contentError) && "text-destructive")}>
                <div className="flex items-center gap-2">
                  <span>{requirement.name || `Requirement ${index + 1}`}</span>
                  {showErrors && (requirement.nameError || requirement.contentError) && <span className="text-sm">(This requirement has errors)</span>}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-base font-medium block">Name</label>
                    <Input
                      placeholder="Enter requirement name"
                      value={requirement.name}
                      onChange={(e) => updateRequirement(requirement.id, "name", e.target.value)}
                      className={cn(requirement.nameError && "border-destructive")}
                    />
                    {requirement.nameError && (
                      <p className="text-sm text-destructive">{requirement.nameError}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-base font-medium block">Content</label>
                    <Textarea
                      placeholder="Enter requirement content"
                      value={requirement.content}
                      onChange={(e) => updateRequirement(requirement.id, "content", e.target.value)}
                      className={cn("max-h-48 overflow-y-auto", requirement.contentError && "border-destructive")}
                    />
                    {requirement.contentError && (
                      <p className="text-sm text-destructive">{requirement.contentError}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-base font-medium block">Upload File</label>
                    <div className="border-2 border-dashed rounded-lg p-6">
                      <div className="flex flex-col gap-2 items-center">
                        <FileIcon className="w-12 h-12 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Drag and drop a file or click to browse</span>
                        <span className="text-xs text-muted-foreground">PDF or DOCX, max 5MB</span>
                      </div>
                      <div className="flex justify-center items-center gap-2 mt-4">
                        <label htmlFor={`file-${requirement.id}`}>
                          <Button type="button" variant="outline" size="sm" asChild>
                            <span className="cursor-pointer">
                              {requirement.file ? requirement.file.name : "Choose File"}
                            </span>
                          </Button>
                        </label>
                        {requirement.file && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              updateRequirement(requirement.id, "file", null)
                              const input = document.getElementById(`file-${requirement.id}`) as HTMLInputElement
                              if (input) input.value = ""
                            }}
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        )}
                        <Input
                          id={`file-${requirement.id}`}
                          type="file"
                          accept=".pdf,.docx"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                alert("File size must be less than 5MB")
                                e.target.value = ""
                                return
                              }
                              updateRequirement(requirement.id, "file", file)
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRequirement(requirement.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2Icon className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </>
  )
}
