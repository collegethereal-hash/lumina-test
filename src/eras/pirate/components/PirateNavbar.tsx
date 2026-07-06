'use client';

import { motion } from 'framer-motion';
import { Anchor, Fish, Music, Scroll, Coins, Users, Compass, Info } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Anchor, label: 'Бухта' },
  { href: '/gallery', icon: Fish, label: 'Рыбалка' },
  { href: '/music', icon: Music, label: 'Песни' },
  { href: '/bucket-list', icon: Scroll, label: 'Кодекс' },
  { href: '/stats', icon: Compass, label: 'Острова' },
  { href: '/profile', icon: Users, label: 'Каюта' },
];

export const PirateNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();

  // Удаляем блокировку для страницы статистики, чтобы навигация была видна
  // if (pathname === '/stats') return null;

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] w-[95%] max-w-2xl pointer-events-auto">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#f2e2ba]/80 backdrop-blur-xl border-[6px] border-[#3e2723]/10 px-2 sm:px-4 md:px-8 py-3 rounded-[2.5rem] flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative overflow-hidden pointer-events-auto isolate"
      >
        {/* Paper texture effect */}
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <button
              key={item.href}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(item.href);
              }}
              className="relative group cursor-pointer pointer-events-auto z-[10000] px-2"
            >
              <motion.div
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-300",
                  isActive ? "text-amber-600 scale-105" : "text-amber-900/40 hover:text-amber-700"
                )}
              >
                <div className={cn(
                  "p-3 rounded-2xl transition-all duration-500 relative",
                  isActive ? "bg-amber-600 text-white shadow-lg shadow-amber-900/20" : "bg-transparent"
                )}>
                  <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                </div>
                <span className={cn(
                  "text-[8px] font-black uppercase tracking-[0.25em] transition-all duration-300",
                  isActive ? "opacity-100 mt-1" : "opacity-0 group-hover:opacity-100"
                )}>
                  {item.label}
                </span>
              </motion.div>
            </button>
          );
        })}
      </motion.div>
    </nav>
  );
};
