# Supabase Database Setup

## Method 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the following SQL commands:

```sql
-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Insert default admin user
INSERT INTO public.admin_users (username, password_hash)
VALUES ('admin', 'pharmacy123')
ON CONFLICT (username) DO NOTHING;
```

## Method 2: Using Supabase CLI

If you have the Supabase CLI installed:

1. Create the migration file:
```bash
supabase migration new create_admin_users
```

2. Copy the SQL from `supabase/migrations/20240103000000_create_admin_users.sql` into the new migration file

3. Apply the migration:
```bash
supabase db push
```

## Method 3: Using the Setup Script

You can also use the setup script I created:

1. Open your browser console
2. Run:
```javascript
import { setupAdminUser } from './src/setup-admin.ts';
await setupAdminUser();
```

## Security Note

⚠️ **Important**: The password `pharmacy123` is stored in plain text for demo purposes. 
In production, you should:

1. Use proper password hashing (bcrypt, Argon2, etc.)
2. Store only the hash, never the plain password
3. Use environment variables for sensitive data

## Verification

After setup, you can verify the admin user exists by running:

```sql
SELECT * FROM admin_users WHERE username = 'admin';
```

Or in the browser console:

```javascript
import { checkAdminUser } from './src/setup-admin.ts';
const admin = await checkAdminUser();
console.log(admin);
```
