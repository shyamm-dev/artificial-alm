"use client"

import { Button } from "@/components/ui/button"

interface AccessDeniedProps {
  tab: string
}

export function AccessDenied({ tab }: AccessDeniedProps) {
  return (
    <div className="px-4 lg:px-6">
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">The issue doesn&apos;t exist or you don&apos;t have access to it.</p>
        <Button onClick={() => window.location.href = `/scheduler?tab=${tab}`}>
          Back to Scheduler
        </Button>
      </div>
    </div>
  )
}
