
resource "google_eventarc_trigger" "testcase_gen_pubsub_trigger" {
  name     = "testcase-gen-cloud-function-trigger"
  location = var.region
  
  matching_criteria {
    attribute = "type"
    value     = "google.cloud.pubsub.topic.v1.messagePublished"
  }
  
  destination {
    cloud_run_service {
      service = google_cloudfunctions2_function.test_case_gen.name
      region  = var.region
    }
  }

  transport {
    pubsub {
      topic = "projects/${var.project_id}/topics/${google_pubsub_topic.testcase_generation_issue_events.name}"
    }
  }
  
  service_account = google_service_account.testcase_gen_eventarc_sa.email

}

##########################################################################################

resource "google_pubsub_subscription" "compliance_testcase_gen_push_sub" {
  name  = "compliance-testcase-gen-push-sub"
  topic = google_pubsub_topic.testcase_generation_issue_events.name

  push_config {
    push_endpoint = google_cloudfunctions2_function.compliance_test_case_gen.service_config[0].uri

    oidc_token {
      service_account_email = google_service_account.testcase_gen_eventarc_sa.email
      audience              = google_cloudfunctions2_function.compliance_test_case_gen.service_config[0].uri
    }
  }

  ack_deadline_seconds = 120

  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "160s"
  }

  # dead_letter_policy {
  #   dead_letter_topic     = google_pubsub_topic.testcase_gen_dlq.id
  #   max_delivery_attempts = 5
  # }
}
