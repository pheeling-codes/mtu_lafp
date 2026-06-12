'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { healthCheck } from '@/lib/api';
import { supabaseClient } from '@/utils/supabaseClient';
import { 
  Search, 
  Package, 
  Shield, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Database,
  Server,
  Layout
} from 'lucide-react';

interface HealthStatus {
  api: 'loading' | 'connected' | 'error';
  supabase: 'loading' | 'connected' | 'error';
  apiMessage?: string;
}

export default function Home() {
  const router = useRouter();
  const [health, setHealth] = useState<HealthStatus>({
    api: 'loading',
    supabase: 'loading',
  });

  useEffect(() => {
    // Check API health
    const checkApiHealth = async () => {
      try {
        const response = await healthCheck();
        setHealth(prev => ({
          ...prev,
          api: response.status === 'ok' ? 'connected' : 'error',
          apiMessage: response.database === 'connected' 
            ? 'API + Database connected' 
            : 'API connected, Database issue',
        }));
      } catch {
        setHealth(prev => ({
          ...prev,
          api: 'error',
          apiMessage: 'API connection failed',
        }));
      }
    };

    // Check Supabase connection
    const checkSupabaseHealth = async () => {
      try {
        // Use a simple auth check instead of querying users table
        const { data: { session } } = await supabaseClient.auth.getSession();
        setHealth(prev => ({
          ...prev,
          supabase: 'connected',
        }));
      } catch {
        setHealth(prev => ({
          ...prev,
          supabase: 'error',
        }));
      }
    };

    checkApiHealth();
    checkSupabaseHealth();
  }, []);

  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: 'Smart Search',
      description: 'AI-powered matching to quickly find your lost items',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure Claims',
      description: 'Verification system ensures items return to rightful owners',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Real-time Updates',
      description: 'Instant notifications when matches are found',
    },
  ];

  const getStatusIcon = (status: string) => {
    if (status === 'connected') return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    if (status === 'error') return <AlertCircle className="w-5 h-5 text-rose-500" />;
    return <div className="w-5 h-5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-8 h-8 text-indigo-600" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              MTU Lost & Found
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <button 
              onClick={() => router.push('/lost-items')}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
            >
              Report Lost
            </button>
            <button 
              onClick={() => router.push('/found-items')}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
            >
              Report Found
            </button>
            <button 
              onClick={() => router.push('/login')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Find What You Lost,
            <span className="text-indigo-600"> Return What You Found</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
            The centralized lost and found portal for Mountain Top University. 
            Connecting students and staff to reunite lost items with their owners.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => router.push('/found-items')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search Items
            </button>
            <button 
              onClick={() => router.push('/report')}
              className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-xl font-medium border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-all"
            >
              Report Item
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* System Status */}
        <div className="mt-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Layout className="w-5 h-5 text-indigo-600" />
            System Status
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <Server className="w-5 h-5 text-slate-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">API Server</p>
                <p className="text-xs text-slate-500">Port 4001</p>
              </div>
              {getStatusIcon(health.api)}
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <Database className="w-5 h-5 text-slate-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Database</p>
                <p className="text-xs text-slate-500">Supabase PostgreSQL</p>
              </div>
              {getStatusIcon(health.supabase)}
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <Layout className="w-5 h-5 text-slate-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Frontend</p>
                <p className="text-xs text-slate-500">Next.js + Tailwind</p>
              </div>
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          {health.apiMessage && (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 text-center">
              {health.apiMessage}
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-slate-500">
            2025 MTU Centralized Lost and Found Portal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
