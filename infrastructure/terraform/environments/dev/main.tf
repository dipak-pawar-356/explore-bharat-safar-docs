# Explore Bharat Safar — Development Environment Infrastructure
module "vpc" {
  source      = "../../modules/vpc"
  environment = "dev"
}

module "s3" {
  source      = "../../modules/s3_vaults"
  environment = "dev"
}
