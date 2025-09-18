"use client"

import { Button } from "@/components/ui/button"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface SortableHeaderProps {
  title: string
  sortKey: string
}

export function SortableHeader({ title, sortKey }: SortableHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get("sortBy")
  const currentOrder = searchParams.get("sortOrder") || "desc"

  const handleSort = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (currentSort === sortKey) {
      // Toggle order if same column
      params.set("sortOrder", currentOrder === "asc" ? "desc" : "asc")
    } else {
      // New column, default to desc
      params.set("sortBy", sortKey)
      params.set("sortOrder", "desc")
    }
    params.set("page", "1")
    
    router.push(`?${params.toString()}`)
  }

  const getSortIcon = () => {
    if (currentSort !== sortKey) return <ArrowUpDown className="ml-2 h-4 w-4" />
    return currentOrder === "asc" 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />
  }

  return (
    <Button
      variant="ghost"
      onClick={handleSort}
      className="h-auto p-0 font-semibold hover:bg-transparent"
    >
      {title}
      {getSortIcon()}
    </Button>
  )
}