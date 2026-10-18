-- Give an account the "admin" label. Replace the email, run in the SQL Editor,
-- then sign out and back in on the admin site so the label takes effect.
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'
where email = 'your-email@example.com';

-- To remove it again:
-- update auth.users set raw_app_meta_data = raw_app_meta_data - 'role'
-- where email = 'your-email@example.com';
