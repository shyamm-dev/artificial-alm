import { getServerSession } from "@/lib/get-server-session"
import { getUserAccessibleProjects } from "@/db/queries/user-project-queries"
import { getStandaloneProjects } from "@/db/queries/standalone-project-queries"
import { redirect } from "next/navigation"
import { ScheduleJob } from "./schedule-job"

export default async function NewSchedulerJobPage() {
  const session = await getServerSession()
  if (!session) redirect("/login")

  const userProjectsPromise = getUserAccessibleProjects(session.user.id)
  const standaloneProjectsPromise = getStandaloneProjects(session.user.id)

  return (
    <div className="px-4 lg:px-6">
      <ScheduleJob 
        userProjectsPromise={userProjectsPromise}
        standaloneProjectsPromise={standaloneProjectsPromise}
      />
    </div>
  )
}
