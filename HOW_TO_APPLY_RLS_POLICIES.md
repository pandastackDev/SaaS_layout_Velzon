# How to Apply RLS Policies for Subscriptions Table

## Quick Steps

### 1. Open Supabase Dashboard
- Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Select your project

### 2. Open SQL Editor
- Click on **"SQL Editor"** in the left sidebar
- Click **"New Query"** button (top right)

### 3. Copy and Paste the SQL
- Open the file: `supabase_rls_policies.sql`
- Copy **ALL** the SQL code
- Paste it into the SQL Editor

### 4. Run the SQL
- Click the **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)
- You should see: **"Success. No rows returned"** or similar success message

### 5. Verify It Worked
- Go to **Table Editor** → **subscriptions** table
- Click on **"Policies"** tab (next to "Columns", "Indexes", etc.)
- You should see two policies:
  - ✅ "Allow authenticated users to select subscriptions"
  - ✅ "Allow authenticated users to update subscriptions"

### 6. Test in Your App
- Refresh your admin panel subscriptions page
- The subscriptions should now load (if data exists in the table)

## Troubleshooting

### If you get an error "relation subscriptions does not exist"
- The `subscriptions` table hasn't been created yet
- You need to create the table first using the SQL schema you provided

### If you get a permission error
- Make sure you're logged into Supabase as the project owner
- Try running the SQL in smaller chunks (one policy at a time)

### If policies exist but still no data
- Check if there's actually data in the `subscriptions` table:
  ```sql
  SELECT COUNT(*) FROM subscriptions;
  ```
- If count is 0, the table is empty (not an RLS issue)

### If you want to check current policies
Run this query:
```sql
SELECT * FROM pg_policies WHERE tablename = 'subscriptions';
```

## What This Does

This SQL script:
1. ✅ Enables Row Level Security (RLS) on the `subscriptions` table
2. ✅ Creates a policy allowing authenticated users to **read** all subscriptions
3. ✅ Creates a policy allowing authenticated users to **update** subscriptions
4. ✅ Removes any conflicting old policies first

**Note:** The frontend determines admin status by checking if the user's email matches `VITE_ADMIN_EMAIL`. The RLS policies allow all authenticated users to access subscriptions, but only admins (determined by email) can access the admin panel UI.
