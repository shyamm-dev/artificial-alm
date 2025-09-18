import { Button } from "@/components/ui/button"
import { getScheduledJobIssues } from "@/db/queries/scheduled-jobs-queries"
import { getServerSession } from "@/lib/get-server-session"
import { Plus } from "lucide-react"
import Link from "next/link"
import DataTable from "./data-table"
import { columns } from "./columns"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { redirect } from "next/navigation"


export default async function SchedulerPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const { data: scheduledJobIssues } = await getScheduledJobIssues(session.user.id, { page: 1, pageSize: 10 })

  return (
    <>
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Scheduled Job Issues</h1>
          <Link href={"/scheduler/new"}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Job
            </Button>
          </Link>
        </div>
        <div className="mt-8">
          <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
            <DataTable columns={columns} data={scheduledJobIssues} />
          </Suspense>
        </div>
      </div>
    </>
  )
}
