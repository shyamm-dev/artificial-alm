"""TestCaseGen: Cloud Run Function to Generate test cases."""
import os
import base64
import json
from typing import Any, Dict, Tuple

from functions_framework import http
from flask import Request

from .database import Database
from .google_gen_ai import GoogleGenAI

TURSO_DATABASE_URL = os.getenv("TURSO_DATABASE_URL")
TURSO_AUTH_TOKEN = os.getenv("TURSO_AUTH_TOKEN")
GOOGLE_CLOUD_API_KEY = os.getenv("GOOGLE_CLOUD_API_KEY")

@http
def handler(request: Request) -> Tuple[Dict[str, Any], int]:
    """HTTP Cloud Run Function to generate test cases."""
    data: Dict[str, Any] | None = request.get_json(silent=True)
    pubsub_message = base64.b64decode(data).decode()
    message_data = json.loads(pubsub_message)

    issue_id: str = message_data.get("issueId")
    try:
        database = Database(TURSO_DATABASE_URL, TURSO_AUTH_TOKEN)
    except Exception as e:
        return {"error": f"Database connection failed: {str(e)}"}, 500

    try:
        compliance_list_string, summary, description = database.fetch_issue_data(issue_id)

        compliance_list = json.loads(compliance_list_string)

        database.update_status("in_progress", issue_id)

        vertex_ai = GoogleGenAI(GOOGLE_CLOUD_API_KEY)

        prompt = generate_markdown_format(summary, description, compliance_list)
        with open("./system_instruction.md", "r", encoding='utf-8') as f:
            system_instruction = f.read()

        response_text = vertex_ai.generate(prompt, system_instruction)

        response_json = json.loads(response_text)

        if not response_json.get("success"):
            reason = response_json.get("issue", "Unknown error")
            database.update_status_with_reason("failed", reason, issue_id)
            return {"success": True}, 200

        # Process the generated test cases as needed


    except Exception as e:
        database.update_status_with_reason("failed", str(e), issue_id)
    finally:
        database.close_connection()
    return {"success": True}, 200


def generate_markdown_format(summary: str, description: str, frameworks: list = None) -> str:
    base_template = """**Summary / Title**
- {summary}
 
**Description / User Story**
 - {description}"""

    # Conditionally add compliance section
    if frameworks and len(frameworks):
        compliance_section = """
 
**Compliance** 
- {frameworks}"""

        template = base_template + compliance_section
    else:
        template = base_template

    return template.format(
        summary=summary,
        description=description,
        frameworks=", ".join(frameworks)
    )
