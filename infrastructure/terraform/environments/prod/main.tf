# Explore Bharat Safar — Production Multi-AZ High-Availability Infrastructure
module "vpc" {
  source      = "../../modules/vpc"
  environment = "production"
}

module "eks" {
  source       = "../../modules/eks"
  cluster_name = "ebs-prod-cluster"
}

module "rds" {
  source        = "../../modules/rds_postgis"
  database_name = "explore_bharat_safar_prod"
}

module "redis" {
  source             = "../../modules/redis_cluster"
  num_cache_clusters = 6
}

module "s3" {
  source      = "../../modules/s3_vaults"
  environment = "production"
}

module "waf" {
  source = "../../modules/cloudflare_waf"
}
