'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { FieldLabel, FieldError } from '@/components/ui/field';
import { useAuth } from '@/lib/auth-context';
import { Eye, EyeOff, LogIn, Sparkles } from 'lucide-react';

const signinSchema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email')
    .required('Email is required'),
  password: yup.string().required('Password is required'),
});

export default function SignInPage() {
  const router = useRouter();
  const { signin } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signinSchema),
  });

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    try {
      await signin(data.email, data.password);
      router.push('/events');
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 p-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-50 mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-400">
            Sign in to your account to continue
          </p>
        </div>

        <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-900/20">
          <CardContent className="pt-6 pb-8 px-6 sm:px-8">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5">
              {error && (
                <div className="p-4 text-sm text-red-300 bg-red-500/10 rounded-2xl border border-red-500/30 backdrop-blur-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <FieldLabel
                  htmlFor="email"
                  className="text-sm font-medium text-slate-300">
                  Email Address
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className="h-12 bg-slate-900/70 border-slate-800/70 text-slate-100 placeholder:text-slate-500 rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                />
                {errors.email && (
                  <FieldError className="text-red-400">
                    {errors.email.message}
                  </FieldError>
                )}
              </div>

              <div className="space-y-2">
                <FieldLabel
                  htmlFor="password"
                  className="text-sm font-medium text-slate-300">
                  Password
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...register('password')}
                    className="h-12 pr-10 bg-slate-900/70 border-slate-800/70 text-slate-100 placeholder:text-slate-500 rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 focus:outline-none transition-colors">
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <FieldError className="text-red-400">
                    {errors.password.message}
                  </FieldError>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-105 mt-6"
                disabled={loading}>
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800/70"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-slate-950/70 text-slate-400">
                    New to Campus Connect?
                  </span>
                </div>
              </div>

              <Link href="/signup">
                <Button
                  variant="outline"
                  className="w-full h-12 text-base border-slate-700 text-slate-300 bg-slate-950/70 hover:bg-slate-900 hover:border-slate-600 hover:text-slate-100 rounded-full transition-all"
                  type="button">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create an Account
                </Button>
              </Link>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-6">
          By signing in, you agree to our Terms of Service and Privacy
          Policy
        </p>
      </div>
    </div>
  );
}
