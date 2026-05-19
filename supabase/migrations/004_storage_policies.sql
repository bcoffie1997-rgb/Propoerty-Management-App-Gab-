-- =============================================================================
-- Migration 004 — Storage Policies for `receipts` bucket
-- Santi Fortune — Property Manager MVP
--
-- PREREQUISITE: In the Supabase dashboard, create a Storage bucket named
-- 'receipts' with public access DISABLED. Then run this migration.
--
-- Receipts are stored at path: receipts/{user_id}/{uuid}-{filename}
-- The first folder segment must equal auth.uid() — this is what the policies
-- enforce.
-- =============================================================================

-- Allow authenticated users to upload to a path starting with their user id
create policy "users upload own receipts" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to read their own receipts
create policy "users read own receipts" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own receipts
create policy "users delete own receipts" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
