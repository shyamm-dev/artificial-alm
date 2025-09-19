resource "google_service_account" "api_gateway_test_case_gen_sa" {
  account_id   = "api-gateway-test-case-gen-sa"
  display_name = "API Gateway Service Account for Cloud Run"
  description  = "Service account used by API Gateway to invoke Cloud Run services"
}

resource "google_cloud_run_service_iam_member" "event_dispatcher_cloud_function_invoker" {
  service  = google_cloudfunctions2_function.event_dispatcher.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.api_gateway_test_case_gen_sa.email}"
}
