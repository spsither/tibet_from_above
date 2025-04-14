'use client';
import { useState, useRef, useEffect } from 'react';
import { FaExpand, FaCompress } from 'react-icons/fa';

export default function TimeSlices({ slices = [] }) {
  const [current, setCurrent] = useState(0);
  const [imageStates, setImageStates] = useState(() =>
    slices.map(() => ({ zoom: 100, position: { x: 0, y: 0 } }))
  );

  const [isDragging, setIsDragging] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const start = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);

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
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    setIsDragging(true);
    start.current = { x: clientX, y: clientY };
  };

  const handleMove = (e) => {
    if (!isDragging) return;

    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

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

  const handleEnd = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    if (containerRef.current && containerRef.current.contains(e.target) && !e.ctrlKey) {
      e.preventDefault();
      const zoomChange = e.deltaY < 0 ? 10 : -10;
      const newZoom = Math.min(300, Math.max(100, currentZoom + zoomChange));
      updateImageState({ zoom: newZoom });
    }
  };

  const scrollPosition = useRef({ x: 0, y: 0 });

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
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);


  const toggleFullscreen = () => {
    const elem = containerRef.current;

    const isCurrentlyFullscreen =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;

    if (isCurrentlyFullscreen) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    } else {
      scrollPosition.current = {
        x: window.scrollX,
        y: window.scrollY,
      };
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    }
  };

  useEffect(() => {
    const onUp = () => setIsDragging(false);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
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
  }, [currentZoom]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10">
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
        {/* Fullscreen toggle button */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-2 right-2 z-20 bg-white/30 p-2 rounded-full text-black backdrop-blur-lg shadow hover:bg-white/60 transition"
        >
          {isFullScreen ? <FaCompress size={20} /> : <FaExpand size={20} />}
        </button>

        <img
          ref={imageRef}
          src={slices[current].image}
          alt={slices[current].label}
          loading="lazy"
          className="absolute w-full h-full object-cover object-center transition-transform duration-300 ease-in-out"
          style={{
            transform: `scale(${currentZoom / 100})`,
            transformOrigin: 'center',
            left: `${currentPosition.x}px`,
            top: `${currentPosition.y}px`,
          }}
          draggable={false}
        />
      </div>

      {/* Slice Buttons */}
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
