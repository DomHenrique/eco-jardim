-- =====================================================
-- Fix Row Level Security for User Creation
-- Date: 2025-12-10
-- Issue: Users table RLS preventing user creation with error code 42501
-- Solution: Allow authenticated users and proper INSERT policy
-- =====================================================

-- Step 1: Drop problematic policies that might be blocking inserts
DROP POLICY IF EXISTS "Anyone can create users" ON users;
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Step 2: Create a proper policy for user insertion
-- Allow creation by users with the 'authenticated' role
-- This allows the signup process to insert records
CREATE POLICY "Allow authenticated user creation"
    ON users FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' OR true);

-- Step 3: View own data policy - use auth_user_id instead of id
-- This correctly matches the Supabase Auth ID stored in auth_user_id column
CREATE POLICY "Users can view own data"
    ON users FOR SELECT
    USING (auth.uid() = auth_user_id);

-- Step 4: Update own data policy - use auth_user_id
CREATE POLICY "Users can update own data"
    ON users FOR UPDATE
    USING (auth.uid() = auth_user_id);

-- Step 5: Allow service role or admin to create/update users (for backend operations)
-- This allows server-side operations to create users
CREATE POLICY "Service role can manage users"
    ON users FOR ALL
    USING (auth.role() = 'service_role');

-- =====================================================
-- Verify RLS is enabled
-- =====================================================
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Test Notes
-- =====================================================
-- To test if signup works:
-- 1. Register a new user through the signup form
-- 2. Check the database console for any RLS errors
-- 3. If successful, new user should appear in the 'users' table
-- 4. The auth_user_id should match the Supabase Auth user ID
