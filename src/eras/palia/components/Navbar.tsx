'use client';

import { motion } from 'framer-motion';
import { Heart, Camera, Book, CheckSquare, Mail, User, Send } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useModal } from '@/context/ModalContext';

const navItems = [
  { href: '/', icon: Heart, label: 'Talia' },
  { href: '/gallery', icon: Camera, label: 'Галерея' },
  { href: '/journal', icon: Book, label: 'Журнал' },
  { href: '/bucket-list', icon: CheckSquare, label: 'Квесты' },
  { href: '/stats', icon: Mail, label: 'Письма' },
  { href: '/profile', icon: User, label: 'Мы' },
];

export const Navbar = () => {
  const pathname = usePathname();
  const { isModalOpen } = useModal();

  if (isModalOpen) return null;

  return (
    <>
      {/* Desktop Navbar (Hidden on Mobile) */}
      <nav className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 backdrop-blur-xl px-4 md:px-10 py-4 rounded-[2.5rem] flex items-center justify-between shadow-2xl border-4 border-[#e6d5bc] relative overflow-hidden"
        >
          {/* Background texture */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
          
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.href} href={item.href} className="relative group">
                <motion.div
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "flex flex-col items-center gap-1.5 transition-all duration-300",
                    isActive ? "text-[#5c4a33] scale-110" : "text-[#8b7355]/50 hover:text-[#5c4a33]"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-xl transition-colors",
                    isActive ? "bg-[#f5e6d3] shadow-inner" : "bg-transparent"
                  )}>
                    <Icon size={isActive ? 26 : 22} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest",
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}>
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>
      </nav>

      {/* Mobile Native-style Tab Bar (Hidden on Desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[#fdfaf3]/95 backdrop-blur-xl border-t border-[#e6d5bc]/30 pb-safe shadow-[0_-8px_20px_rgba(92,74,51,0.08)]">
        <div className="flex items-center justify-around h-20 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center relative h-full">
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className="flex flex-col items-center justify-center gap-1.5 w-full"
                >
                  <div className="relative flex items-center justify-center w-11 h-11">
                    {isActive && (
                      <motion.div
                        layoutId="mobileActiveBubble"
                        className="absolute inset-0 bg-[#5c4a33] rounded-full shadow-md"
                        transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                      />
                    )}
                    <Icon 
                      size={22} 
                      strokeWidth={isActive ? 2.5 : 2} 
                      className={cn(
                        "relative z-10 transition-colors duration-300", 
                        isActive ? "text-[#fdfaf3]" : "text-[#8b7355]/60"
                      )}
                    />
                  </div>
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest transition-colors duration-300",
                    isActive ? "text-[#5c4a33] opacity-100" : "text-[#8b7355]/60 opacity-80"
                  )}
                  style={{ fontSize: '8px' }}>
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};
