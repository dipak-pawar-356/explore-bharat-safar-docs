# AWS EKS Kubernetes Cluster with Managed Node Groups
terraform {
  required_version = ">= 1.7.0"
}

variable "cluster_name" { type = string; default = "ebs-cluster" }
variable "cluster_version" { type = string; default = "1.29" }

output "cluster_endpoint" { value = "https://eks.ap-south-1.amazonaws.com" }
