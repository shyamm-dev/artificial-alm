export function getPaginationParams(searchParams: Record<string, string | string[] | undefined>) {
  const page = Number(searchParams.page) || 1
  const pageSize = Number(searchParams.per_page) || 10
  
  return { page, pageSize }
}