-- Explore Bharat Safar Database Initialization Script
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- The 8 Core Logical Schemas
CREATE SCHEMA IF NOT EXISTS identity_schema;
CREATE SCHEMA IF NOT EXISTS geo_spatial_schema;
CREATE SCHEMA IF NOT EXISTS rural_bharat_schema;
CREATE SCHEMA IF NOT EXISTS booking_schema;
CREATE SCHEMA IF NOT EXISTS payment_schema;
CREATE SCHEMA IF NOT EXISTS certificate_schema;
CREATE SCHEMA IF NOT EXISTS social_schema;
CREATE SCHEMA IF NOT EXISTS audit_schema;

COMMENT ON SCHEMA identity_schema IS 'IAM, users, roles, permissions, sessions';
COMMENT ON SCHEMA geo_spatial_schema IS 'States, districts, talukas, places, categories, 3D landmarks';
COMMENT ON SCHEMA rural_bharat_schema IS '650K+ villages, gram panchayats, infrastructure, staging moderation';
COMMENT ON SCHEMA booking_schema IS 'Experiences, batches, bookings, participants, redlock concurrency';
COMMENT ON SCHEMA payment_schema IS 'Double-entry ledger, gateway webhooks, GST invoices, refunds';
COMMENT ON SCHEMA certificate_schema IS 'PDF/A-1b tamper-evident digital certificates, QR codes, public verification';
COMMENT ON SCHEMA social_schema IS 'Traveller profiles, posts, stories, followers, guilds, solo discovery';
COMMENT ON SCHEMA audit_schema IS 'Immutable append-only audit trail logs partitioned by month';
