"""Event Dispatcher: Cloud Run Function to publish messages to Pub/Sub."""
import os
import json
from datetime import datetime, timezone
from typing import Any, Dict, Tuple

from functions_framework import http
from flask import Request
from google.cloud import pubsub_v1
from google.api_core.exceptions import GoogleAPICallError, RetryError, NotFound, Forbidden

publisher: pubsub_v1.PublisherClient = pubsub_v1.PublisherClient()
topic_name: str = os.environ.get("TOPIC_NAME", "")
project_id: str = os.environ.get("PROJECT_ID", "")
topic_path: str = publisher.topic_path(project_id, topic_name)


@http
def handler(request: Request) -> Tuple[Dict[str, Any], int]:
    try:
        data: Dict[str, Any] | None = request.get_json(silent=True)

        if not data:
            return {"success": False, "error": "Missing JSON body"}, 400

        job_id: str = data.get("jobId")
        issue_ids: list[str] = data.get("issueIds")

        unprocessed_issues: list[str] = []

        for issue_id in issue_ids:
            try:
                # Add timestamp for tracking
                event = {
                    "jobId": job_id,
                    "issueId": issue_id,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
                message_bytes: bytes = json.dumps(event).encode("utf-8")
                publisher.publish(topic_path, message_bytes)
            except (GoogleAPICallError, RetryError, NotFound, Forbidden) as e:
                unprocessed_issues.append([issue_id, str(e)])

        response_data: Dict[str, Any] = {
            "success": True,
            "errors": len(unprocessed_issues) > 0,
            "unprocessedIssues": unprocessed_issues,
        }
        return response_data, 200

    except Exception as e:
        return {"success": False, "error": str(e)}, 500
