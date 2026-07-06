import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PagedTextProps {
  content: string;
  isCapsule?: boolean;
  renderFooter?: (pagination: {
    currentPage: number;
    totalPages: number;
    handlePrev: () => void;
    handleNext: () => void;
  }) => React.ReactNode;
}

export function PagedText({ content, isCapsule = false, renderFooter }: PagedTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);

  const [containerWidth, setContainerWidth] = useState(0);
  const GAP = 80; // Увеличиваем отступ для исключения наложений

  useEffect(() => {
    let timerId: NodeJS.Timeout;

    const updatePages = () => {
      if (!containerRef.current || !textRef.current) return;
      
      const width = Math.floor(containerRef.current.clientWidth);
      if (width === 0) return; // Игнорируем пересчет, когда контейнер скрыт (display: none)
      
      setContainerWidth(width);
      
      const scrollWidth = textRef.current.scrollWidth;
      
      // Более точный расчет страниц для CSS columns
      const calculatedPages = Math.max(1, Math.ceil((scrollWidth + GAP) / (width + GAP)));
      setTotalPages(calculatedPages);
      
      if (currentPage >= calculatedPages) {
        setCurrentPage(Math.max(0, calculatedPages - 1));
      }
    };

    // Use a ResizeObserver to detect when the container or text changes size
    const resizeObserver = new ResizeObserver(() => {
      // Даем браузеру время на отрисовку колонок после display: block
      clearTimeout(timerId);
      timerId = setTimeout(updatePages, 50);
    });

    if (containerRef.current) resizeObserver.observe(containerRef.current);
    if (textRef.current) resizeObserver.observe(textRef.current);

    // Initial calculation
    timerId = setTimeout(updatePages, 50);
    
    return () => {
      clearTimeout(timerId);
      resizeObserver.disconnect();
    };
  }, [content, currentPage]);

  const handlePrev = () => setCurrentPage(p => Math.max(0, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages - 1, p + 1));

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div 
        className={cn(
          "w-full flex-1 relative overflow-hidden flex flex-col justify-center",
          isCapsule 
            ? "bg-white p-8 rounded-[2.5rem] border-4 border-[#e6d5bc] shadow-xl min-h-[300px]"
            : "bg-white/60 p-8 rounded-[2rem] border-4 border-[#e6d5bc]/50 shadow-inner"
        )}
      >
        {isCapsule && <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />}
        
        <div className={cn(
          "h-full w-full relative overflow-hidden",
          !isCapsule ? "border-l-4 border-[#e6d5bc]/50 pl-8" : "border-l-4 border-[#e6d5bc]/50 pl-4"
        )}>
          <div 
            ref={containerRef}
            className="h-full w-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentPage * (containerWidth + GAP)}px)` }}
          >
            <div 
              ref={textRef}
              className={cn(
                "h-full leading-relaxed whitespace-pre-wrap font-serif italic text-left",
                isCapsule ? "text-2xl text-[#5c4a33]" : "text-lg md:text-xl text-[#6d5b43]"
              )}
              style={{ 
                columnWidth: containerWidth ? `${containerWidth}px` : 'auto',
                columnGap: `${GAP}px`
              }}
            >
              {isCapsule ? `"${content}"` : `"${content}"`}
            </div>
          </div>
        </div>
      </div>
      
      {renderFooter ? renderFooter({ currentPage, totalPages, handlePrev, handleNext }) : (
        totalPages > 1 && (
          <div className="flex items-center justify-between px-4 shrink-0">
            <button 
              onClick={handlePrev} 
              disabled={currentPage === 0} 
              className="p-4 rounded-2xl bg-white border-4 border-[#e6d5bc] text-[#5c4a33] disabled:opacity-30 shadow-md hover:scale-105 transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <span className="text-xs font-black text-[#8b7355]">
              {currentPage + 1} / {totalPages}
            </span>
            <button 
              onClick={handleNext} 
              disabled={currentPage === totalPages - 1} 
              className="p-4 rounded-2xl bg-white border-4 border-[#e6d5bc] text-[#5c4a33] disabled:opacity-30 shadow-md hover:scale-105 transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )
      )}
    </div>
  );
}
