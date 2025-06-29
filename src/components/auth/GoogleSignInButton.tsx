
'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px" className="mr-2">
    <path fill="#EA4335" d="M24 9.5c3.438 0 6.338 1.162 8.625 3.325L37.188 8.2C33.412 4.912 29.062 3 24 3 15.675 3 8.625 7.613 5.625 14.575l4.763 3.688C11.763 13.2 17.488 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.012 24.5H24v9h12.312c-1.675 4.825-6.312 8.238-12.312 8.238-7.325 0-13.325-5.975-13.325-13.3s5.988-13.3 13.325-13.3c3.762 0 6.975 1.525 9.212 3.638l4.475-4.475C34.588 7.188 29.775 5 24 5 13.288 5 4.5 11.525 4.5 22.5S13.288 40 24 40c10.275 0 18.025-6.912 18.025-17.625 0-1.35-.125-2.875-.375-4.875H46.012z"/>
    <path fill="#FBBC05" d="M10.388 18.262C9.013 20.062 9.013 22.438 10.388 24.238l-4.763 3.688C3.675 25.025 3.675 19.875 5.625 16.925L10.388 18.262z"/>
    <path fill="#34A853" d="M24 47c5.25 0 9.762-1.725 12.975-4.625l-4.475-4.475C30.613 39.3 27.525 40.5 24 40.5c-5.825 0-10.762-3.438-12.588-8.238l-4.862 3.788C9.388 42.7 16.062 47 24 47z"/>
  </svg>
);


export default function GoogleSignInButton({ actionText = "Entrar com Google" }: { actionText?: string }) {
  const { signInWithGoogle, authAction } = useAuth();

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={signInWithGoogle}
      disabled={authAction !== null}
    >
      {authAction === 'google' ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      {actionText}
    </Button>
  );
}
