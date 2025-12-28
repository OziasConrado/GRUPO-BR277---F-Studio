
'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn } from 'lucide-react';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
  password: z.string().min(1, { message: 'Senha é obrigatória.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginFormComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const { signInWithEmail, currentUser, loading, authAction } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!loading && currentUser) {
      router.push(redirectUrl); 
    }
  }, [currentUser, loading, router, redirectUrl]);

  const onSubmit = async (data: LoginFormValues) => {
    await signInWithEmail(data.email, data.password);
  };
  
  if (loading || (!loading && currentUser)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-12 px-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader className="text-center items-center">
           <img
            src="https://firebasestorage.googleapis.com/v0/b/grupo-br277.appspot.com/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2Flogo-grupobr-277-2.png?alt=media"
            alt="Logotipo GRUPO BR277"
            width="200"
            height="80"
            className="mb-4"
          />
          <CardTitle className="text-3xl font-bold font-headline">Bem-vindo(a) de volta!</CardTitle>
          <CardDescription>Faça login para continuar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className="mt-1 rounded-lg"
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className="mt-1 rounded-lg"
              />
              {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
            </div>
             <div className="relative flex items-center justify-center my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                    Ou continue com
                    </span>
                </div>
            </div>
            <GoogleSignInButton actionText="Entrar com Google"/>
            <Button type="submit" className="w-full rounded-full py-3 text-base mt-4" disabled={authAction !== null}>
              {authAction === 'email' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar com E-mail
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center text-sm space-y-2">
          <p>
            Não tem uma conta?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Cadastre-se
            </Link>
          </p>
          <Link href="/forgot-password" className="text-muted-foreground hover:underline">
            Esqueceu a senha?
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <LoginFormComponent />
    </React.Suspense>
  );
}
