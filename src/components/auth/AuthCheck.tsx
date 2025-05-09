'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import AuthModal from './AuthModal';

interface AuthCheckProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiresAuth?: boolean;
}

/**
 * A component that conditionally renders content based on authentication state.
 * 
 * @param children - Content to render if authenticated
 * @param fallback - Optional content to render if not authenticated
 * @param requiresAuth - If true, will always check auth. If false, will only show AuthModal on demand.
 */
export default function AuthCheck({ 
  children, 
  fallback, 
  requiresAuth = false 
}: AuthCheckProps) {
  const { data: session, status } = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  // If explicitly requiring auth and not authenticated, show fallback or modal
  if (requiresAuth && status !== 'loading' && !session) {
    if (fallback) {
      return <>{fallback}</>;
    } else {
      // Redirect to login page if no fallback provided
      router.push('/login');
      return null;
    }
  }

  // Create a wrapped version of children that can trigger auth when needed
  const wrappedChildren = !session ? (
    <div onClick={() => setShowAuthModal(true)}>
      {children}
    </div>
  ) : (
    children
  );

  return (
    <>
      {wrappedChildren}
      
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      )}
    </>
  );
}