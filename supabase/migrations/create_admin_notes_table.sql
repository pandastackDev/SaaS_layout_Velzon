-- Create admin_notes table for admin comments and notes on users/projects
CREATE TABLE IF NOT EXISTS public.admin_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    note_type VARCHAR(50) NOT NULL DEFAULT 'user_profile', -- 'user_profile', 'project', etc.
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Admin who created the note
    
    -- Composite unique constraint on user_id and note_type
    UNIQUE(user_id, note_type)
);

-- Create indexes for efficient queries
CREATE INDEX idx_admin_notes_user_id ON public.admin_notes(user_id);
CREATE INDEX idx_admin_notes_note_type ON public.admin_notes(note_type);
CREATE INDEX idx_admin_notes_created_at ON public.admin_notes(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

-- Admin users can view all admin notes
CREATE POLICY "Admins can view admin notes" ON public.admin_notes
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.user_type = 'Admin'
        )
    );

-- Admin users can create and update admin notes
CREATE POLICY "Admins can create and update admin notes" ON public.admin_notes
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.user_type = 'Admin'
        )
    );

CREATE POLICY "Admins can update admin notes" ON public.admin_notes
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.user_type = 'Admin'
        )
    );

-- Only admins can delete admin notes
CREATE POLICY "Admins can delete admin notes" ON public.admin_notes
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.user_type = 'Admin'
        )
    );
