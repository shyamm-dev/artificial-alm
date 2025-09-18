export function getPaginationParams(searchParams: Record<string, string | string[] | undefined>) {
  const page = Number(searchParams.page) || 1
  const pageSize = Number(searchParams.per_page) || 10
  const search = searchParams.search as string || ""
  const sortBy = searchParams.sortBy as string || ""
  const sortOrder = (searchParams.sortOrder as 'asc' | 'desc') || 'desc'
  
  return { page, pageSize, search, sortBy, sortOrder }
}