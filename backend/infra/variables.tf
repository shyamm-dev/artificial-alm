variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default = "artificial-aml"
}

variable "region" {
  description = "Region for resources"
  type        = string
  default     = "europe-west1"
}

variable "bucket_name" {
  description = "GCS Bucket for Cloud Function source code"
  type        = string
  default     = "testcase-generation-tf-bucket"
}

variable "TURSO_DATABASE_URL" {
}

variable "GOOGLE_CLOUD_API_KEY" {
}

variable "TURSO_AUTH_TOKEN" {
}

output "name" {
  value = var.TURSO_DATABASE_URL
}