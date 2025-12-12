-- =====================================================
-- Fix RLS Policies for Users Table
-- =====================================================
-- This migration fixes the Row Level Security policies for the users table
-- to correctly use auth_user_id instead of id when comparing with auth.uid()

-- Drop existing policies that have incorrect comparisons
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Recreate policies with correct auth_user_id comparison
-- Users can view their own data by matching auth.uid() with auth_user_id
CREATE POLICY "Users can view own data"
    ON users FOR SELECT
    USING (auth.uid() = auth_user_id);

-- Users can update their own data by matching auth.uid() with auth_user_id
CREATE POLICY "Users can update own data"
    ON users FOR UPDATE
    USING (auth.uid() = auth_user_id);

-- Note: The "Anyone can create users" policy is already correct and doesn't need changes
