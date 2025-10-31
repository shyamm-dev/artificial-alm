import { JiraTable } from "./jira-table"
import { getScheduledJobIssues } from "@/db/queries/scheduled-jobs-queries"

interface JiraProjectsProgressProps {
  dataPromise: Promise<[
    Awaited<ReturnType<typeof getScheduledJobIssues>>,
    { id: string; name: string; key: string; avatarUrl: string | null }[],
    string[],
    { issueKey: string; summary: string; issueTypeIconUrl: string | null; issueTypeName: string | null }[]
  ]>
  searchParams: Record<string, string | string[] | undefined>
}

export function JiraProjectsProgress({ dataPromise, searchParams }: JiraProjectsProgressProps) {
  return <JiraTable dataPromise={dataPromise} searchParams={searchParams} />
}
