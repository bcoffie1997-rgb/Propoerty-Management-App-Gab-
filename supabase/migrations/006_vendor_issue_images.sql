-- =============================================================================
-- Migration 006 — Add image_url to vendors and maintenance_issues
-- Holdings — Property Manager MVP+
-- =============================================================================

alter table vendors add column image_url text;
alter table maintenance_issues add column image_url text;
