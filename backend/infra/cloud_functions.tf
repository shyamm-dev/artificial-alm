data "archive_file" "event_dispatcher_function_zip" {
  type        = "zip"
  output_path = "build/event-dispatcher-function.zip"
  source_dir  = "${path.module}/../src/event_dispatcher/"
}

locals {
  event_dispatcher_zip_md5 = md5(filebase64(data.archive_file.event_dispatcher_function_zip.output_path))
}

resource "google_storage_bucket_object" "event_dispatcher_function_zip" {
  name   = "event-dispatcher-${local.event_dispatcher_zip_md5}.zip"
  bucket = var.bucket_name
  source = data.archive_file.event_dispatcher_function_zip.output_path

}

resource "google_cloudfunctions2_function" "event_dispatcher" {
  name        = "event-dispatcher"
  location    = var.region
  description = "Dispatches events for testcase generation"

  build_config {
    runtime     = "python313"
    entry_point = "handler"
    source {
      storage_source {
        bucket = var.bucket_name
        object = google_storage_bucket_object.event_dispatcher_function_zip.name
      }
    }
  }

  service_config {
    service_account_email = google_service_account.event_dispatcher_cloud_function_sa.email
    max_instance_count = 3
    available_memory   = "256M"
    timeout_seconds    = 60
    ingress_settings = "ALLOW_ALL"
    environment_variables = {
      TOPIC_NAME = google_pubsub_topic.testcase_generation_issue_events.name
      PROJECT_ID = var.project_id
    }
  }

  

  depends_on = [google_storage_bucket_object.event_dispatcher_function_zip]
}

#########################################################################################

data "archive_file" "test_case_gen_function_zip" {
  type        = "zip"
  output_path = "build/test-case-gen-function.zip"
  source_dir  = "${path.module}/../src/test_case_gen/"
}

locals {
  testcase_gen_zip_md5 = md5(filebase64(data.archive_file.test_case_gen_function_zip.output_path))
}

resource "google_storage_bucket_object" "test_case_gen_function_zip" {
  name   = "test-case-gen-${local.testcase_gen_zip_md5}.zip"
  bucket = var.bucket_name
  source = data.archive_file.test_case_gen_function_zip.output_path

}

resource "google_cloudfunctions2_function" "test_case_gen" {
  name        = "test-case-gen"
  location    = var.region
  description = "Calls generative AI model to create test cases"

  build_config {
    runtime     = "python313"
    entry_point = "handler"
    source {
      storage_source {
        bucket = var.bucket_name
        object = google_storage_bucket_object.test_case_gen_function_zip.name
      }
    }
  }

  service_config {
    service_account_email = google_service_account.test_case_gen_cloud_function_sa.email
    max_instance_count = 3
    available_memory   = "256M"
    timeout_seconds    = 60
    ingress_settings = "ALLOW_ALL"
  }
  depends_on = [google_storage_bucket_object.test_case_gen_function_zip]
}