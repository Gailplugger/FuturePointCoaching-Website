'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Heart } from 'lucide-react';
import { siteConfig, navLinks } from '@/lib/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-900 border-t border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">{siteConfig.name}</h3>
            <p className="text-gray-400 text-sm">{siteConfig.description}</p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-accent-orange transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="w-5 h-5 text-accent-orange flex-shrink-0 mt-0.5" />
                <span>{siteConfig.contact.address}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="w-5 h-5 text-accent-orange flex-shrink-0" />
                <a
                  href={`tel:${siteConfig.contact.phone}`}
                  className="hover:text-white transition-colors"
                >
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="w-5 h-5 text-accent-orange flex-shrink-0" />
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="hover:text-white transition-colors"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Working Hours</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Clock className="w-5 h-5 text-accent-orange flex-shrink-0" />
                <span>{siteConfig.contact.hours.weekday}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Clock className="w-5 h-5 text-accent-orange flex-shrink-0" />
                <span>{siteConfig.contact.hours.weekend}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {currentYear} {siteConfig.name}. All rights reserved.
          </p>

          {/* Developer Branding - MANDATORY */}
          <motion.a
            href={siteConfig.branding.developerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-all group"
            aria-label="AstraForensics website (opens in new tab)"
            whileHover={{ y: -3, scale: 1.02 }}
            transition={{ duration: 0.15 }}
          >
            <span className="font-script text-sm italic opacity-80 group-hover:opacity-100">
              Made with
            </span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
            <span className="font-script text-sm italic opacity-80 group-hover:opacity-100">
              by
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80 group-hover:opacity-100 group-hover:text-accent-orange">
              ASTRAFORENSICS
            </span>
          </motion.a>
        </div>
      </div>
    </footer>
  );
}
