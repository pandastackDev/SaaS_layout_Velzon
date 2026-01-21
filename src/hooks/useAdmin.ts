import { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousAdminStateRef = useRef<boolean | null>(null);
  const stableUserRef = useRef<string | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // If we have a user, check admin status
    if (user?.email) {
      const currentUserEmail = user.email.toLowerCase().trim();
      
      // If user hasn't changed, keep previous admin state (prevent flickering)
      if (stableUserRef.current === currentUserEmail && previousAdminStateRef.current !== null) {
        setIsAdmin(previousAdminStateRef.current);
        setLoading(false);
        return;
      }

      stableUserRef.current = currentUserEmail;
      
      // Get admin email from environment variable, fallback to default
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@example.com';
      
      // Check if user email matches admin email (case-insensitive)
      const normalizedAdminEmail = adminEmail.toLowerCase().trim();
      const adminStatus = currentUserEmail === normalizedAdminEmail;
      
      console.log('useAdmin check:', { 
        userEmail: currentUserEmail, 
        adminEmail: normalizedAdminEmail, 
        isAdmin: adminStatus, 
        authLoading 
      });
      
      previousAdminStateRef.current = adminStatus;
      setIsAdmin(adminStatus);
      setLoading(false);
      return;
    }

    // If no user and auth is done loading, user is not authenticated
    if (!authLoading && !user) {
      // Only set to false if we're sure (not during a session refresh)
      if (previousAdminStateRef.current === null || !authLoading) {
        previousAdminStateRef.current = false;
        setIsAdmin(false);
        setLoading(false);
      }
      return;
    }

    // If still loading auth, wait a bit longer before timing out
    // Don't change admin state during loading to prevent redirects
    if (authLoading) {
      // Keep previous state while loading to prevent redirects
      if (previousAdminStateRef.current !== null) {
        setIsAdmin(previousAdminStateRef.current);
        setLoading(true);
        return;
      }

      // Only set timeout if we haven't determined admin status yet
      timeoutRef.current = setTimeout(() => {
        console.warn('useAdmin: Auth loading timeout after 5s, checking with current state');
        
        // Try to check admin status even if authLoading is true
        if (user?.email) {
          const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@example.com';
          const userEmail = user.email.toLowerCase().trim();
          const normalizedAdminEmail = adminEmail.toLowerCase().trim();
          const adminStatus = userEmail === normalizedAdminEmail;
          previousAdminStateRef.current = adminStatus;
          setIsAdmin(adminStatus);
        } else {
          previousAdminStateRef.current = false;
          setIsAdmin(false);
        }
        setLoading(false);
      }, 5000); // Increased to 5 seconds to give more time
    }
  }, [user, authLoading]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { isAdmin, loading };
}
