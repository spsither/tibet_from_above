'use client';

import { useState, useRef, useEffect } from 'react';
import { FaExpand, FaCompress } from 'react-icons/fa';
import Image from 'next/image';

export default function TimeSlices({ slices = [] }) {
  const [current, setCurrent] = useState(0);
  const [imageStates, setImageStates] = useState(() =>
    slices.map(() => ({ zoom: 100, position: { x: 0, y: 0 } }))
  );

  const [isDragging, setIsDragging] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const start = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);
  const scrollPosition = useRef({ x: 0, y: 0 });

  const currentZoom = imageStates[current]?.zoom ?? 100;
  const currentPosition = imageStates[current]?.position ?? { x: 0, y: 0 };

  const renderPosition = () => {
    if (imageRef.current) {
      imageRef.current.style.left = `${currentPosition.x}px`;
      imageRef.current.style.top = `${currentPosition.y}px`;
    }
  };

  const updateImageState = (updates) => {
    setImageStates((prev) =>
      prev.map((state, idx) =>
        idx === current ? { ...state, ...updates } : state
      )
    );
  };

  const handleStart = (e) => {
    e.preventDefault();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;

    setIsDragging(true);
    start.current = { x: clientX, y: clientY };
  };

  const handleMove = (e) => {
    if (!isDragging) return;

    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;

    const dx = clientX - start.current.x;
    const dy = clientY - start.current.y;

    updateImageState({
      position: {
        x: currentPosition.x + dx,
        y: currentPosition.y + dy,
      },
    });

    start.current = { x: clientX, y: clientY };

    if (!animationFrame.current) {
      animationFrame.current = requestAnimationFrame(() => {
        renderPosition();
        animationFrame.current = null;
      });
    }
  };

  const handleEnd = () => setIsDragging(false);

  const handleWheel = (e) => {
    if (!containerRef.current?.contains(e.target) || e.ctrlKey) return;

    e.preventDefault();
    const zoomChange = e.deltaY < 0 ? 10 : -10;
    const newZoom = Math.min(300, Math.max(100, currentZoom + zoomChange));
    updateImageState({ zoom: newZoom });
  };

  const toggleFullscreen = () => {
    const elem = containerRef.current;
    if (!elem) return;

    scrollPosition.current = {
      x: window.scrollX,
      y: window.scrollY,
    };

    const isCurrentlyFullscreen =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;

    const requestFullscreen = () => {
      if (elem.requestFullscreen) return elem.requestFullscreen();
      if (elem.mozRequestFullScreen) return elem.mozRequestFullScreen();
      if (elem.webkitRequestFullscreen) return elem.webkitRequestFullscreen();
      if (elem.msRequestFullscreen) return elem.msRequestFullscreen();
      alert('Fullscreen API not supported.');
    };

    const exitFullscreen = () => {
      if (document.exitFullscreen) return document.exitFullscreen();
      if (document.mozCancelFullScreen) return document.mozCancelFullScreen();
      if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
      if (document.msExitFullscreen) return document.msExitFullscreen();
    };

    if (isCurrentlyFullscreen) {
      exitFullscreen();
    } else {
      requestFullscreen().catch((err) => {
        console.warn('Failed to enter fullscreen:', err);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      if (!isNowFullscreen) {
        window.scrollTo({
          top: scrollPosition.current.y,
          left: scrollPosition.current.x,
          behavior: 'auto',
        });
      }

      setIsFullScreen(Boolean(isNowFullscreen));
    };

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    renderPosition();
  }, [current]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [currentZoom, current]);

  useEffect(() => {
    const onUp = () => setIsDragging(false);
    window.addEventListener('mouseup', onUp);
    return () => window.removeEventListener('mouseup', onUp);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10">
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
          userSelect: 'none',
          cursor: isDragging ? 'grabbing' : 'zoom-in',
        }}
      >
        {!isMobile && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-2 right-2 z-20 bg-white/30 p-2 rounded-full text-black backdrop-blur-lg shadow hover:bg-white/60 transition"
          >
            {isFullScreen ? <FaCompress size={20} /> : <FaExpand size={20} />}
          </button>
        )}

        <Image
          fill={true}
          ref={imageRef}
          src={slices[current].image}
          alt={slices[current].label}
          loading="lazy"
          className="absolute w-full h-full object-cover object-center"
          style={{
            transform: `scale(${currentZoom / 100})`,
            transformOrigin: 'center',
            left: `${currentPosition.x}px`,
            top: `${currentPosition.y}px`,
          }}
          draggable={false}
        />
      </div>

      <div className="mt-4 px-2 flex flex-wrap justify-center gap-2 z-20">
        {slices.map((slice, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`px-3 py-1 text-sm rounded-full font-medium transition-colors duration-200 ${index === current
              ? 'bg-black text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-white'
              }`}
          >
            {slice.label}
          </button>
        ))}
      </div>
    </div>
  );
}
