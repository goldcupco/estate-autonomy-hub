
# Database SQL Scripts

This directory contains SQL scripts for creating and managing the database tables required by the application.

## How to Use

1. Log in to your Supabase dashboard: https://app.supabase.com/project/gdxzktqieasxxcocwsjh/editor
2. Navigate to the SQL Editor
3. Copy and paste the content of the desired SQL file
4. Run the script

You can also run these scripts directly using the Supabase CLI if you have it installed.

## Available Scripts

1. `create_tables.sql` - Creates all required tables and sets up indexes
2. `insert_sample_data.sql` - Populates tables with test data for development
3. `add_rls_policies.sql` - Sets up Row Level Security policies for data protection
4. `drop_tables.sql` - Drops all tables (WARNING: use only when you need to reset)

## Execution Order

When setting up a new database, execute the scripts in this order:
1. `create_tables.sql`
2. `add_rls_policies.sql`
3. `insert_sample_data.sql` (optional, for development environments only)

