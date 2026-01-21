# Supabase Integration Guide

## ✅ Completed Integration

### 1. **Supabase Client Setup**
- **File**: `src/lib/supabase.ts`
- Configured Supabase client with proper session management
- PKCE flow type for secure authentication
- Auto-refresh tokens and persistent sessions

### 2. **Authentication Hooks**
- **File**: `src/hooks/useAuth.ts`
  - Manages user authentication state
  - Fetches and caches user profile from database
  - Handles sign-in/sign-out operations
  - OAuth support ready

- **File**: `src/hooks/useAdmin.ts`
  - Checks if current user is admin
  - Configurable admin email via environment variable

### 3. **Admin Dashboard Data Integration**
- **File**: `src/pages/Admin/Dashboard/index.tsx`
  - Fetches real-time stats from Supabase:
    - Total Users
    - Pending Projects
    - Approved Projects
    - Active Subscriptions
    - Total Invoices
    - Total Revenue
  - Protected route (admin-only access)
  - Loading states and error handling

### 4. **KPI Cards Component**
- **File**: `src/pages/Admin/Dashboard/AdminKPICards.tsx`
  - Dynamic data display
  - CountUp animations
  - Responsive design matching Velzon theme

## 📋 Required Setup

### Step 1: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key from Settings > API

### Step 2: Set Up Environment Variables
Create a `.env` file in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Admin Configuration
VITE_ADMIN_EMAIL=admin@example.com
```

### Step 3: Create Database Tables
Run these SQL commands in Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  user_type TEXT,
  full_name TEXT NOT NULL,
  personal_email TEXT UNIQUE NOT NULL,
  photo_url TEXT,
  cover_image_url TEXT,
  country TEXT,
  city TEXT,
  profile_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'active',
  plan_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  subscription_id UUID REFERENCES subscriptions(id),
  invoice_type TEXT,
  subtotal DECIMAL,
  tax_amount DECIMAL,
  total_amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_status TEXT DEFAULT 'pending',
  billing_period_start TIMESTAMP,
  billing_period_end TIMESTAMP,
  due_date TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Basic - adjust as needed)
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public can view approved projects" ON projects
  FOR SELECT USING (status = 'approved');

-- Admin policies (replace with your admin user ID)
CREATE POLICY "Admins have full access to users" ON users
  FOR ALL USING (auth.email() = 'admin@example.com');

CREATE POLICY "Admins have full access to projects" ON projects
  FOR ALL USING (auth.email() = 'admin@example.com');
```

### Step 4: Set Up Authentication Providers

#### Email/Password (Default)
Already configured in Supabase by default.

#### Google OAuth
1. In Supabase Dashboard: Authentication > Providers > Google
2. Follow instructions to set up Google OAuth
3. Add redirect URLs

#### LinkedIn OAuth
1. In Supabase Dashboard: Authentication > Providers > LinkedIn
2. Follow instructions to set up LinkedIn OAuth
3. Add redirect URLs

### Step 5: Update Login Component (Optional - Advanced)
To add OAuth buttons to the login page:

```tsx
import { supabase } from '../../lib/supabase';

// In your Login component
const handleGoogleSignIn = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });
  if (error) console.error('Error:', error);
};

const handleLinkedInSignIn = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'linkedin_oidc',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });
  if (error) console.error('Error:', error);
};

// Add buttons in JSX
<Button onClick={handleGoogleSignIn}>
  <i className="ri-google-fill"></i> Sign in with Google
</Button>

<Button onClick={handleLinkedInSignIn}>
  <i className="ri-linkedin-fill"></i> Sign in with LinkedIn
</Button>
```

## 🔐 Authentication Flow

### Current Implementation (Mock Data)
- Uses Redux thunks from `src/slices/auth/login/thunk.ts`
- Mock user login for development
- Session storage based

### Supabase Integration (Ready to Use)
- Real authentication with Supabase
- OAuth support (Google, LinkedIn)
- Email/Password login
- Persistent sessions via localStorage

### To Switch to Supabase Auth:
1. Update `src/slices/auth/login/thunk.ts` to use Supabase
2. Replace Redux state management with `useAuth` hook
3. Update Login component to use Supabase methods

## 📊 Admin Dashboard Features

### Current Stats Tracked:
- ✅ Total Users count
- ✅ Pending Projects count
- ✅ Approved Projects count
- ✅ Active Subscriptions count
- ✅ Total Invoices count
- ✅ Total Revenue (sum of paid invoices)

### Admin Access Control:
- Based on email address (configured in .env)
- Admin check in `useAdmin` hook
- Protected routes redirect non-admin users

## 🔄 Next Steps

1. **Set up Supabase project** and create tables
2. **Add environment variables** to `.env` file
3. **Test admin dashboard** with real data
4. **Optional**: Replace mock login with Supabase auth
5. **Optional**: Add OAuth providers (Google, LinkedIn)
6. **Implement other admin pages**:
   - Manage Projects (with approval/rejection)
   - Profile Approval
   - Manage Users
   - Analytics (35 charts)
   - View Invoices
   - Manage Pricing
   - Advertising

## 📁 File Structure

```
src/
├── lib/
│   └── supabase.ts                 # Supabase client configuration
├── hooks/
│   ├── useAuth.ts                  # Authentication hook
│   └── useAdmin.ts                 # Admin check hook
├── pages/
│   └── Admin/
│       ├── Dashboard/
│       │   ├── index.tsx          # Main dashboard (with Supabase integration)
│       │   ├── AdminKPICards.tsx  # KPI cards component
│       │   └── QuickActions.tsx   # Quick actions component
│       ├── Projects/              # Placeholder
│       ├── ProfileApproval/       # Placeholder
│       ├── Users/                 # Placeholder
│       ├── Analytics/             # Placeholder
│       ├── Invoices/              # Placeholder
│       ├── Pricing/               # Placeholder
│       └── Advertising/           # Placeholder
```

## 🎨 UI/UX Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Velzon theme consistency
- ✅ Animated counters (CountUp)
- ✅ Loading states
- ✅ Error handling
- ✅ Card animations (`card-animate` class)
- ✅ Breadcrumb navigation

## 🚀 Development vs Production

### Development (Current):
- Works without Supabase (graceful fallback)
- Mock data displayed if no connection
- Admin panel accessible via navigation

### Production (With Supabase):
- Real-time data from database
- Secure authentication
- Row-level security
- Admin-only access enforcement

## 📝 Notes

- Supabase package (`@supabase/supabase-js`) is already installed
- All necessary hooks and components are created
- Admin menu is added to sidebar navigation
- Database schema provided above
- RLS policies need to be adjusted for your use case
- Replace `admin@example.com` with your actual admin email

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
