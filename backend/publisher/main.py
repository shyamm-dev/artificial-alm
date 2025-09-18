import os
import json
from functions_framework import http
from google.cloud import pubsub_v1
from datetime import datetime, timezone

# Initialize Pub/Sub publisher
publisher = pubsub_v1.PublisherClient()
topic_name = os.environ.get("TOPIC_NAME", "my-topic")
project_id = os.environ.get("GCP_PROJECT")
topic_path = publisher.topic_path(project_id, topic_name)

@http
def handler(request):
    """
    Cloud Run Function: reads JSON body and publishes to Pub/Sub
    """
    try:
        data = request.get_json(silent=True)
        if not data:
            return {"success": False, "error": "Missing JSON body"}, 400

        data["timestamp"] = datetime.now(timezone.utc).isoformat()
        message_bytes = json.dumps(data).encode("utf-8")

        message_id = publisher.publish(topic_path, message_bytes).result()

        return {"success": True, "messageId": message_id}, 200

    except Exception as e:
        return {"success": False, "error": str(e)}, 500
