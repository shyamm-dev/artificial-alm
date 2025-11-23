data "archive_file" "event_dispatcher_function_zip" {
  type        = "zip"
  output_path = "build/event-dispatcher-function.zip"
  source_dir  = "${path.module}/../src/event_dispatcher/"
}

locals {
  event_dispatcher_zip_md5 = data.archive_file.event_dispatcher_function_zip.output_md5
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
    max_instance_count = 20
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
  
  source {
    content  = file("${path.module}/../src/test_case_gen/main.py")
    filename = "main.py"
  }
  
  source {
    content  = file("${path.module}/../src/test_case_gen/requirements.txt")
    filename = "requirements.txt"
  }
  
  source {
    content  = file("${path.module}/../src/test_case_gen/system_instruction.md")
    filename = "system_instruction.md"
  }
  
  source {
    content  = file("${path.module}/../src/libs/__init__.py")
    filename = "libs/__init__.py"
  }
  
  source {
    content  = file("${path.module}/../src/libs/database.py")
    filename = "libs/database.py"
  }
  
  source {
    content  = file("${path.module}/../src/libs/google_gen_ai.py")
    filename = "libs/google_gen_ai.py"
  }
  
  source {
    content  = file("${path.module}/../src/libs/database_queries.py")
    filename = "libs/database_queries.py"
  }
  
  source {
    content  = file("${path.module}/../src/libs/issue_repository.py")
    filename = "libs/issue_repository.py"
  }
}

locals {
  testcase_gen_zip_md5 = data.archive_file.test_case_gen_function_zip.output_md5
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
    available_memory   = "256M"
    max_instance_count = 20
    timeout_seconds    = 240
    ingress_settings = "ALLOW_ALL"
    environment_variables = {
      TURSO_DATABASE_URL   = var.TURSO_DATABASE_URL
      GOOGLE_CLOUD_API_KEY = var.GOOGLE_CLOUD_API_KEY
      TURSO_AUTH_TOKEN     = var.TURSO_AUTH_TOKEN
    }
  }
  depends_on = [google_storage_bucket_object.test_case_gen_function_zip]
}

#########################################################################################

data "archive_file" "compliance_test_case_gen_function_zip" {
  type        = "zip"
  output_path = "build/compliance-test-case-gen-function.zip"
  
  source {
    content  = file("${path.module}/../src/compliance_test_case_gen/main.py")
    filename = "main.py"
  }
  
  source {
    content  = file("${path.module}/../src/compliance_test_case_gen/requirements.txt")
    filename = "requirements.txt"
  }
  
  source {
    content  = file("${path.module}/../src/compliance_test_case_gen/system_instruction.md")
    filename = "system_instruction.md"
  }
  
  source {
    content  = file("${path.module}/../src/libs/__init__.py")
    filename = "libs/__init__.py"
  }
  
  source {
    content  = file("${path.module}/../src/libs/database.py")
    filename = "libs/database.py"
  }
  
  source {
    content  = file("${path.module}/../src/libs/google_gen_ai.py")
    filename = "libs/google_gen_ai.py"
  }
  
  source {
    content  = file("${path.module}/../src/libs/database_queries.py")
    filename = "libs/database_queries.py"
  }
  
  source {
    content  = file("${path.module}/../src/libs/issue_repository.py")
    filename = "libs/issue_repository.py"
  }
}

locals {
  compliance_testcase_gen_zip_md5 = data.archive_file.compliance_test_case_gen_function_zip.output_md5
}

resource "google_storage_bucket_object" "compliance_test_case_gen_function_zip" {
  name   = "test-case-gen-${local.compliance_testcase_gen_zip_md5}.zip"
  bucket = var.bucket_name
  source = data.archive_file.compliance_test_case_gen_function_zip.output_path

}

resource "google_cloudfunctions2_function" "compliance_test_case_gen" {
  name        = "compliance-test-case-gen"
  location    = var.region
  description = "Calls generative AI model to create compliance test cases"

  build_config {
    runtime     = "python313"
    entry_point = "handler"
    source {
      storage_source {
        bucket = var.bucket_name
        object = google_storage_bucket_object.compliance_test_case_gen_function_zip.name
      }
    }
  }

  service_config {
    service_account_email = google_service_account.test_case_gen_cloud_function_sa.email
    available_memory   = "256M"
    max_instance_count = 20
    timeout_seconds    = 120
    ingress_settings = "ALLOW_ALL"
    environment_variables = {
      TURSO_DATABASE_URL   = var.TURSO_DATABASE_URL
      GOOGLE_CLOUD_API_KEY = var.GOOGLE_CLOUD_API_KEY
      TURSO_AUTH_TOKEN     = var.TURSO_AUTH_TOKEN
    }
  }
  depends_on = [google_storage_bucket_object.compliance_test_case_gen_function_zip]
}
