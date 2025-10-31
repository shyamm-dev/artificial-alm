import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/get-server-session"
import { standaloneScheduledJob, standaloneScheduledJobRequirement, standaloneProject } from "@/db/schema"
import { eq } from "drizzle-orm"
import mammoth from "mammoth"
import { db } from "@/db/drizzle"
import extract from "pdf-extraction"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const jobName = formData.get("jobName") as string
    const projectId = formData.get("projectId") as string

    if (!jobName || !projectId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify user has access to the project
    const [project] = await db
      .select({ userId: standaloneProject.userId })
      .from(standaloneProject)
      .where(eq(standaloneProject.id, projectId))
      .limit(1)

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized to access this project" }, { status: 403 })
    }

    // Parse requirements from FormData
    const requirements: Array<{ name: string; content: string; file?: File }> = []
    let index = 0
    while (formData.has(`requirements[${index}][name]`)) {
      const name = formData.get(`requirements[${index}][name]`) as string
      const content = formData.get(`requirements[${index}][content]`) as string
      const file = formData.get(`requirements[${index}][file]`) as File | null

      requirements.push({ name, content, ...(file && { file }) })
      index++
    }

    // Extract file content and concatenate with text content
    const processedRequirements = await Promise.all(
      requirements.map(async (req) => {
        let finalContent = req.content
        let status: "pending" | "failed" = "pending"
        let reason: string | null = null

        if (req.file) {
          let extractedText = ""

          if (req.file.type === "application/pdf") {
            try {
              const buffer = Buffer.from(await req.file.arrayBuffer())
              const data = await extract(buffer)
              extractedText = data.text
            } catch (error) {
              console.error("PDF parsing error:", error)
              status = "failed"
              reason = `PDF parsing failed: ${error instanceof Error ? error.message : String(error)}`
            }
          } else if (req.file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            try {
              const buffer = Buffer.from(await req.file.arrayBuffer())
              const result = await mammoth.extractRawText({ buffer })
              extractedText = result.value
            } catch (error) {
              console.error("DOCX parsing error:", error)
              status = "failed"
              reason = `DOCX parsing failed: ${error instanceof Error ? error.message : String(error)}`
            }
          }

          finalContent = finalContent ? `${finalContent}\n\n${extractedText}` : extractedText
        }

        return { name: req.name, content: finalContent, status, reason }
      })
    )

    // Create job and requirements in database
    const [job] = await db.insert(standaloneScheduledJob).values({
      name: jobName,
      projectId,
      createdByUserId: session.user.id,
    }).returning()

    await db.insert(standaloneScheduledJobRequirement).values(
      processedRequirements.map((req) => ({
        jobId: job.id,
        name: req.name,
        content: req.content,
        status: req.status,
        reason: req.reason,
      }))
    )

    return NextResponse.json({ message: "Job scheduled successfully", jobId: job.id })
  } catch (error) {
    console.error("Schedule standalone job error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
