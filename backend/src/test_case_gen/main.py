"""TestCaseGen: Cloud Run Function to Generate test cases."""
import os
import base64
import json
import traceback
import asyncio
from typing import Any, Dict, Tuple

from functions_framework import http
from flask import Request

from .database import Database
from .issue_repository import IssueRepository, JIRAIssueRepository, ManualUploadIssueRepository
from .compliance_gen_ai import ComplianceTestCaseGeneration
from .functional_gen_ai import FNFTestCaseGeneration

TURSO_DATABASE_URL = os.getenv("TURSO_DATABASE_URL")
TURSO_AUTH_TOKEN = os.getenv("TURSO_AUTH_TOKEN")
GOOGLE_CLOUD_API_KEY = os.getenv("GOOGLE_CLOUD_API_KEY")

@http
def handler(request: Request) -> Tuple[Dict[str, Any], int]:
    return asyncio.run(async_handler(request))

async def async_handler(request: Request) -> Tuple[Dict[str, Any], int]:
    """HTTP Cloud Run Function to generate test cases."""

    data: Dict[str, Any] | None = request.get_json(silent=True)
    pubsub_message = base64.b64decode(data["message"]["data"]).decode()
    message_data = json.loads(pubsub_message)

    issue_id: str = message_data.get("issueId")
    source: str = message_data.get("source")

    with Database(TURSO_DATABASE_URL, TURSO_AUTH_TOKEN) as conn:

        if source == "jira":
            repo: IssueRepository = JIRAIssueRepository(conn)
        else:
            repo: IssueRepository = ManualUploadIssueRepository(conn)

        try:
            compliance_list_string, custom_rules, summary, description = repo.fetch_issue_data(issue_id)

            compliance_list = json.loads(compliance_list_string) if compliance_list_string else []

            repo.update_issue_status("in_progress", issue_id)

            prompt = generate_markdown_format(summary, description)

            # Run both test case generations concurrently
            fnf_response, compliance_response = await asyncio.gather(
                FNFTestCaseGeneration(GOOGLE_CLOUD_API_KEY).generate(prompt),
                ComplianceTestCaseGeneration(GOOGLE_CLOUD_API_KEY).generate(prompt, project_compliance=compliance_list, project_custom_rules=custom_rules)
            )

            if not fnf_response.get("success"):
                reason = fnf_response.get("issue", "Unknown error")
                repo.update_issue_status_with_reason("failed", reason, issue_id)
                return {"success": True}, 200

            test_cases = fnf_response.get("data", []) + compliance_response.get("data", [])

            repo.insert_issue_test_cases(issue_id, test_cases)
            repo.update_issue_status("completed", issue_id)

        except Exception as e:
            traceback.print_exc()
            repo.update_issue_status_with_reason("failed", str(e), issue_id)

    return {"success": True}, 200


def generate_markdown_format(summary: str, description: str) -> str:
    template = """**Requirement Title**
- {summary}
 
**Requirement Description**
 - {description}"""

    return template.format(
        summary=summary,
        description=description,
    )
