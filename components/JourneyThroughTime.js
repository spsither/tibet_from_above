'use client';

import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Import FontAwesome icons

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

  if (!hasMounted) return null;

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-12">
        {/* Image Container */}
        <div className="relative flex-1 h-[400px] sm:h-[500px] rounded-xl overflow-hidden shadow-xl group">
          <img
            src={items[currentIndex].image}
            alt={items[currentIndex].label}
            loading="lazy"
            className="w-full h-full object-cover transition-all duration-500 ease-in-out"
          />

          {/* Click Zones */}
          <div
            className="absolute top-0 left-0 w-1/2 h-full cursor-pointer"
            onClick={handlePrev}
          />
          <div
            className="absolute top-0 right-0 w-1/2 h-full cursor-pointer"
            onClick={handleNext}
          />

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center space-x-2">
            {items.map((_, index) => (
              <span
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all cursor-pointer rounded-full ${
                  currentIndex === index
                    ? 'w-4 h-4 bg-white'
                    : 'w-2 h-2 bg-white/60'
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

      {/* Buttons with Arrow Icons and Faded Background */}
      {/* <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 flex gap-4">
        <button
          onClick={handlePrev}
          className="flex items-center justify-center p-2 bg-gray-800 bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all"
        >
          <FaChevronLeft className="text-white" />
        </button>
        <button
          onClick={handleNext}
          className="flex items-center justify-center p-2 bg-gray-800 bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all"
        >
          <FaChevronRight className="text-white" />
        </button>
      </div> */}
    </div>
  );
}
