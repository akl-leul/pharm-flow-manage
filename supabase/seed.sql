-- Seed file for admin_users table
-- This file will be run when you reset your database

-- Insert default admin user
-- NOTE: In production, you should hash the password properly using bcrypt or similar
INSERT INTO public.admin_users (username, password_hash)
VALUES 
  ('admin', 'pharmacy123')
ON CONFLICT (username) DO NOTHING;
