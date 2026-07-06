'use client';

import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  color: 'amber' | 'red' | 'sky' | 'emerald' | 'stone';
  icon: React.ReactNode;
}

export function StatCard({ label, value, color, icon }: StatCardProps) {
  const colors: Record<string, string> = {
    amber: "text-amber-700",
    red: "text-red-700",
    sky: "text-sky-700",
    emerald: "text-emerald-700",
    stone: "text-stone-700",
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-6 rounded-[2.5rem] bg-[#f2e2ba] border-8 border-[#3e2723]/5 shadow-lg flex flex-col items-center justify-center gap-3 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 pointer-events-none" />
      <div className={cn("w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm relative z-10", colors[color])}>
        {icon}
      </div>
      <div className="text-center relative z-10">
        <p className="text-3xl font-black text-amber-950 tracking-tighter">{value}</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-900/40">{label}</p>
      </div>
    </motion.div>
  );
}
