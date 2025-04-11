'use client';

import { useState, useEffect, useRef } from 'react';

export default function BeforeAfterSlider({ before, after, alt, description, beforeLabel = "Before", afterLabel = "After" }) {
  const [sliderValue, setSliderValue] = useState(50);
  const [hasMounted, setHasMounted] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const snapSlider = (val) => {
    if (val < 2) return 0;
    if (val > 98) return 100;
    return val;
  };

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderValue(snapSlider(percentage));
  };

  const handleTouchMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderValue(snapSlider(percentage));
  };


  const handleSliderChange = (e) => {
    setSliderValue(Number(e.target.value));
  };

  if (!hasMounted) return null;
  
  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Image container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative w-full h-[300px] md:h-[500px] overflow-hidden rounded-xl shadow-lg"

      >
        {/* After image (left) */}
        <img
          src={after}
          alt={alt || 'After'}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Before image (right) */}
        <img
          src={before}
          alt={alt || 'Before'}
          className={`absolute inset-0 w-full h-full object-cover ${sliderValue <= 5 || sliderValue >= 95
              ? 'transition-[clip-path] duration-150 ease-out'
              : 'transition-none'
            }`}
          style={{
            clipPath: `inset(0 ${100 - sliderValue}% 0 0)`,
            WebkitClipPath: `inset(0 ${100 - sliderValue}% 0 0)`,
          }}
        />


        {/* Labels */}
        <span
          className="absolute top-2 left-2 bg-black/40 text-white text-[10px] px-1.5 py-0.5 rounded transition-opacity duration-500"
          style={{
            opacity: sliderValue > 25 ? 1 : 0,
          }}
        >
          {beforeLabel}
        </span>

        <span
          className="absolute top-2 right-2 bg-black/40 text-white text-[10px] px-1.5 py-0.5 rounded transition-opacity duration-500"
          style={{
            opacity: sliderValue < 75 ? 1 : 0,
          }}
        >
          {afterLabel}
        </span>


      </div>

      {/* Slider */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderValue}
        onChange={handleSliderChange}
        className="w-full mt-4 appearance-none h-2 rounded-lg bg-gray-300 cursor-pointer"
      />

      {/* Description */}
      {description && (
        <p className="mt-4 text-center text-sm text-gray-600 font-medium">
          {description}
        </p>
      )}
    </div>
  );
}
