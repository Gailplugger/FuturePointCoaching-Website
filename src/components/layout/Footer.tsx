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

          {/* Developer Branding - ASTRAFORENSICS */}
          <motion.a
            href={siteConfig.branding.developerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/10 to-cyan-600/10 blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
            <span className="relative text-xs text-gray-400 group-hover:text-gray-300">
              Crafted by
            </span>
            <span className="relative font-bold text-sm bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:via-cyan-300 group-hover:to-blue-300">
              ASTRAFORENSICS
            </span>
            <div className="relative w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </motion.a>
        </div>
      </div>
    </footer>
  );
}
