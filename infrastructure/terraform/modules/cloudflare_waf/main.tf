# Cloudflare Enterprise DNS, WAF Rules, and CDN Cache Configuration
terraform {
  required_version = ">= 1.7.0"
}

variable "zone_id" { type = string; default = "placeholder-zone-id" }

output "waf_package_id" { value = "owasp-crs-package" }
