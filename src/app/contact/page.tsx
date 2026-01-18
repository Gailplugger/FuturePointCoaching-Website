'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { siteConfig } from '@/lib/constants';
import { contactSchema, type ContactFormData } from '@/lib/validations';
import { PageTransition, SlideUp } from '@/components/motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const contactInfo = [
  {
    icon: MapPin,
    title: 'Address',
    content: siteConfig.contact.address,
    href: `https://maps.google.com/?q=${encodeURIComponent(siteConfig.contact.address)}`,
  },
  {
    icon: Phone,
    title: 'Phone',
    content: siteConfig.contact.phone,
    href: `tel:${siteConfig.contact.phone}`,
  },
  {
    icon: Mail,
    title: 'Email',
    content: siteConfig.contact.email,
    href: `mailto:${siteConfig.contact.email}`,
  },
  {
    icon: Clock,
    title: 'Working Hours',
    content: `${siteConfig.contact.hours.weekday}\n${siteConfig.contact.hours.weekend}`,
    href: null,
  },
];

export default function ContactPage() {
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('https://formspree.io/f/xjggyleq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || 'Not provided',
          message: data.message,
        }),
      });

      if (response.ok) {
        setSubmitStatus({
          success: true,
          message: 'Thank you for your message! We will get back to you soon.',
        });
        reset();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: 'Failed to send message. Please try again or contact us directly.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      {/* Hero Section */}
      <section className="py-12 md:py-16 bg-gradient-dark">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <SlideUp>
              <span className="inline-block px-4 py-2 bg-accent-orange/20 text-accent-orange rounded-full text-sm font-medium mb-6">
                Get in Touch
              </span>
            </SlideUp>
            <SlideUp delay={0.1}>
              <h1 className="heading-1 mb-6">
                Contact <span className="text-gradient">Us</span>
              </h1>
            </SlideUp>
            <SlideUp delay={0.2}>
              <p className="text-xl text-gray-300">
                Have questions? We'd love to hear from you. Reach out to us and
                we'll respond as soon as possible.
              </p>
            </SlideUp>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <SlideUp>
                <h2 className="heading-3 mb-6">Contact Information</h2>
              </SlideUp>

              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <SlideUp key={info.title} delay={index * 0.1}>
                    <Card className="group">
                      <CardContent className="flex items-start gap-4 py-4">
                        <div className="w-12 h-12 bg-accent-orange/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-accent-orange/30 transition-colors">
                          <info.icon className="w-6 h-6 text-accent-orange" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white mb-1">
                            {info.title}
                          </h3>
                          {info.href ? (
                            <a
                              href={info.href}
                              target={info.href.startsWith('http') ? '_blank' : undefined}
                              rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                              className="text-gray-400 hover:text-accent-orange transition-colors whitespace-pre-line"
                            >
                              {info.content}
                            </a>
                          ) : (
                            <p className="text-gray-400 whitespace-pre-line">
                              {info.content}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </SlideUp>
                ))}
              </div>

              {/* Map */}
              <SlideUp delay={0.4}>
                <Card className="overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3509.0!2d74.66!3d28.43!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDI1JzQ4LjAiTiA3NMKwMzknMzYuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
                    width="100%"
                    height="250"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Location Map"
                    className="grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </Card>
              </SlideUp>
            </div>

            {/* Contact Form */}
            <SlideUp delay={0.2}>
              <Card>
                <CardContent className="p-8">
                  <h2 className="heading-3 mb-6">Send us a Message</h2>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                      label="Full Name"
                      placeholder="Your name"
                      error={errors.name?.message}
                      {...register('name')}
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="your@email.com"
                      error={errors.email?.message}
                      {...register('email')}
                    />

                    <Input
                      label="Phone Number (optional)"
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      error={errors.phone?.message}
                      {...register('phone')}
                    />

                    <Textarea
                      label="Message"
                      placeholder="How can we help you?"
                      rows={5}
                      error={errors.message?.message}
                      {...register('message')}
                    />

                    {/* Submit Status */}
                    {submitStatus && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg flex items-start gap-3 ${
                          submitStatus.success
                            ? 'bg-green-500/20 border border-green-500/30'
                            : 'bg-red-500/20 border border-red-500/30'
                        }`}
                      >
                        {submitStatus.success ? (
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        )}
                        <p
                          className={
                            submitStatus.success ? 'text-green-400' : 'text-red-400'
                          }
                        >
                          {submitStatus.message}
                        </p>
                      </motion.div>
                    )}

                    <Button
                      type="submit"
                      isLoading={isSubmitting}
                      className="w-full"
                      size="lg"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </SlideUp>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
