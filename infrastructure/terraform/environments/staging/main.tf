# Explore Bharat Safar — Staging Environment Infrastructure
module "vpc" {
  source      = "../../modules/vpc"
  environment = "staging"
}

module "eks" {
  source       = "../../modules/eks"
  cluster_name = "ebs-staging-cluster"
}

module "rds" {
  source        = "../../modules/rds_postgis"
  database_name = "ebs_staging_db"
}

module "redis" {
  source = "../../modules/redis_cluster"
}

module "s3" {
  source      = "../../modules/s3_vaults"
  environment = "staging"
}
