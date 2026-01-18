'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Users,
  Award,
  Clock,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { Card, CardContent } from '@/components/ui/Card';
import { siteConfig, faculty } from '@/lib/constants';
import { PageTransition, SlideUp, StaggerContainer, StaggerItem } from '@/components/motion';

const features = [
  {
    icon: Users,
    title: 'Expert Faculty',
    description: 'Learn from experienced educators with proven track records.',
  },
  {
    icon: BookOpen,
    title: 'Comprehensive Notes',
    description: 'Access detailed study materials for all subjects and classes.',
  },
  {
    icon: Award,
    title: 'Proven Results',
    description: 'Join thousands of successful students who achieved their goals.',
  },
  {
    icon: Clock,
    title: 'Flexible Timing',
    description: 'Multiple batches available to fit your schedule.',
  },
];

export default function HomePage() {
  return (
    <PageTransition>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-dark" />
        
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-accent-orange/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-royal-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <SlideUp>
              <motion.span
                className="inline-block px-4 py-2 bg-accent-orange/20 text-accent-orange rounded-full text-sm font-medium mb-6"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                Welcome to Excellence
              </motion.span>
            </SlideUp>

            <SlideUp delay={0.1}>
              <h1 className="heading-1 mb-6">
                {siteConfig.name.split(' ').slice(0, 2).join(' ')}
                <br />
                <span className="text-gradient">
                  {siteConfig.name.split(' ').slice(2).join(' ')}
                </span>
              </h1>
            </SlideUp>

            <SlideUp delay={0.2}>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
                {siteConfig.tagline} — Expert Coaching for Competitive Success
              </p>
            </SlideUp>

            <SlideUp delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/notes">
                  <Button size="lg" className="w-full sm:w-auto">
                    Explore Notes
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </SlideUp>

            {/* Quick Stats */}
            <SlideUp delay={0.4}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
                {[
                  { value: '500+', label: 'Students Taught' },
                  { value: '2023', label: 'Founded' },
                  { value: '100%', label: 'Success Rate' },
                  { value: '24/7', label: 'Support' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-3xl md:text-4xl font-bold text-accent-orange">
                      {stat.value}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </SlideUp>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-1.5 bg-white rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-navy-900/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Why Choose Us?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We provide a nurturing environment where students can thrive and achieve their academic goals.
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <Card hover className="h-full">
                  <CardContent className="text-center">
                    <div className="w-14 h-14 bg-accent-orange/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-7 h-7 text-accent-orange" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Faculty Preview Section */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Meet Our Faculty</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our experienced educators are dedicated to helping you succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {faculty.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card hover className="overflow-hidden">
                  <div className="flex items-center gap-4 p-6">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-accent-orange/50">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {member.name}
                      </h3>
                      <p className="text-accent-orange text-sm">{member.subject}</p>
                      <p className="text-gray-400 text-sm">{member.experience}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/about">
              <Button variant="outline">
                Learn More About Us
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-navy-800 to-navy-700">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="heading-2 mb-4">Ready to Start Your Journey?</h2>
              <p className="text-gray-300 mb-8">
                Join Future Point Coaching Institute today and take the first step towards academic excellence.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <a
                  href={`tel:${siteConfig.contact.phone}`}
                  className="flex items-center gap-3 text-white hover:text-accent-orange transition-colors"
                >
                  <div className="w-12 h-12 bg-accent-orange/20 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-accent-orange" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-400">Call us at</p>
                    <p className="font-semibold">{siteConfig.contact.phone}</p>
                  </div>
                </a>

                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="flex items-center gap-3 text-white hover:text-accent-orange transition-colors"
                >
                  <div className="w-12 h-12 bg-accent-orange/20 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-accent-orange" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-400">Email us at</p>
                    <p className="font-semibold">{siteConfig.contact.email}</p>
                  </div>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
