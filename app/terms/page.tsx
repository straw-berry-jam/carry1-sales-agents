'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <div className="space-y-8 text-white/80 leading-relaxed text-lg">
            <p>
              Last Updated: January 31, 2026
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Acceptance of Terms</h2>
              <p>
                By accessing or using the CARRY1 Sales Coach, you agree to be bound by these Terms of Service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Use of Service</h2>
              <p>
                You agree to use the service only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Intellectual Property</h2>
              <p>
                The service and its original content, features, and functionality are and will remain the exclusive property of CARRY1.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Disclaimer</h2>
              <p>
                The CARRY1 Sales Coach is provided "as is" and "as available" without any warranties of any kind, either express or implied.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
