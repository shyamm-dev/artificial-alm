"use client"

import { Button } from "@/components/ui/button"
import { FilterX } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export function ClearFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const hasFilters = searchParams.get("search") || searchParams.get("status") || searchParams.get("projectId") || searchParams.get("jobName")

  const handleClearFilters = () => {
    const tab = searchParams.get("tab")
    const url = tab ? `${window.location.pathname}?tab=${tab}` : window.location.pathname
    router.push(url)
  }

  if (!hasFilters) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClearFilters}
      className="h-10 w-full sm:w-auto"
    >
      <FilterX className="h-4 w-4 mr-2" />
      Clear Filters
    </Button>
  )
}