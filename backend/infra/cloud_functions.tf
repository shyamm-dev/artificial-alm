data "archive_file" "event_dispatcher_function_zip" {
  type        = "zip"
  output_path = "build/event-dispatcher-function.zip"
  source_dir  = "${path.module}/../src/event_dispatcher/"
}

locals {
  zip_md5 = md5(filebase64(data.archive_file.event_dispatcher_function_zip.output_path))
}

resource "google_storage_bucket_object" "event_dispatcher_function_zip" {
  name   = "event-dispatcher-${local.zip_md5}.zip"
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
  depends_on = [google_storage_bucket_object.event_dispatcher_function_zip]
}
