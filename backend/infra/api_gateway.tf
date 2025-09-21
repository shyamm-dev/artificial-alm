resource "google_api_gateway_api" "testcase_generation_event_dispatcher_api" {
  provider = google-beta
  api_id = "testcase-generation-event-dispatcher-api"
}

resource "google_api_gateway_api_config" "testcase_generation_event_dispatcher_api_config" {
  provider = google-beta
  api      = google_api_gateway_api.testcase_generation_event_dispatcher_api.api_id
  api_config_id = "v2"

  openapi_documents {
    document {
      path = "openapi.yaml"
      contents = base64encode(templatefile("openapi.yaml", {
        backend_url = google_cloudfunctions2_function.event_dispatcher.url

      }))
    }
  }
  gateway_config {
    backend_config {
      google_service_account = google_service_account.api_gateway_test_case_gen_sa.email
    }
  }
  lifecycle {
    create_before_destroy = true
  }
}

resource "google_api_gateway_gateway" "testcase_generation_event_dispatcher_api_gateway" {
  provider = google-beta
  gateway_id = "testcase-generation-event-dispatcher-api-gateway"
  api_config = google_api_gateway_api_config.testcase_generation_event_dispatcher_api_config.id
}
