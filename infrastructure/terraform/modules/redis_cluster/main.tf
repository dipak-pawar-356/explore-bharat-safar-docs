# AWS ElastiCache Redis 7.2 High-Availability Cluster with Redlock Support
terraform {
  required_version = ">= 1.7.0"
}

variable "node_type" { type = string; default = "cache.r6g.large" }
variable "num_cache_clusters" { type = number; default = 3 }

output "redis_primary_endpoint" { value = "redis-cluster.ap-south-1.cache.amazonaws.com" }
