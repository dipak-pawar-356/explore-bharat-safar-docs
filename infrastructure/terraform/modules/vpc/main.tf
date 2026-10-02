# Multi-AZ VPC with Public, Private, and Isolated Database Subnets (ap-south-1)
terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
  }
}

variable "environment" { type = string }
variable "cidr_block" { type = string; default = "10.0.0.0/16" }

output "vpc_id" { value = "vpc-placeholder" }
