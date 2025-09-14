import { getServerSession } from "@/lib/get-server-session"
import { getUserAccessibleProjects } from "@/db/queries/user-project-queries"
import { redirect } from "next/navigation"
import { ScheduleJob } from "./schedule-job"

export default async function NewSchedulerJobPage() {
  const session = await getServerSession()
  if (!session) redirect("/login")

  const userProjectsPromise = getUserAccessibleProjects(session.user.id);

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Schedule New Job</h1>
        <p className="text-muted-foreground">Create a new scheduled job for testcase generation</p>
      </div>
      <ScheduleJob userProjectsPromise={userProjectsPromise} />
    </div>
  )
}
