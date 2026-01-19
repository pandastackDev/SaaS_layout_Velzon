# Gallery Pages - Quick Start Guide

## 🎯 What Was Done

The Gallery and Gallery Detail pages from PITCH_INVEST have been successfully integrated into the Saas project with full Velzon theme styling.

## 📁 New/Updated Files

```
Saas/
├── src/
│   ├── Components/
│   │   └── Common/
│   │       └── GalleryCard.tsx              ✨ NEW
│   ├── pages/
│   │   └── Gallery/
│   │       ├── index.tsx                    ✅ UPDATED
│   │       └── gallerydetails/
│   │           └── index.tsx                ✅ UPDATED
│   └── Routes/
│       └── allRoutes.tsx                    ✅ UPDATED
└── GALLERY_UPDATE_SUMMARY.md                📄 NEW
└── GALLERY_QUICK_START.md                   📄 NEW (this file)
```

## 🚀 Quick Start

### Step 1: Verify Installation
All required dependencies are already installed in your `package.json`:
- ✅ reactstrap
- ✅ react-toastify
- ✅ react-router-dom
- ✅ bootstrap

### Step 2: Connect Backend (IMPORTANT!)

Create a new file: `Saas/src/lib/gallery.ts`

```typescript
// Example implementation with Supabase
import { supabase } from './supabase'; // Adjust import as needed

export interface GalleryItem {
  id: string | number;
  title: string;
  artist: string;
  subtitle?: string;
  imageUrl: string;
  images?: string[];
  category?: string;
  views: number;
  availableStatus: boolean;
  availableLabel?: string;
  badges?: string[];
  likes: number;
  author?: {
    name: string;
    avatarUrl?: string;
    country?: string;
    verified?: boolean;
  };
  date?: string;
  description?: string;
  location?: string;
  project_id?: string;
}

export const fetchGalleryItems = async (options: {
  limit?: number;
  category?: string;
}): Promise<any[]> => {
  // TODO: Replace with your actual database query
  try {
    let query = supabase
      .from('gallery_items')
      .select('*')
      .eq('approved', true);
    
    if (options.category) {
      query = query.eq('category', options.category);
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    return [];
  }
};

export const fetchGalleryItemById = async (id: string): Promise<any | null> => {
  // TODO: Replace with your actual database query
  try {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .eq('id', id)
      .eq('approved', true)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching gallery item:', error);
    return null;
  }
};

export const incrementProjectViews = async (projectId: string): Promise<void> => {
  // TODO: Replace with your actual database query
  try {
    const { error } = await supabase.rpc('increment_views', {
      project_id: projectId
    });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error incrementing views:', error);
  }
};

export const toggleProjectLike = async (
  projectId: string,
  userId: string,
  galleryId: string
): Promise<number> => {
  // TODO: Replace with your actual database query
  try {
    // Check if user already liked
    const { data: existing } = await supabase
      .from('gallery_engagement')
      .select('liked')
      .eq('gallery_item_id', galleryId)
      .eq('user_id', userId)
      .single();
    
    if (existing) {
      // Toggle like
      await supabase
        .from('gallery_engagement')
        .update({ liked: !existing.liked })
        .eq('gallery_item_id', galleryId)
        .eq('user_id', userId);
    } else {
      // Create new like
      await supabase
        .from('gallery_engagement')
        .insert({
          gallery_item_id: galleryId,
          user_id: userId,
          liked: true
        });
    }
    
    // Get updated like count
    const { count } = await supabase
      .from('gallery_engagement')
      .select('*', { count: 'exact', head: true })
      .eq('gallery_item_id', galleryId)
      .eq('liked', true);
    
    return count || 0;
  } catch (error) {
    console.error('Error toggling like:', error);
    return 0;
  }
};

export const getSortedCountries = () => {
  // TODO: Return your list of countries
  return [
    { name: 'United States', code: 'US' },
    { name: 'United Kingdom', code: 'GB' },
    { name: 'Canada', code: 'CA' },
    { name: 'Australia', code: 'AU' },
    { name: 'Germany', code: 'DE' },
    { name: 'France', code: 'FR' },
    { name: 'Spain', code: 'ES' },
    { name: 'Italy', code: 'IT' },
    { name: 'Japan', code: 'JP' },
    { name: 'China', code: 'CN' },
    // Add more countries as needed
  ];
};
```

### Step 3: Update Gallery Pages

Update the imports in `Saas/src/pages/Gallery/index.tsx`:

```typescript
// Replace these lines:
const fetchGalleryItems = async (_opts: any) => [];
const getSortedCountries = () => [];

// With:
import { fetchGalleryItems, getSortedCountries } from '../../lib/gallery';
```

Update the imports in `Saas/src/pages/Gallery/gallerydetails/index.tsx`:

```typescript
// Replace these lines:
const fetchGalleryItemById = async (id: string) => null;
const fetchGalleryItems = async (_opts: any) => [];
const incrementProjectViews = async (id: string) => {};
const toggleProjectLike = async (...) => 0;
const useAuth = () => ({ user: null, loading: false });

// With:
import {
  fetchGalleryItemById,
  fetchGalleryItems,
  incrementProjectViews,
  toggleProjectLike,
} from '../../../lib/gallery';
import { useAuth } from '../../../hooks/useAuth'; // Adjust path as needed
```

### Step 4: Test

1. Start your development server:
```bash
npm run dev
# or
yarn dev
```

2. Navigate to:
   - Gallery page: `http://localhost:3000/gallery`
   - Detail page: `http://localhost:3000/gallery/1` (replace 1 with actual ID)

3. Check for:
   - ✅ Page loads without console errors
   - ✅ Cards display properly
   - ✅ Filters work
   - ✅ Navigation to detail page works
   - ✅ Images load (or show placeholder)
   - ✅ Responsive design on mobile

## 🎨 Key Features

### Gallery Page
- **Hero Section**: Stats display (Active Projects, Views, etc.)
- **Filter Sidebar**: Search, Status, Category, Country, City, Tags
- **Grid Layout**: Responsive card grid
- **GalleryCard Component**: Reusable card with image, badges, author, stats

### Gallery Detail Page
- **Image Gallery**: Main image with thumbnail navigation
- **Project Info**: Title, description, author, location, category
- **Investment Section**: Auction/bidding information
- **Technical Specs**: Patent status, development stage
- **Documents**: Available documents for investors
- **Related Items**: Similar projects carousel
- **Social Sharing**: Share buttons

## 🔧 Customization

### Change Colors
Edit `Saas/src/assets/scss/config/_variables.scss` to update Velzon theme colors.

### Add More Filters
In `Saas/src/pages/Gallery/index.tsx`, add new filter states and UI elements in the filter sidebar.

### Customize Card Layout
Edit `Saas/src/Components/Common/GalleryCard.tsx` to modify the card design.

### Add Pagination
Implement pagination in the Gallery page for better performance with large datasets.

## 📊 Database Schema Example

If using Supabase/PostgreSQL, here's a suggested schema:

```sql
-- Gallery Items Table
CREATE TABLE gallery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist TEXT,
  subtitle TEXT,
  image_url TEXT,
  images TEXT[],
  category TEXT,
  views INTEGER DEFAULT 0,
  available_status BOOLEAN DEFAULT true,
  available_label TEXT,
  badges TEXT[],
  likes INTEGER DEFAULT 0,
  author_name TEXT,
  author_avatar_url TEXT,
  author_country TEXT,
  author_verified BOOLEAN DEFAULT false,
  date TEXT,
  description TEXT,
  location TEXT,
  project_id TEXT,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Gallery Engagement Table (for likes, views tracking)
CREATE TABLE gallery_engagement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_item_id UUID REFERENCES gallery_items(id),
  user_id UUID REFERENCES auth.users(id),
  liked BOOLEAN DEFAULT false,
  viewed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(gallery_item_id, user_id)
);

-- Function to increment views
CREATE OR REPLACE FUNCTION increment_views(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE gallery_items
  SET views = views + 1,
      updated_at = NOW()
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX idx_gallery_items_approved ON gallery_items(approved);
CREATE INDEX idx_gallery_items_category ON gallery_items(category);
CREATE INDEX idx_gallery_items_location ON gallery_items(location);
CREATE INDEX idx_gallery_engagement_gallery_item ON gallery_engagement(gallery_item_id);
CREATE INDEX idx_gallery_engagement_user ON gallery_engagement(user_id);
```

## 🐛 Troubleshooting

### Issue: Pages don't load
- **Solution**: Check that routes are properly configured in `allRoutes.tsx`

### Issue: Images don't display
- **Solution**: Verify image URLs in your database and update placeholder path

### Issue: Toast notifications don't appear
- **Solution**: Ensure `ToastContainer` is rendered and `react-toastify` CSS is imported

### Issue: Filters don't work
- **Solution**: Connect backend functions and ensure data format matches `GalleryItem` interface

### Issue: Like button doesn't work
- **Solution**: Implement `useAuth` hook and `toggleProjectLike` function

### Issue: Styling looks wrong
- **Solution**: Ensure Velzon theme CSS is loaded in your app

## 📚 Additional Resources

- [Velzon Documentation](https://themesbrand.com/velzon/documentation/)
- [Reactstrap Components](https://reactstrap.github.io/)
- [React Router v7](https://reactrouter.com/)
- [React Toastify](https://fkhadra.github.io/react-toastify/)

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Backend functions are implemented and tested
- [ ] Authentication is properly configured
- [ ] Database is set up with proper schema
- [ ] Environment variables are configured
- [ ] Image hosting/CDN is set up
- [ ] Error handling is comprehensive
- [ ] Loading states are properly displayed
- [ ] Responsive design is tested on all devices
- [ ] Performance is optimized (lazy loading, pagination)
- [ ] SEO meta tags are added
- [ ] Analytics tracking is implemented (if needed)

---

**Need Help?** Check the `GALLERY_UPDATE_SUMMARY.md` file for more detailed information.
