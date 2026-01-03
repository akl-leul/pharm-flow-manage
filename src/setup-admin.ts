import { supabase } from './integrations/supabase/client';

// Function to create the admin user in the database
export const createAdminUser = async () => {
  try {
    const adminUser = {
      username: 'admin',
      password_hash: 'pharmacy123', // In production, use proper password hashing
    };

    const { data, error } = await supabase
      .from('admin_users')
      .insert([adminUser])
      .select()
      .single();

    if (error) {
      console.error('Error creating admin user:', error);
      return false;
    }

    console.log('Admin user created successfully:', data);
    return true;
  } catch (error) {
    console.error('Error creating admin user:', error);
    return false;
  }
};

// Function to check if admin user exists
export const checkAdminUser = async () => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', 'admin')
      .maybeSingle();

    if (error) {
      console.error('Error checking admin user:', error);
      return false;
    }

    return data;
  } catch (error) {
    console.error('Error checking admin user:', error);
    return false;
  }
};

// Setup function to ensure admin user exists
export const setupAdminUser = async () => {
  console.log('Setting up admin user...');
  
  const existingAdmin = await checkAdminUser();
  
  if (existingAdmin) {
    console.log('Admin user already exists:', existingAdmin);
    return true;
  }
  
  console.log('Admin user does not exist, creating...');
  const created = await createAdminUser();
  
  if (created) {
    console.log('Admin user created successfully');
    return true;
  }
  
  console.log('Failed to create admin user');
  return false;
};

// Run this in browser console to set up the admin user:
// setupAdminUser();
