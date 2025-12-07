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
import { Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const signUpSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  role: yup
    .string()
    .oneOf(['student', 'organizer'], 'Invalid role')
    .required('Please select a role'),
  organizationName: yup
    .string().optional(),
});

export function SignUpForm() {
  const router = useRouter();
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signUpSchema),
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    try {
      await signup(
        data.firstName,
        data.lastName,
        data.email,
        data.password,
        data.role,
        data.organizationName
      );
      router.push('/events');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full bg-slate-950/70 border-slate-800/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-900/20">
      <CardContent className="pt-6 pb-8 px-6 sm:px-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-4 text-sm text-red-300 bg-red-500/10 rounded-2xl border border-red-500/30 backdrop-blur-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <FieldLabel
                htmlFor="firstName"
                className="text-sm font-medium text-slate-300">
                First Name
              </FieldLabel>
              <Input
                id="firstName"
                type="text"
                {...register('firstName')}
                placeholder="John"
                className="h-11 bg-slate-900/70 border-slate-800/70 text-slate-100 placeholder:text-slate-500 rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              />
              {errors.firstName && (
                <FieldError className="text-red-400 text-xs">
                  {errors.firstName.message}
                </FieldError>
              )}
            </div>

            <div className="space-y-2">
              <FieldLabel
                htmlFor="lastName"
                className="text-sm font-medium text-slate-300">
                Last Name
              </FieldLabel>
              <Input
                id="lastName"
                type="text"
                {...register('lastName')}
                placeholder="Doe"
                className="h-11 bg-slate-900/70 border-slate-800/70 text-slate-100 placeholder:text-slate-500 rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              />
              {errors.lastName && (
                <FieldError className="text-red-400 text-xs">
                  {errors.lastName.message}
                </FieldError>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel
              htmlFor="email"
              className="text-sm font-medium text-slate-300">
              Email Address
            </FieldLabel>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="john.doe@example.com"
              className="h-11 bg-slate-900/70 border-slate-800/70 text-slate-100 placeholder:text-slate-500 rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
            />
            {errors.email && (
              <FieldError className="text-red-400 text-xs">
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
                {...register('password')}
                placeholder="••••••••"
                className="h-11 pr-10 bg-slate-900/70 border-slate-800/70 text-slate-100 placeholder:text-slate-500 rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
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
              <FieldError className="text-red-400 text-xs">
                {errors.password.message}
              </FieldError>
            )}
          </div>

          <div className="space-y-2">
            <FieldLabel
              htmlFor="confirmPassword"
              className="text-sm font-medium text-slate-300">
              Confirm Password
            </FieldLabel>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                placeholder="••••••••"
                className="h-11 pr-10 bg-slate-900/70 border-slate-800/70 text-slate-100 placeholder:text-slate-500 rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 focus:outline-none transition-colors">
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <FieldError className="text-red-400 text-xs">
                {errors.confirmPassword.message}
              </FieldError>
            )}
          </div>

          <div className="space-y-2">
            <FieldLabel
              htmlFor="role"
              className="text-sm font-medium text-slate-300">
              I am a
            </FieldLabel>
            <select
              id="role"
              {...register('role')}
              className="flex h-11 w-full rounded-xl border border-slate-800/70 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 ring-offset-background placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50">
              <option value="" className="bg-slate-900 text-slate-400">
                Select role...
              </option>
              <option value="student" className="bg-slate-900 text-slate-100">
                Student
              </option>
              <option value="organizer" className="bg-slate-900 text-slate-100">
                Event Organizer
              </option>
            </select>
            {errors.role && (
              <FieldError className="text-red-400 text-xs">
                {errors.role.message}
              </FieldError>
            )}
          </div>

          {selectedRole === 'organizer' && (
            <div className="space-y-2">
              <FieldLabel
                htmlFor="organizationName"
                className="text-sm font-medium text-slate-300">
                Organization Name{' '}
                <span className="text-slate-500 font-normal">(Optional)</span>
              </FieldLabel>
              <Input
                id="organizationName"
                type="text"
                {...register('organizationName')}
                placeholder="e.g., Computer Science Club"
                className="h-11 bg-slate-900/70 border-slate-800/70 text-slate-100 placeholder:text-slate-500 rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              />
              {errors.organizationName && (
                <FieldError className="text-red-400 text-xs">
                  {errors.organizationName.message}
                </FieldError>
              )}
              <p className="text-xs text-slate-400">
                This name will be displayed as the event organizer instead of
                your personal name
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-105 mt-6"
            disabled={loading}>
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                Create Account
              </>
            )}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800/70"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-slate-950/70 text-slate-400">
                Already have an account?
              </span>
            </div>
          </div>

          <Link href="/signin">
            <Button
              variant="outline"
              className="w-full h-12 text-base border-slate-700 text-slate-300 bg-slate-950/70 hover:bg-slate-900 hover:border-slate-600 hover:text-slate-100 rounded-full transition-all"
              type="button">
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
