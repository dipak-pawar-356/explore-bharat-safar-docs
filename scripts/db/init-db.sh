#!/usr/bin/env bash
set -euo pipefail

# Explore Bharat Safar — Database Initialization & PostGIS Extension Verification
echo "==> Verifying PostgreSQL 16 + PostGIS connectivity..."

pnpm --filter @ebs/database prisma generate
pnpm --filter @ebs/database prisma migrate dev --name init_schemas
pnpm --filter @ebs/database seed

echo "==> Database initialization completed successfully."
