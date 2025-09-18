"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PaginationProps {
  total: number
  page: number
  pageSize: number
}

export function Pagination({ total, page, pageSize }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (newPage: number, newPageSize?: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newPageSize !== undefined) {
      params.set("per_page", newPageSize.toString())
      params.set("page", "1")
    } else {
      params.set("page", newPage.toString())
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        {total} total records
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">Rows per page</span>
        <Select defaultValue="10" value={pageSize.toString()} onValueChange={(value) => {
            const newPageSize = Number(value);
            handlePageChange(page, newPageSize);
        }}>
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50].map((p) => (
              <SelectItem key={p} value={p.toString()}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(total / pageSize)}</span>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={page <= 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= Math.ceil(total / pageSize)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.ceil(total / pageSize))}
            disabled={page >= Math.ceil(total / pageSize)}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
