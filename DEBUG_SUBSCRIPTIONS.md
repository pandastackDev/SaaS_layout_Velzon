# Debugging Subscriptions History Page

## Step-by-Step Debugging Guide

### 1. Check Browser Console

Open your browser's Developer Tools (F12) and check the Console tab. Look for:

- **✅ Success messages**: Should see "Loading Subscriptions Debug" and step-by-step logs
- **❌ Error messages**: Will show specific error codes and messages
- **🔒 RLS errors**: Error code `42501` means Row Level Security is blocking access

### 2. Check RLS Policies in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Policies** (or **Table Editor** → **subscriptions** → **Policies**)
3. Check if RLS is enabled on the `subscriptions` table
4. Check if there are any SELECT policies

**If no policies exist or RLS is blocking access:**

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable RLS on subscriptions table
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view subscriptions
CREATE POLICY "Allow authenticated users to select subscriptions"
ON subscriptions
FOR SELECT
TO authenticated
USING (true);
```

### 3. Verify Data Exists in Supabase

1. Go to Supabase Dashboard
2. Navigate to **Table Editor**
3. Select the `subscriptions` table
4. Check if there are any rows

**If table is empty:**
- No subscriptions have been created yet
- This is normal if you haven't set up subscription creation flow

**If table has data but page shows "No subscriptions found":**
- RLS policy is likely blocking access
- Check step 2 above

### 4. Check Supabase Connection

In browser console, you should see:
```
=== Loading Subscriptions Debug ===
1. Checking Supabase connection...
✅ Supabase connection OK
```

If you see connection errors:
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your `.env` file
- Verify these match your Supabase project settings

### 5. Common Error Codes

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `42501` | RLS Policy Error | Create SELECT policy (see Step 2) |
| `42P01` | Table doesn't exist | Create `subscriptions` table |
| `PGRST116` | No rows returned | Table is empty (normal if no subscriptions yet) |
| `400` | Bad request | Check query syntax |
| `401` | Unauthorized | Check Supabase keys |

### 6. Quick Test Query

Run this in Supabase SQL Editor to test access:

```sql
-- Test if you can see subscriptions
SELECT COUNT(*) FROM subscriptions;

-- If this works, RLS is not the issue
-- If this fails, you need to create RLS policies
```

### 7. Check Network Tab

1. Open Developer Tools → **Network** tab
2. Refresh the subscriptions page
3. Look for requests to Supabase
4. Check the response:
   - **200 OK**: Request succeeded (might be empty array)
   - **401/403**: Authentication/Authorization error
   - **500**: Server error

## Quick Fix Checklist

- [ ] Browser console shows no errors
- [ ] RLS policies exist for `subscriptions` table
- [ ] Supabase dashboard shows data in `subscriptions` table (if expected)
- [ ] Environment variables are set correctly
- [ ] User is logged in and authenticated
- [ ] User email matches `VITE_ADMIN_EMAIL` in `.env`

## Still Not Working?

1. **Copy the full console error** and share it
2. **Check Supabase logs** in Dashboard → Logs
3. **Verify table structure** matches the schema provided
4. **Test with a simple query** in Supabase SQL Editor
