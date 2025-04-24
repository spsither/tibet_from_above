'use client';

import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Image from 'next/image'

export default function JourneyThroughTime({ items = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  if (!hasMounted || items.length === 0) return null;

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-12">
        {/* Image Container */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-xl overflow-hidden shadow-xl group">

          <Image
            fill={true}
            src={items[currentIndex].image}
            alt={items[currentIndex].label}
            loading="lazy"
            className="object-cover transition-all duration-500 ease-in-out"
          />

          {/* Clickable Halves */}
          <div
            onClick={handlePrev}
            className="absolute left-0 top-0 w-1/2 h-full z-10 cursor-pointer"
          />
          <div
            onClick={handleNext}
            className="absolute right-0 top-0 w-1/2 h-full z-10 cursor-pointer"
          />

          {/* Arrow Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 transition-opacity opacity-80 hover:opacity-100"
          >
            <FaChevronLeft className="text-white w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 transition-opacity opacity-80 hover:opacity-100"
          >
            <FaChevronRight className="text-white w-6 h-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center space-x-2 z-20">
            {items.map((_, index) => (
              <span
                key={index}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to item ${index + 1}`}
                className={`transition-all cursor-pointer rounded-full ${currentIndex === index
                    ? 'w-2.5 h-2.5 bg-white'
                    : 'w-1.5 h-1.5 bg-white/60'
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Text Info */}
        <div className="w-full lg:w-[30%] text-center lg:text-left px-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {items[currentIndex].label}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed text-justify mb-4">
            {items[currentIndex].description}
          </p>
        </div>
      </div>
    </div>
  );
}
