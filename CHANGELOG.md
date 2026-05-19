# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

## [0.2.0] — 2026-05-19

### Added

- **Photo upload for vendors and issues** — take a picture via mobile camera (`capture="environment"`) or upload an image file from desktop. Photos are stored in Supabase Storage and viewable from the vendors/issues list tables.
- `image_url` columns added to `vendors` and `maintenance_issues` tables.
- Shared storage helper (`src/lib/storage.ts`) for client-side image uploads.
- `ImageLink` component for opening uploaded photos via signed URLs.
- Server actions now clean up stored images when a vendor or issue is deleted or its photo is replaced.

### Changed

- **Default theme is now dark mode** instead of following the system preference.

### Fixed

- Pinned `date-fns` to `^3.6.0` to resolve peer dependency conflict with `react-day-picker@8.10.2` that was breaking Vercel builds.

---

## [0.1.0] — 2026-05-19

### Added

- Initial MVP release — Holdings property manager.
- Property management: add, edit, and track properties with addresses, purchase info, and notes.
- Tenant management: store tenant contact info and emergency contacts.
- Lease management: create leases linked to units and tenants, track rent amounts, deposits, and status.
- Rent payments: log and track monthly rent payments with status (paid, partial, late, unpaid).
- Vendor directory: manage preferred contractors by category (plumbing, electrical, HVAC, etc.) with insurance expiration alerts.
- Maintenance issues: create, assign, and track maintenance tickets from report to completion with priority, status, due dates, and cost tracking.
- Expenses: log property expenses with receipt upload (PDF/image) to Supabase Storage.
- Dashboard overview showing key portfolio metrics.
- Responsive UI with mobile-optimized navigation and quick-add FAB.
- Supabase-backed auth, database, and storage with RLS policies.
- Demo mode support for offline/local testing.

---

## How to maintain this changelog

When you make a change, add a bullet under the `[Unreleased]` section in the appropriate category:

- `### Added` — new features
- `### Changed` — changes to existing functionality
- `### Deprecated` — soon-to-be removed features
- `### Removed` — removed features
- `### Fixed` — bug fixes
- `### Security` — security-related changes

When you cut a release, move the `[Unreleased]` entries into a new version section and update the version links at the bottom of the file.
