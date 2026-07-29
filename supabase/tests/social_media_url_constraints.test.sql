-- Start transaction
BEGIN;

-- Enable pgTAP extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgtap;

-- Plan 5 tests
SELECT plan(5);

-- Test 1: Check constraints exist on public.clubs
SELECT has_constraint('public', 'clubs', 'check_linkedin', 'Constraint check_linkedin should exist');
SELECT has_constraint('public', 'clubs', 'check_twitter', 'Constraint check_twitter should exist');
SELECT has_constraint('public', 'clubs', 'check_instagram', 'Constraint check_instagram should exist');

-- Test 4: Test valid social media URLs insertion
PREPARE insert_valid_urls AS 
  INSERT INTO public.clubs (name, slug, linkedin_url, twitter_url, instagram_url) 
  VALUES (
    'URL Test Club Valid', 
    'url-test-club-valid', 
    'https://linkedin.com/in/testuser', 
    'https://x.com/testuser', 
    'https://www.instagram.com/testuser'
  );
SELECT lives_ok('insert_valid_urls', 'Valid social media URLs starting with https and matching domain should be accepted');

-- Test 5: Test invalid social media URL insertion (e.g. handle instead of URL)
PREPARE insert_invalid_urls AS 
  INSERT INTO public.clubs (name, slug, linkedin_url) 
  VALUES ('URL Test Club Invalid', 'url-test-club-invalid', '@invalid_username');
SELECT throws_ok('insert_invalid_urls', '23514', NULL, 'Invalid social media URL without https/domain should be rejected by constraint');

-- Finish tests and clean up
SELECT * FROM finish();
ROLLBACK;
