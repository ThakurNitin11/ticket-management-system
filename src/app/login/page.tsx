"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Eye, EyeOff, CheckSquare, Square, Ticket, AlertCircle, ShieldCheck, Zap, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const rememberMe = watch('rememberMe');

  const onSubmit = async (data: LoginFormValues) => {
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || 'Login failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#07090e] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans relative overflow-hidden">
      
      {/* Background Decorative Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Glassmorphic Container Grid */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 min-h-[640px] bg-slate-900/40 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl relative z-10">
        
        {/* Left Side: Professional Branding Section */}
        <div className="lg:col-span-6 relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-950/90 border-r border-slate-800/60 overflow-hidden">
          
          {/* Subtle Grid Accent Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          {/* Logo */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              helpdesk
            </span>
          </div>

          {/* Hero Center Text */}
          <div className="space-y-6 relative z-10 my-auto py-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
              <Zap className="w-3.5 h-3.5" /> Next-Gen Support Engine
            </div>
            <h1 className="text-4xl font-extrabold text-white leading-[1.15] tracking-tight">
              Manage tickets with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                speed and precision.
              </span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Streamline agent workflows, route critical issues seamlessly, and maintain high resolution rates with an intelligent workspace.
            </p>

            {/* Feature Highlights */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Enterprise-grade security
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                <Lock className="w-4 h-4 text-indigo-400" /> End-to-end access control
              </div>
            </div>
          </div>

          {/* Footer Badge */}
          <div className="relative z-10 text-xs text-slate-500 flex items-center gap-2 pt-4">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Operational • Authorized Personnel Only</span>
          </div>
        </div>

        {/* Right Side: Clean Login Form */}
        <div className="lg:col-span-6 flex flex-col justify-center p-8 sm:p-12 lg:p-14 bg-slate-900/30">
          
          {/* Mobile Logo */}
          <div className="flex items-center gap-2.5 lg:hidden mb-8">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              helpdesk
            </span>
          </div>

          <div className="w-full max-w-sm mx-auto space-y-7">
            
            {/* Headline */}
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Log in
              </h2>
              <p className="text-sm text-slate-400 font-medium">
                Enter your credentials to access your workspace.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-rose-300 leading-relaxed">
                  {error}
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Email address</label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={`w-full h-11 px-4 bg-slate-800/50 border ${
                    errors.email 
                      ? 'border-rose-500/80 focus:ring-rose-500/20' 
                      : 'border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
                  } rounded-xl text-sm font-medium focus:outline-none focus:ring-4 transition-all text-white placeholder:text-slate-500 shadow-sm`}
                  placeholder="name@company.com"
                />
                {errors.email && (
                  <p className="text-rose-400 text-[11px] font-bold ml-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register('password')}
                    className={`w-full h-11 pl-4 pr-11 bg-slate-800/50 border ${
                      errors.password 
                        ? 'border-rose-500/80 focus:ring-rose-500/20' 
                        : 'border-slate-700/80 focus:ring-indigo-500/20 focus:border-indigo-500'
                    } rounded-xl text-sm font-medium focus:outline-none focus:ring-4 transition-all text-white placeholder:text-slate-500 shadow-sm`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-rose-400 text-[11px] font-bold ml-1">{errors.password.message}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center pt-1 text-xs">
                <button 
                  type="button"
                  onClick={() => setValue('rememberMe', !rememberMe, { shouldValidate: true })}
                  className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors select-none font-medium cursor-pointer"
                >
                  {rememberMe ? (
                    <CheckSquare className="w-4 h-4 text-indigo-500" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600" />
                  )}
                  <span>Remember me</span>
                </button>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Log in</span>
                  )}
                </button>
              </div>
            </form>

            <div className="pt-4 text-center border-t border-slate-800/80">
              <p className="text-[11px] text-slate-500 font-medium">
                Authorized Agent & Administrator Access Only
              </p>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}