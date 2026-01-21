# Complete Authentication Implementation Guide

## Overview
This guide implements the complete 4-step registration and sign-in flow from PITCHINVEST using Supabase and Velzon UI components.

## ✅ Already Completed

1. **Supabase Client** - `src/lib/supabase.ts`
2. **Authentication Hooks** - `src/hooks/useAuth.ts`, `src/hooks/useAdmin.ts`
3. **Admin Dashboard Integration** - Connected to Supabase
4. **Environment Types** - `src/vite-env.d.ts`

## 📋 Setup Instructions

### 1. Create `.env` File

Create a `.env` file in the project root with your Supabase credentials:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Admin Configuration
VITE_ADMIN_EMAIL=admin@example.com

# Optional - For backward compatibility
VITE_APP_API_URL=http://localhost:5000/api
VITE_APP_DEFAULTAUTH=supabase
```

### 2. Get Supabase Credentials

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project (or use existing)
3. Go to Settings > API
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### 3. Database Setup

Run this SQL in Supabase SQL Editor to create the required tables:

```sql
-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT CHECK (user_type IN ('Inventor', 'StartUp', 'Company', 'Investor')),
  full_name TEXT NOT NULL,
  personal_email TEXT UNIQUE NOT NULL,
  telephone TEXT,
  country TEXT,
  city TEXT,
  photo_url TEXT,
  cover_image_url TEXT,
  profile_status TEXT DEFAULT 'pending' CHECK (profile_status IN ('pending', 'approved', 'rejected')),
  
  -- Company fields
  company_name TEXT,
  project_name TEXT,
  project_category TEXT,
  company_nif TEXT,
  company_telephone TEXT,
  
  -- Investment/Business model fields
  capital_percentage TEXT,
  capital_total_value TEXT,
  license_fee TEXT,
  licensing_royalties_percentage TEXT,
  franchisee_investment TEXT,
  monthly_royalties TEXT,
  
  -- Inventor specific
  inventor_name TEXT,
  license_number TEXT,
  release_date DATE,
  initial_license_value TEXT,
  exploitation_license_royalty TEXT,
  patent_sale TEXT,
  investors_count TEXT,
  
  -- StartUp/Company specific
  smart_money TEXT,
  total_sale_of_project TEXT,
  
  -- Investor specific
  investment_preferences TEXT,
  
  -- Pitch materials
  description TEXT,
  pitch_video_url TEXT,
  fact_sheet_url TEXT,
  technical_sheet_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active')),
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  plan_name TEXT NOT NULL,
  plan_price DECIMAL(10,2),
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  invoice_type TEXT CHECK (invoice_type IN ('subscription', 'advertising')),
  subtotal DECIMAL(10,2),
  tax_amount DECIMAL(10,2),
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue', 'cancelled')),
  billing_period_start TIMESTAMP,
  billing_period_end TIMESTAMP,
  due_date TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
CREATE POLICY "Users can update their own data" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
CREATE POLICY "Users can insert their own data" 
  ON public.users FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Admin policies (UPDATE WITH YOUR ADMIN EMAIL)
DROP POLICY IF EXISTS "Admins have full access to users" ON public.users;
CREATE POLICY "Admins have full access to users" 
  ON public.users FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@example.com'  -- CHANGE THIS TO YOUR ADMIN EMAIL
    )
  );

-- RLS Policies for projects
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
CREATE POLICY "Users can view their own projects" 
  ON public.projects FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
CREATE POLICY "Users can create their own projects" 
  ON public.projects FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can view approved projects" ON public.projects;
CREATE POLICY "Public can view approved projects" 
  ON public.projects FOR SELECT 
  USING (status IN ('approved', 'active'));

DROP POLICY IF EXISTS "Admins have full access to projects" ON public.projects;
CREATE POLICY "Admins have full access to projects" 
  ON public.projects FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@example.com'  -- CHANGE THIS TO YOUR ADMIN EMAIL
    )
  );

-- RLS Policies for subscriptions
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions" 
  ON public.subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins have full access to subscriptions" ON public.subscriptions;
CREATE POLICY "Admins have full access to subscriptions" 
  ON public.subscriptions FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@example.com'  -- CHANGE THIS TO YOUR ADMIN EMAIL
    )
  );

-- RLS Policies for invoices
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
CREATE POLICY "Users can view their own invoices" 
  ON public.invoices FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins have full access to invoices" ON public.invoices;
CREATE POLICY "Admins have full access to invoices" 
  ON public.invoices FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@example.com'  -- CHANGE THIS TO YOUR ADMIN EMAIL
    )
  );

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, personal_email, full_name, photo_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for user files
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-files', 'user-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for user files
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
CREATE POLICY "Users can upload their own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
CREATE POLICY "Users can view their own files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-files');

DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'user-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

### 4. Enable Authentication Providers in Supabase

#### Email/Password (Already enabled)
- Default provider in Supabase
- No additional configuration needed

#### Google OAuth
1. Supabase Dashboard → Authentication → Providers → Google
2. Enable the provider
3. Add authorized redirect URLs:
   - `http://localhost:5173/auth/callback` (development)
   - `https://your-domain.com/auth/callback` (production)
4. Get Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com)
5. Add Client ID and Client Secret to Supabase

#### LinkedIn OAuth
1. Supabase Dashboard → Authentication → Providers → LinkedIn (OIDC)
2. Enable the provider
3. Add authorized redirect URLs
4. Get LinkedIn credentials from [LinkedIn Developers](https://www.linkedin.com/developers/)
5. Add Client ID and Client Secret to Supabase

## 🔄 Authentication Flow

### Current Implementation

**Login Flow:**
1. User enters email/password
2. Redux thunk dispatches `loginUser`
3. Mock authentication with session storage
4. Redirects to dashboard

**Register Flow:**
1. Simple form with email, name, password
2. Redux thunk dispatches `registerUser`
3. Mock user creation
4. Redirects to login

### New Supabase Flow (What we're implementing)

**Login Flow:**
1. User enters email/password
2. `supabase.auth.signInWithPassword()` 
3. Session stored in localStorage automatically
4. User redirected to dashboard
5. `useAuth` hook manages session state

**Register Flow (4 Steps):**
1. **Step 1 - User Type**: Select (Inventor/StartUp/Company/Investor)
2. **Step 2 - Company Info**: Business details (if applicable)
3. **Step 3 - Personal Info**: Email, password, name, location
4. **Step 4 - Pitch Materials**: Upload documents/videos
5. Email verification OTP (Supabase Magic Link)
6. Profile creation in `users` table
7. Redirect to dashboard

## 🎯 Implementation Status

### ✅ Completed
- [x] Supabase client setup (`src/lib/supabase.ts`)
- [x] Authentication hooks (`src/hooks/useAuth.ts`, `src/hooks/useAdmin.ts`)  
- [x] Admin dashboard with Supabase data
- [x] Environment variable types (`src/vite-env.d.ts`)
- [x] Admin navigation in sidebar

### 🚧 In Progress
- [ ] 4-step registration component with Velzon UI
- [ ] Login component with Supabase integration
- [ ] OAuth (Google/LinkedIn) buttons in Login
- [ ] Update Redux thunks to use Supabase
- [ ] File upload utilities for pitch materials
- [ ] Email verification flow

### 📝 To Do
- [ ] Forgot password flow
- [ ] Profile settings page
- [ ] Email templates customization in Supabase
- [ ] Error handling and user feedback
- [ ] Loading states and animations
- [ ] Form validation with Yup
- [ ] Country/city selection components

## 🔧 Quick Start (Development Mode)

### Option 1: Use Mock Authentication (Current)
The existing mock authentication still works for development:
- Email: any email
- Password: any password
- Redirects to `/dashboard`

### Option 2: Set Up Supabase (Recommended)

1. **Create Supabase project** (5 minutes)
2. **Add `.env` file** with credentials (see step 1 above)
3. **Run SQL schema** (see step 3 above)
4. **Test login** with Supabase email/password

The app will automatically use Supabase if credentials are provided in `.env`, otherwise falls back to mock data.

## 📂 File Structure (After Complete Implementation)

```
src/
├── lib/
│   ├── supabase.ts              ✅ Supabase client
│   ├── storage.ts               🚧 File upload utilities
│   └── countries.ts             🚧 Country data
├── hooks/
│   ├── useAuth.ts               ✅ Authentication hook
│   └── useAdmin.ts              ✅ Admin check hook
├── pages/
│   └── Authentication/
│       ├── Login.tsx            🚧 Updated with Supabase
│       ├── Register.tsx         🚧 4-step flow
│       ├── ForgotPassword.tsx   📝 To implement
│       └── Logout.tsx           ✅ Existing
├── slices/
│   └── auth/
│       └── login/
│           ├── reducer.ts       🚧 Update for Supabase
│           └── thunk.ts         🚧 Update for Supabase
└── vite-env.d.ts                ✅ Environment types
```

## 🎨 UI Components Used

### Velzon Components (reactstrap)
- `Card`, `CardBody`, `CardHeader`
- `Form`, `Input`, `Label`, `FormFeedback`
- `Button`, `Spinner`, `Alert`
- `Row`, `Col`, `Container`
- `Modal`, `ModalHeader`, `ModalBody`

### Custom Components (To Create)
- Multi-step form wizard
- File upload with preview
- Country selector dropdown
- OTP input component

## 🔐 Security Considerations

1. **Row Level Security (RLS)** - All tables have RLS enabled
2. **Admin Policies** - Based on email address
3. **File Upload** - Scoped to user's own folder
4. **Session Management** - Handled by Supabase (PKCE flow)
5. **Email Verification** - Required for new accounts
6. **Password Requirements** - Enforced by Supabase

## 📞 Support & Next Steps

1. **Test Current Setup**:
   ```bash
   # Install dependencies (if needed)
   npm install
   
   # Start dev server
   npm run dev
   ```

2. **Verify Admin Access**:
   - Login with any credentials (mock mode)
   - Navigate to Admin Panel in sidebar
   - Dashboard shows 0s (no Supabase data yet)

3. **Set Up Supabase**:
   - Follow steps 1-3 above
   - Restart dev server
   - Admin dashboard will show real data

4. **Test Authentication**:
   - Register new user with Supabase
   - Verify email
   - Login
   - Access protected routes

## 🐛 Troubleshooting

**Issue**: Admin dashboard shows loading spinner forever  
**Fix**: Check that `.env` has correct Supabase credentials and tables exist

**Issue**: "Missing Supabase environment variables" warning  
**Fix**: Create `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Issue**: "Auth session missing!" error  
**Fix**: User needs to be signed in. Redirect to login page.

**Issue**: OAuth not working  
**Fix**: Check redirect URLs in Supabase match your local/production URLs

**Issue**: File uploads failing  
**Fix**: Ensure storage bucket `user-files` exists and policies are set

## 📚 References

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Velzon React](https://themesbrand.com/velzon/react/)
- [React Router](https://reactrouter.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
