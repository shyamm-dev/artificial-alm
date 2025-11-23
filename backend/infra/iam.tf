# Service Account for API Gateway to invoke event dispatcher Cloud Run function

resource "google_service_account" "api_gateway_test_case_gen_sa" {
  account_id   = "api-gateway-test-case-gen-sa"
}

resource "google_cloud_run_service_iam_member" "api_gateway_test_case_gen_sa_event_dispatcher_invoker" {
  service  = google_cloudfunctions2_function.event_dispatcher.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.api_gateway_test_case_gen_sa.email}"
}

#########################################################################################

# Service Account for event dispatcher Cloud Function

resource "google_service_account" "event_dispatcher_cloud_function_sa" {
  account_id   = "event-dispatcher-cf-sa"
}

resource "google_pubsub_topic_iam_member" "event_dispatcher_cloud_function_sa_testcase_generation_events_publisher" {
  topic  = google_pubsub_topic.testcase_generation_issue_events.name
  role   = "roles/pubsub.publisher"
  member = "serviceAccount:${google_service_account.event_dispatcher_cloud_function_sa.email}"
}

#########################################################################################

# Service Account for Test Case Gen Cloud Function

resource "google_service_account" "test_case_gen_cloud_function_sa" {
  account_id   = "test-case-gen-cf-sa"
}

#########################################################################################

# Service account for Eventarc trigger/ Subscription

resource "google_service_account" "testcase_gen_eventarc_sa" {
  account_id   = "testcase-gen-eventarc-ps-sa"
}

# Grant Eventarc SA permission to invoke Cloud Function
resource "google_cloud_run_service_iam_member" "testcase_gen_eventarc_invoker" {
  service  = google_cloudfunctions2_function.test_case_gen.name
  location = google_cloudfunctions2_function.test_case_gen.location
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.testcase_gen_eventarc_sa.email}"
}

# resource "google_cloud_run_service_iam_member" "compliance_invoker" {
#   service  = google_cloudfunctions2_function.compliance_test_case_gen.name
#   location = google_cloudfunctions2_function.compliance_test_case_gen.location
#   role     = "roles/run.invoker"
#   member   = "serviceAccount:${google_service_account.testcase_gen_eventarc_sa.email}"
# }


# Grant Eventarc SA permission to receive Pub/Sub messages
resource "google_pubsub_topic_iam_member" "testcase_gen_eventarc_subscriber" {
  topic  = google_pubsub_topic.testcase_generation_issue_events.name
  role   = "roles/pubsub.subscriber"
  member = "serviceAccount:${google_service_account.testcase_gen_eventarc_sa.email}"
}

# Grant Eventarc SA token creator role
resource "google_project_iam_member" "testcase_gen_eventarc_token_creator" {
  project = var.project_id
  role    = "roles/iam.serviceAccountTokenCreator"
  member  = "serviceAccount:${google_service_account.testcase_gen_eventarc_sa.email}"
}