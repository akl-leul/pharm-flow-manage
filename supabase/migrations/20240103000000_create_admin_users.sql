-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users (in production, you'd want more restrictive policies)
CREATE POLICY "Admin users can view all admin users" ON public.admin_users
  FOR SELECT USING (true);

CREATE POLICY "Admin users can insert admin users" ON public.admin_users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin users can update admin users" ON public.admin_users
  FOR UPDATE USING (true);

CREATE POLICY "Admin users can delete admin users" ON public.admin_users
  FOR DELETE USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default admin user
-- NOTE: In production, you should hash the password properly using bcrypt or similar
INSERT INTO public.admin_users (username, password_hash)
VALUES ('admin', 'pharmacy123')
ON CONFLICT (username) DO NOTHING;
