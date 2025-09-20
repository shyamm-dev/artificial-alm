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
    print("Received request:", request)
    return {"success": True}, 200