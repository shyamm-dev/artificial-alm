
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
