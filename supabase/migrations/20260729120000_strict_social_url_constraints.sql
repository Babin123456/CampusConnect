-- Migration: 20260729120000_strict_social_url_constraints.sql
-- Description: Add strict check constraints to public.clubs social media URLs (#1296)

-- 1. Ensure social media columns exist on public.clubs
ALTER TABLE public.clubs
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT;

-- 2. Add check constraints for URL formatting
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_linkedin'
  ) THEN
    ALTER TABLE public.clubs 
      ADD CONSTRAINT check_linkedin 
      CHECK (linkedin_url IS NULL OR linkedin_url ~ '^https://(www\.)?linkedin\.com/.*$');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_twitter'
  ) THEN
    ALTER TABLE public.clubs 
      ADD CONSTRAINT check_twitter 
      CHECK (twitter_url IS NULL OR twitter_url ~ '^https://(www\.)?(twitter\.com|x\.com)/.*$');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_instagram'
  ) THEN
    ALTER TABLE public.clubs 
      ADD CONSTRAINT check_instagram 
      CHECK (instagram_url IS NULL OR instagram_url ~ '^https://(www\.)?instagram\.com/.*$');
  END IF;
END $$;
