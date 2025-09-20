provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# --------------------
# Cloud Run Service (placeholder container)
# Replace image with your function/container
# --------------------
# resource "google_cloud_run_service" "vertex_ai_invoker" {
#   name     = "vertex-ai-invoker"
#   location = var.region

#   template {
#     spec {
#       containers {
#         image = "gcr.io/cloudrun/hello" # replace with your image
#       }
#     }
#   }
# }

# # Allow unauthenticated invocations (optional)
# resource "google_cloud_run_service_iam_member" "all_users" {
#   service  = google_cloud_run_service.vertex_ai_invoker.name
#   location = var.region
#   role     = "roles/run.invoker"
#   member   = "allUsers"
# }

# # --------------------
# # Eventarc Trigger (Pub/Sub → Cloud Run)
# # --------------------
# resource "google_eventarc_trigger" "pubsub_to_run" {
#   name     = "testcase-job-trigger"
#   location = var.region

#   matching_criteria {
#     attribute = "type"
#     value     = "google.cloud.pubsub.topic.v1.messagePublished"
#   }

#   transport {
#     pubsub {
#       topic = google_pubsub_topic.testcase_jobs.id
#     }
#   }

#   destination {
#     cloud_run_service {
#       service = google_cloud_run_service.vertex_ai_invoker.name
#       region  = var.region
#     }
#   }

#   service_account = "projects/${var.project_id}/serviceAccounts/${var.project_id}@appspot.gserviceaccount.com"
# }
