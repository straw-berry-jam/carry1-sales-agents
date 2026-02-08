'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { agentConfig } from '@/lib/agentConfig';

export default function FinalCTA() {
  return (
    <section className="py-24 px-6 bg-black/20">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Prepare Like a Pro?
        </h2>
        
        <p className="text-white/70 text-xl mb-10 max-w-2xl mx-auto">
          {agentConfig.landing.finalCta.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/setup" className="btn-primary">
            Get Started Now
          </Link>
          <Link href="/about" className="text-link text-lg">
            Questions? Learn More
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
