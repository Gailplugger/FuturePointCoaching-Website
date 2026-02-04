'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Server, AlertTriangle, CreditCard, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ServerMaintenancePopupProps {
  onClose?: () => void;
  delayMs?: number;
}

const POPUP_DISMISSED_KEY = 'fp_maintenance_dismissed';
const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function ServerMaintenancePopup({ 
  onClose, 
  delayMs = 3000 
}: ServerMaintenancePopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Check if popup was recently dismissed
    const dismissedAt = localStorage.getItem(POPUP_DISMISSED_KEY);
    if (dismissedAt) {
      const dismissTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissTime < DISMISS_DURATION) {
        return; // Don't show popup if dismissed within last 24 hours
      }
    }

    // Show popup after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(POPUP_DISMISSED_KEY, Date.now().toString());
    onClose?.();
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleExpand = () => {
    setIsMinimized(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Minimized State - Small Badge */}
          {isMinimized ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="fixed bottom-4 right-4 z-[100]"
            >
              <button
                onClick={handleExpand}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Server className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-semibold">Server Notice</span>
              </button>
            </motion.div>
          ) : (
            /* Full Popup */
            <motion.div
              initial={{ opacity: 0, y: 50, x: 50 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: 50, x: 50 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="fixed bottom-4 right-4 z-[100] w-[340px]"
            >
              <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-xl shadow-2xl border border-orange-500/30 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 px-4 py-3 flex items-center justify-between border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Server className="w-5 h-5 text-orange-400" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </div>
                    <span className="font-semibold text-white text-sm">Server Maintenance</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleMinimize}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="Minimize"
                    >
                      <div className="w-3 h-0.5 bg-gray-400" />
                    </button>
                    <button
                      onClick={handleClose}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="Dismiss for 24 hours"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                  {/* Warning Icon & Message */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm mb-1">
                        Server Maintenance Required
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed">
                        To ensure uninterrupted service and optimal performance, 
                        regular server maintenance is required.
                      </p>
                    </div>
                  </div>

                  {/* Price Box */}
                  <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-3 border border-orange-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-orange-400" />
                        <span className="text-gray-300 text-sm">Monthly Fee</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-orange-400">₹599</span>
                        <span className="text-xs text-gray-500">/month</span>
                      </div>
                    </div>
                  </div>

                  {/* Warning Notice */}
                  <div className="flex items-start gap-2 bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                    <Clock className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-300">
                      <strong>Important:</strong> Without regular maintenance payment, 
                      server operations cannot be sustained. Please ensure timely payment 
                      to avoid service disruption.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      onClick={() => {
                        // You can add a payment link here
                        window.open('https://wa.me/919876543210?text=Hi, I want to pay for server maintenance', '_blank');
                      }}
                    >
                      <CreditCard className="w-4 h-4 mr-1" />
                      Pay Now
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClose}
                      className="text-xs"
                    >
                      Later
                    </Button>
                  </div>

                  {/* Contact Info */}
                  <p className="text-center text-[10px] text-gray-500">
                    Contact admin for payment details or queries
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
