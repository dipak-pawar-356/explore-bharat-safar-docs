# Multi-AZ PostgreSQL 16 RDS Cluster with PostGIS Extension
terraform {
  required_version = ">= 1.7.0"
}

variable "database_name" { type = string; default = "explore_bharat_safar" }
variable "instance_class" { type = string; default = "db.r6g.xlarge" }

output "db_endpoint" { value = "postgres-primary.ap-south-1.rds.amazonaws.com" }
