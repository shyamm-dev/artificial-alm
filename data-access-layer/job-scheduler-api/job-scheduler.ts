
interface JobSchedulerResponse {
  success: boolean;
  errors: boolean;
  unprocessedIssues: [string, string][];
}

export default async function scheduledAiTestcaseGenJob(issueIds: string[]): Promise<JobSchedulerResponse> {
  const response = await fetch(`${process.env.JOB_SCHEDULER_ENDPOINT}/dispatch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.JOB_SCHEDULER_API_KEY!
    },
    body: JSON.stringify({ issueIds })
  });

  if (!response.ok) {
    throw new Error(`Job scheduler API error: ${response.status}`);
  }

  return response.json();
};
