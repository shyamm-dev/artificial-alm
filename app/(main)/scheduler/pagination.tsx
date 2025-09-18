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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="text-sm text-muted-foreground text-center sm:text-left">
        {total} total records
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page</span>
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
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">Page {page} of {Math.ceil(total / pageSize)}</span>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={page <= 1}
            className="h-8 w-8 p-0 sm:h-9 sm:w-9"
          >
            <ChevronsLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="h-8 w-8 p-0 sm:h-9 sm:w-9"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= Math.ceil(total / pageSize)}
            className="h-8 w-8 p-0 sm:h-9 sm:w-9"
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.ceil(total / pageSize))}
            disabled={page >= Math.ceil(total / pageSize)}
            className="h-8 w-8 p-0 sm:h-9 sm:w-9"
          >
            <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
