# Explore Bharat Safar — Disaster Recovery (DR) Region (RPO <= 5m, RTO <= 30m)
module "vpc" {
  source      = "../../modules/vpc"
  environment = "dr"
}

module "rds_replica" {
  source        = "../../modules/rds_postgis"
  database_name = "explore_bharat_safar_dr"
}
