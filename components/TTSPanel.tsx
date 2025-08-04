'use client';
import { useSpring, animated } from '@react-spring/web';
import { useAppStore } from '@/lib/store';
import { useEffect, useRef, useState } from 'react';
import { getTTSManager } from '@/lib/tts';

export default function TTSPanel() {
  const isPlaying = useAppStore((state) => state.isPlaying);
  const progress = useAppStore((state) => state.progress);
  const currentText = useAppStore((state) => state.currentText);
  const textLength = currentText.length;
  const seekTo = useAppStore((state) => state.seekTo);

  // Define animation for panel appearance/disappearance
  const panelAnimation = useSpring({
    opacity: isPlaying ? 1 : 0,
    height: isPlaying ? 200 : 0, // Use numerical values for animation
    transform: isPlaying ? 'translateY(0)' : 'translateY(-10px)',
    config: { tension: 200, friction: 20 }, // Smooth spring animation
  });

  // Ref for the scrubber track
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Update progress from TTSManager
  useEffect(() => {
    getTTSManager().setProgressCallback((newProgress) => {
      if (!isDragging) {
        useAppStore.getState().setProgress(newProgress);
      }
    });
    return () => {
      getTTSManager().setProgressCallback(() => {});
    };
  }, [isDragging]);

  // Handle scrubber drag
  const handleMouseDown = () => {
    setIsDragging(true);
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      const newProgress = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      useAppStore.getState().setProgress(newProgress);
    }
  };
  const handleMouseUp = () => {
    setIsDragging(false);
    seekTo(progress);
  };
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, progress]);

  // Animation for scrubber movement
  const scrubberAnimation = useSpring({
    left: `${progress * 100}%`,
    config: { tension: 200, friction: 20 },
  });

  // Refs for tracking progress changes
  const lastProgressRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(Date.now());

  // States for waveform animation
  const [phase, setPhase] = useState(0);
  const [speed, setSpeed] = useState(0.1);
  const [amp, setAmp] = useState(20);

  // Update speed and amp based on progress changes (approximating speech rhythm)
  useEffect(() => {
    if (!isPlaying) {
      lastProgressRef.current = 0;
      lastTimeRef.current = Date.now();
      setSpeed(0.1);
      setAmp(20);
      return;
    }

    const now = Date.now();
    const dt = now - lastTimeRef.current;
    const dprogress = progress - lastProgressRef.current;

    if (dt > 0 && dprogress > 0) {
      const rate = dprogress / (dt / 1000); // progress per second
      setSpeed(rate * 10); // Tune multiplier for desired speed
      const dchar = dprogress * textLength;
      setAmp(dchar * 2 + 10); // Tune for amplitude based on character delta
    }

    lastProgressRef.current = progress;
    lastTimeRef.current = now;
  }, [progress, isPlaying, textLength]);

  // Animate phase when playing
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPhase((p) => p + speed);
      }, 50); // Update every 50ms
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, speed]);

  // Compute waveform heights based on sine wave for wave-like effect
  const waveformHeights = Array.from({ length: 50 }, (_, i) =>
    amp * (Math.sin(i * 0.2 + phase) * 0.5 + 0.5) + 10
  );

  return (
    <animated.div
      style={panelAnimation}
      className="w-full bg-gray-50 p-3 rounded-b shadow-md overflow-hidden"
    >
      <div className="grid grid-cols-2 gap-2">
        {/* Modern Waveform Visualization */}
        <div className="col-span-2 bg-gradient-to-r from-blue-100 to-blue-200 h-12 relative flex items-center justify-center rounded-lg shadow-inner">
          <div className="absolute inset-0 flex items-end px-2 space-x-0.5 overflow-hidden">
            {waveformHeights.map((height, i) => (
              <animated.div
                key={i}
                className="bg-blue-500 rounded-t w-full transition-all duration-150 ease-in-out"
                style={{
                  height: isPlaying ? `${height}px` : '0px', // Animate height to 0 when not playing
                  boxShadow: isPlaying ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none', // Add subtle shadow for depth
                  opacity: isPlaying ? 1 : 0.5, // Fade when not playing
                }}
              />
            ))}
            {/* Progress overlay with gradient */}
            <div
              className="absolute top-0 bottom-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-40 transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
        {/* Scrubber with improved styling */}
        <div className="col-span-2 relative">
          <div
            ref={trackRef}
            className="bg-gray-200 h-1 rounded-full cursor-pointer shadow-sm"
            onMouseDown={handleMouseDown}
          >
            <animated.div
              style={scrubberAnimation}
              className="absolute w-4 h-4 bg-blue-500 rounded-full -top-1.5 -ml-2 shadow-md ring-2 ring-blue-300 ring-opacity-50 transition-shadow duration-200 hover:shadow-lg"
            />
          </div>
        </div>
        {/* Placeholder for Voice Selector */}
        <div className="bg-gray-200 h-8 flex items-center justify-center text-sm text-gray-600 rounded-md">
          Voice Selector (To be implemented)
        </div>
        {/* Placeholder for Speed Selector */}
        <div className="bg-gray-200 h-8 flex items-center justify-center text-sm text-gray-600 rounded-md">
          Speed Selector (To be implemented)
        </div>
        {/* Placeholder for Recording Selector */}
        <div className="col-span-2 bg-gray-200 h-8 flex items-center justify-center text-sm text-gray-600 rounded-md">
          Recording Selector (To be implemented)
        </div>
      </div>
    </animated.div>
  );
}