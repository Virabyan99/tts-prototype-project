'use client';

import { useSpring, animated } from '@react-spring/web';
import { useAppStore } from '@/lib/store';
import { useEffect, useRef, useState } from 'react';
import { getTTSManager } from '@/lib/tts';

// Predefined heights for waveform bars to avoid hydration mismatch
const waveformHeights = [
  20, 30, 25, 35, 40, 30, 20, 25, 35, 30, 20, 40, 25, 30, 35, 20, 25, 30, 35, 40,
];

export default function TTSPanel() {
  const isPlaying = useAppStore((state) => state.isPlaying);
  const progress = useAppStore((state) => state.progress);
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

  return (
    <animated.div
      style={panelAnimation}
      className="w-full bg-gray-50 p-3 rounded-b shadow-md overflow-hidden"
    >
      <div className="grid grid-cols-2 gap-2">
        {/* Waveform Visualization */}
        <div className="col-span-2 bg-gray-200 h-12 relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            {/* Simulated waveform bars with fixed heights */}
            {waveformHeights.map((height, i) => (
              <div
                key={i}
                className="bg-blue-400 w-1 mx-0.5"
                style={{ height: `${height}px` }}
              />
            ))}
            {/* Progress overlay */}
            <div
              className="absolute top-0 bottom-0 bg-blue-600 opacity-50"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
        {/* Scrubber */}
        <div className="col-span-2 relative">
          <div
            ref={trackRef}
            className="bg-gray-300 h-2 rounded-full cursor-pointer"
            onMouseDown={handleMouseDown}
          >
            <animated.div
              style={scrubberAnimation}
              className="absolute w-4 h-4 bg-blue-500 rounded-full -top-1 -ml-2"
            />
          </div>
        </div>
        {/* Placeholder for Voice Selector */}
        <div className="bg-gray-200 h-8 flex items-center justify-center text-sm text-gray-600">
          Voice Selector (To be implemented)
        </div>
        {/* Placeholder for Speed Selector */}
        <div className="bg-gray-200 h-8 flex items-center justify-center text-sm text-gray-600">
          Speed Selector (To be implemented)
        </div>
        {/* Placeholder for Recording Selector */}
        <div className="col-span-2 bg-gray-200 h-8 flex items-center justify-center text-sm text-gray-600">
          Recording Selector (To be implemented)
        </div>
      </div>
    </animated.div>
  );
}