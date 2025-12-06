'use client';

import React from 'react';
import { BenefitsSection } from '@/components/auth/BenefitsSection';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { Calendar } from 'lucide-react';

function SignUp() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />

      <div className="w-full max-w-4xl relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-50">
              Campus Connect
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-50 mb-2">
            Join Campus Connect
          </h1>
          <p className="text-slate-400">
            Create your account and start discovering amazing events
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <BenefitsSection />
          <SignUpForm />
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </main>
  );
}

export default SignUp;

