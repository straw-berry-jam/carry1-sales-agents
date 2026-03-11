'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Briefcase, Clock, ArrowLeft } from 'lucide-react';

export default function AssessmentPage() {
  return (
    <main className="min-h-screen bg-textured-gradient px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16">
          <Link href="/guide" className="text-2xl font-bold tracking-tighter">
            SEI <span className="text-white/60">Internal Tools</span>
          </Link>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <Link 
            href="/guide" 
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Internal Tools
          </Link>

          <div className="glass-card p-12 text-center space-y-6">
            <div className="inline-flex p-4 rounded-2xl bg-white/10">
              <Briefcase className="w-12 h-12 text-white" />
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                AI Assessment Coach
              </h1>
              <p className="text-xl text-white/60 max-w-lg mx-auto">
                Practice AI/ML maturity assessments with Jordan Ellis, your AI buyer simulation.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-white/40">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">Coming Soon</span>
            </div>

            <div className="pt-6">
              <p className="text-sm text-white/40 max-w-md mx-auto">
                This agent is currently in development. Check back soon for realistic 
                assessment practice sessions with scoring and feedback.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
