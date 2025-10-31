import { db } from "@/db/drizzle";
import { standaloneScheduledJob, standaloneScheduledJobRequirement } from "@/db/schema/standalone-scheduled-jobs-schema";
import { standaloneProject } from "@/db/schema/standalone-project-schema";
import { eq, and, desc, asc, count, like, or } from "drizzle-orm";
import type { StandaloneScheduledJobIssueStatus } from "@/constants/shared-constants";

export async function getStandaloneScheduledJobRequirements(
  userId: string,
  pagination: { page: number; pageSize: number },
  filters?: { search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'; status?: string; projectId?: string; jobName?: string }
) {
  const whereClause = and(
    eq(standaloneProject.userId, userId),
    filters?.projectId ? eq(standaloneScheduledJob.projectId, filters.projectId) : undefined,
    filters?.search ? or(
      like(standaloneScheduledJobRequirement.name, `%${filters.search}%`),
      like(standaloneScheduledJobRequirement.content, `%${filters.search}%`)
    ) : undefined,
    filters?.status ? eq(standaloneScheduledJobRequirement.status, filters.status as StandaloneScheduledJobIssueStatus) : undefined,
    filters?.jobName ? like(standaloneScheduledJob.name, `%${filters.jobName}%`) : undefined
  )

  return Promise.all([
    db.select({
      id: standaloneScheduledJobRequirement.id,
      requirementName: standaloneScheduledJobRequirement.name,
      status: standaloneScheduledJobRequirement.status,
      reason: standaloneScheduledJobRequirement.reason,
      jobName: standaloneScheduledJob.name,
      projectName: standaloneProject.name,
      createdAt: standaloneScheduledJobRequirement.createdAt,
      updatedAt: standaloneScheduledJobRequirement.updatedAt
    })
      .from(standaloneScheduledJobRequirement)
      .innerJoin(standaloneScheduledJob, eq(standaloneScheduledJobRequirement.jobId, standaloneScheduledJob.id))
      .innerJoin(standaloneProject, eq(standaloneScheduledJob.projectId, standaloneProject.id))
      .where(whereClause)
      .orderBy(
        filters?.sortBy === 'createdAt'
          ? (filters.sortOrder === 'asc' ? asc(standaloneScheduledJobRequirement.createdAt) : desc(standaloneScheduledJobRequirement.createdAt))
          : filters?.sortBy === 'updatedAt'
          ? (filters.sortOrder === 'asc' ? asc(standaloneScheduledJobRequirement.updatedAt) : desc(standaloneScheduledJobRequirement.updatedAt))
          : desc(standaloneScheduledJobRequirement.createdAt)
      )
      .limit(pagination.pageSize ?? 10)
      .offset(((pagination.page ?? 1) - 1) * (pagination.pageSize ?? 10)),

    db.select({ total: count() })
      .from(standaloneScheduledJobRequirement)
      .innerJoin(standaloneScheduledJob, eq(standaloneScheduledJobRequirement.jobId, standaloneScheduledJob.id))
      .innerJoin(standaloneProject, eq(standaloneScheduledJob.projectId, standaloneProject.id))
      .where(whereClause)
  ]).then(([data, [{ total }]]) => ({ data, total }))
}

export async function getStandaloneUserProjects(userId: string) {
  return db.select({
    id: standaloneProject.id,
    name: standaloneProject.name
  })
    .from(standaloneProject)
    .where(eq(standaloneProject.userId, userId))
    .orderBy(standaloneProject.name)
}

export async function getStandaloneJobNames(userId: string) {
  const result = await db.select({
    name: standaloneScheduledJob.name
  })
    .from(standaloneScheduledJob)
    .innerJoin(standaloneProject, eq(standaloneScheduledJob.projectId, standaloneProject.id))
    .where(eq(standaloneProject.userId, userId))
    .groupBy(standaloneScheduledJob.name)
    .orderBy(standaloneScheduledJob.name)

  return result.map(r => r.name)
}

export async function getStandaloneRequirementNames(userId: string) {
  return db.selectDistinct({
    requirementName: standaloneScheduledJobRequirement.name
  })
    .from(standaloneScheduledJobRequirement)
    .innerJoin(standaloneScheduledJob, eq(standaloneScheduledJobRequirement.jobId, standaloneScheduledJob.id))
    .innerJoin(standaloneProject, eq(standaloneScheduledJob.projectId, standaloneProject.id))
    .where(eq(standaloneProject.userId, userId))
    .orderBy(standaloneScheduledJobRequirement.name)
}
