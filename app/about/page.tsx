'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ExternalLink } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-textured-gradient px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center text-white/60 hover:text-white mb-12 transition-colors group">
          <ChevronLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12"
        >
          <h1 className="text-4xl font-bold mb-8">About</h1>
          
          <div className="space-y-8 text-white/80 leading-relaxed text-lg">
            <p className="text-white font-medium text-xl">
              Most interview advice is generic. Ours comes from 30 years of hands-on hiring.
            </p>
            
            <p>
              Over three decades, SEI has conducted hundreds of thousands of interviews, developing frameworks that go beyond credentials to identify what truly makes professionals succeed: cultural alignment, executive presence, collaboration, and the drive and humility that define exceptional teammates.
            </p>

            <p>
              This hiring rigor is why we've earned Consulting Magazine's #1 "Best Firm to Work For" multiple years in a row and built a culture our people genuinely love. We know what interviewers look for because we've been those interviewers, and we've embedded that expertise into this tool.
            </p>

            <p>
              If you'd like to learn more about how we work and what we do, visit{' '}
              <a 
                href="https://sei.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-gradient-red transition-colors inline-flex items-center gap-1 font-semibold"
              >
                sei.com <ExternalLink className="w-4 h-4" />
              </a>.
            </p>

            <div className="pt-8 text-center sm:text-left">
              <Link href="/contact" className="btn-primary inline-block">
                Contact Us
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
