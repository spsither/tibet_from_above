'use client';
import { useState, useRef, useEffect } from 'react';
import { FaExpand, FaCompress } from 'react-icons/fa';

export default function TimeSlices({ slices = [] }) {
  const [current, setCurrent] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // State to track dragging
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Position for dragging
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const start = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);

  const renderPosition = () => {
    if (imageRef.current) {
      imageRef.current.style.left = `${position.x}px`;
      imageRef.current.style.top = `${position.y}px`;
    }
  };

  // Mouse and touch start for dragging
  const handleStart = (e) => {
    e.preventDefault();
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    setIsDragging(true);
    start.current = { x: clientX, y: clientY };
  };

  // Mouse and touch move for dragging
  const handleMove = (e) => {
    if (!isDragging) return;

    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

    const dx = clientX - start.current.x;
    const dy = clientY - start.current.y;

    setPosition((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    start.current = { x: clientX, y: clientY };

    if (!animationFrame.current) {
      animationFrame.current = requestAnimationFrame(() => {
        renderPosition();
        animationFrame.current = null;
      });
    }
  };

  // Mouse and touch end for dragging
  const handleEnd = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    if (containerRef.current && containerRef.current.contains(e.target) && !e.ctrlKey) {
      e.preventDefault();
      const zoomChange = e.deltaY < 0 ? 10 : -10;
      setZoomLevel((prev) => Math.min(300, Math.max(100, prev + zoomChange)));
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const elem = containerRef.current;
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const onUp = () => setIsDragging(false);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp); // For touch end event
    return () => {
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  useEffect(() => {
    position.x = 0;
    position.y = 0;
    renderPosition();
  }, [current]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10 relative">
      {/* Fullscreen button at the top-right */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-1 right-4 bg-white/30 p-2 rounded-full text-black backdrop-blur-lg shadow hover:bg-white/60 transition"
      >
        {isFullscreen ? <FaCompress size={20} /> : <FaExpand size={20} />}
      </button>

      <div className="absolute top-14 sm:top-2 left-1/2 transform -translate-x-1/2 flex flex-wrap justify-center gap-2 z-10 px-2">
  {slices.map((slice, index) => (
    <button
      key={index}
      onClick={() => setCurrent(index)}
      className={`px-3 py-1 text-sm rounded-full font-medium transition-colors duration-200 ${
        index === current
          ? 'bg-black text-white'
          : 'bg-gray-200 text-gray-800 hover:bg-white'
      }`}
    >
      {slice.label}
    </button>
  ))}
</div>


      {/* Image container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[16/9] overflow-hidden rounded-xl shadow-lg bg-black"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        style={{
          touchAction: 'none',
          userSelect: 'none',
          cursor: isDragging ? 'grabbing' : 'zoom-in',
        }}
      >
        <img
          ref={imageRef}
          src={slices[current].image}
          alt={slices[current].label}
          loading="lazy"
          className="absolute w-full h-full object-cover object-center transition-transform duration-300 ease-in-out"
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'center',
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}
