'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="space-y-8 text-white/80 leading-relaxed text-lg">
            <p>
              Last Updated: January 31, 2026
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Information We Collect</h2>
              <p>
                When you use the CARRY1 Sales Coach, we collect information you provide directly to us, such as your professional role, target company, and the text or audio of your practice interview sessions.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">How We Use Your Information</h2>
              <p>
                We use the information we collect to provide, maintain, and improve our services, specifically to generate personalized feedback and interview scoring for your preparation.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Data Security</h2>
              <p>
                We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us through our contact page.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
