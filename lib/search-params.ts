export function getPaginationParams(searchParams: Record<string, string | string[] | undefined>) {
  const page = Number(searchParams.page) || 1
  const pageSize = Number(searchParams.per_page) || 10
  const search = searchParams.search as string || ""
  const sortBy = searchParams.sortBy as string || ""
  const sortOrder = (searchParams.sortOrder as 'asc' | 'desc') || 'desc'
  const status = searchParams.status as string || ""
  const projectId = searchParams.projectId as string || ""
  const jobName = searchParams.jobName as string || ""
  
  return { page, pageSize, search, sortBy, sortOrder, status, projectId, jobName }
}