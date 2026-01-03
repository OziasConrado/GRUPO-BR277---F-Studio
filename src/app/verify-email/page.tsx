
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { MailCheck, Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VerifyEmailPage() {
  const { currentUser, isAuthenticating, reloadUser, signOutUser, resendVerificationEmail, authAction } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticating) {
      return; 
    }
    if (!currentUser) {
      router.push('/login');
    } else if (currentUser.emailVerified) {
      router.push('/');
    }
  }, [currentUser, isAuthenticating, router]);

  const handleCheckVerification = async () => {
    await reloadUser();
    if (currentUser?.emailVerified) {
        toast({ title: "Sucesso!", description: "Seu e-mail foi verificado. Bem-vindo(a)!" });
        router.push('/');
    } else {
        toast({ title: "Ainda não verificado", description: "Por favor, verifique seu e-mail e tente novamente. Lembre-se de checar a caixa de spam.", variant: "destructive" });
    }
  };

  if (isAuthenticating || !currentUser || currentUser.emailVerified) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 bg-muted/40">
      <Card className="w-full max-w-md shadow-xl rounded-2xl text-center">
        <CardHeader>
          <MailCheck className="mx-auto h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold font-headline">Verifique seu E-mail</CardTitle>
          <CardDescription className="pt-2">
            Enviamos um link de verificação para{' '}
            <strong className="text-foreground">{currentUser.email}</strong>. Por favor,
            clique no link para ativar sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Não recebeu o e-mail? Verifique sua pasta de spam ou clique para reenviar.
            </p>
          <Button 
            onClick={handleCheckVerification} 
            className="w-full rounded-full py-3 text-base"
            disabled={authAction === 'reload'}
          >
            {authAction === 'reload' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Já verifiquei, continuar
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={resendVerificationEmail}
              className="w-full rounded-full"
              disabled={authAction === 'resend-verification'}
            >
              {authAction === 'resend-verification' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4"/>}
              Reenviar e-mail
            </Button>
            <Button variant="link" onClick={signOutUser} className="text-muted-foreground hover:text-primary">
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    