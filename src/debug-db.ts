import { supabase } from './integrations/supabase/client';

// Debug function to check admin_users table
export const debugAdminUsers = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test 1: Check if we can access the table at all
    const { data: allUsers, error: allUsersError } = await supabase
      .from('admin_users')
      .select('*')
      .limit(10);
    
    console.log('All users:', allUsers);
    console.log('All users error:', allUsersError);
    
    // Test 2: Try to find the specific admin user
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', 'admin')
      .maybeSingle();
    
    console.log('Admin user:', adminUser);
    console.log('Admin error:', adminError);
    
    // Test 3: Check if there are any users at all
    const { count, error: countError } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact', head: true });
    
    console.log('User count:', count);
    console.log('Count error:', countError);
    
    return {
      allUsers,
      allUsersError,
      adminUser,
      adminError,
      count,
      countError
    };
  } catch (error) {
    console.error('Debug error:', error);
    return { error };
  }
};

// Run this function in the browser console to debug
// debugAdminUsers();
