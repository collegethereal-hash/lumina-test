'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div 
      className={cn(
        "animate-pulse bg-[#e6d5bc]/30 rounded-lg",
        className
      )} 
    />
  );
};

export const SkeletonCard = () => {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 border-4 border-[#e6d5bc] space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-20 w-full" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
};
