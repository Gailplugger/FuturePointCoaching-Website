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
            className="group relative flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-950/50 via-indigo-950/50 to-cyan-950/50 border border-purple-500/30 hover:border-cyan-400/60 transition-all duration-500 overflow-hidden"
            whileHover={{ scale: 1.08, boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)' }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-cyan-500/20 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-cyan-400 to-blue-600 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500 animate-pulse" />
            
            {/* Made with love text */}
            <span className="relative text-xs text-gray-400 group-hover:text-gray-200 transition-colors duration-300 flex items-center gap-1.5">
              Made with
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              >
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
              </motion.span>
              by
            </span>
            
            {/* ASTRAFORENSICS text with glow */}
            <span className="relative font-black text-sm tracking-wider bg-gradient-to-r from-purple-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(139,92,246,0.5)] group-hover:drop-shadow-[0_0_20px_rgba(34,211,238,0.8)] transition-all duration-500" style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0.1em' }}>
              ASTRAFORENSICS
            </span>
            
            {/* Animated dot indicator */}
            <motion.div 
              className="relative w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400"
              animate={{ 
                boxShadow: ['0 0 5px #22d3ee', '0 0 15px #22d3ee', '0 0 5px #22d3ee'],
                scale: [1, 1.2, 1]
              }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            />
          </motion.a>
        </div>
      </div>
    </footer>
  );
}
