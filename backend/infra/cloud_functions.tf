resource "random_id" "archive_prefix" {
  byte_length = 4
}

data "archive_file" "event_dispatcher_function_zip" {
  type        = "zip"
  output_path = "${path.module}/build/${random_id.archive_prefix.hex}-event-dispatcher-function.zip"
  source_dir  = "${path.module}/../src/event_dispatcher/"
}

resource "google_storage_bucket_object" "event_dispatcher_function_zip" {
  name   = data.archive_file.event_dispatcher_function_zip.output_path
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
    max_instance_count = 3
    available_memory   = "256M"
    timeout_seconds    = 60
    ingress_settings = "ALLOW_ALL"
  }

}
