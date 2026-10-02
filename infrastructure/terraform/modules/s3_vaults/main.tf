# S3 Multi-Bucket Architecture with WORM Object Lock & Quarantine
terraform {
  required_version = ">= 1.7.0"
}

variable "environment" { type = string }

output "media_bucket" { value = "ebs-media-${var.environment}" }
output "certs_bucket" { value = "ebs-certs-${var.environment}" }
output "quarantine_bucket" { value = "ebs-quarantine-${var.environment}" }
