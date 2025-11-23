"""TestCaseGen: Cloud Run Function to Generate test cases."""
import os
import base64
import json
from typing import Any, Dict, Tuple

from functions_framework import http
from flask import Request

from .database import Database
from .issue_repository import IssueRepository, JIRAIssueRepository, ManualUploadIssueRepository
from .google_gen_ai import GoogleGenAI
from .compliance_gen_ai import ComplianceTestCaseGeneration
from .schema import FNFTestCaseGenResponseSchema

TURSO_DATABASE_URL = os.getenv("TURSO_DATABASE_URL")
TURSO_AUTH_TOKEN = os.getenv("TURSO_AUTH_TOKEN")
GOOGLE_CLOUD_API_KEY = os.getenv("GOOGLE_CLOUD_API_KEY")


@http
def handler(request: Request) -> Tuple[Dict[str, Any], int]:
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
            compliance_list_string, summary, description = repo.fetch_issue_data(issue_id)

            compliance_list = json.loads(compliance_list_string) if compliance_list_string else []

            repo.update_issue_status("in_progress", issue_id)

            prompt = generate_markdown_format(summary, description, compliance_list)

            fnf_response = generate_functional_non_functional_test_cases(prompt)

            compliance_response = ComplianceTestCaseGeneration(GOOGLE_CLOUD_API_KEY).generate(prompt)

            if not fnf_response.get("success"):
                reason = fnf_response.get("issue", "Unknown error")
                repo.update_issue_status_with_reason("failed", reason, issue_id)
                return {"success": True}, 200

            test_cases = fnf_response.get("data", []) + compliance_response.get("data", [])

            repo.insert_issue_test_cases(issue_id, test_cases)
            repo.update_issue_status("completed", issue_id)

        except Exception as e:
            repo.update_issue_status_with_reason("failed", str(e), issue_id)

    return {"success": True}, 200


def generate_markdown_format(summary: str, description: str, frameworks: list = None) -> str:
    base_template = """**Requirement Title**
- {summary}
 
**Requirement Description**
 - {description}"""

    # Conditionally add compliance section
    if frameworks and len(frameworks):
        compliance_section = """
 
**Compliance Requirements** 
- {frameworks}"""

        template = base_template + compliance_section
    else:
        template = base_template

    return template.format(
        summary=summary,
        description=description,
        frameworks=", ".join(frameworks)
    )

def generate_functional_non_functional_test_cases(prompt):
    vertex_ai = GoogleGenAI(GOOGLE_CLOUD_API_KEY)
    with open("./system_instruction.md", "r", encoding='utf-8') as f:
        system_instruction = f.read()

    response_text = vertex_ai.generate([("user", prompt)],
                                       system_instruction,
                                       schema=FNFTestCaseGenResponseSchema.get_schema())
    response_json = json.loads(response_text)
    return response_json
