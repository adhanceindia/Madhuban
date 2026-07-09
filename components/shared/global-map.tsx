'use client'

import { motion } from 'framer-motion'
import { SectionHeading } from '@/components/shared/section-heading'

export function GlobalMap() {
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          centered
          eyebrow="Location"
          title="Find your way to Madhuban."
          description="Nestled in the peaceful surroundings of Agar Malwa District, Madhya Pradesh."
        />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mt-12 overflow-hidden rounded-card bg-primary-light p-3 shadow-[0_20px_60px_rgba(27,28,25,0.05)]"
        >
          <div className="relative overflow-hidden rounded-card-inner" style={{ minHeight: '28rem' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d58844.83936774386!2d76.0!3d23.71!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3963711111111111%3A0x1111111111111111!2sAgar%20Malwa%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '28rem' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Madhuban Garden Resort location on Google Maps"
              className="absolute inset-0"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6">
              <div className="pointer-events-auto max-w-xs rounded-card-inner bg-white/95 p-5 shadow-xl backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-label text-primary-deep/70">
                  Resort Location
                </p>
                <p className="text-foreground/80 mt-3 text-sm leading-7">
                  Agar Malwa District, Madhya Pradesh
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
