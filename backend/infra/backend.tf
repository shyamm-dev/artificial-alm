terraform {
  backend "gcs" {
    bucket  = "testcase-generation-tf-bucket"
    prefix  = "terraform/state"
  }
}
