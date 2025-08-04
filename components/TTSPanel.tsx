'use client';

import { useSpring, animated } from '@react-spring/web';
import { useAppStore } from '@/lib/store';

export default function TTSPanel() {
  const isPlaying = useAppStore((state) => state.isPlaying);

  // Define animation for panel appearance/disappearance
  const panelAnimation = useSpring({
    opacity: isPlaying ? 1 : 0,
    height: isPlaying ? 200 : 0, // Use numerical values for animation
    transform: isPlaying ? 'translateY(0)' : 'translateY(-10px)',
    config: { tension: 200, friction: 20 }, // Smooth spring animation
  });

  return (
    <animated.div
      style={panelAnimation}
      className="w-full  bg-gray-50 p-3 rounded-b shadow-md overflow-hidden"
    >
      <div className="grid grid-cols-2 gap-2">
        {/* Placeholder for Waveform Visualization */}
        <div className="col-span-2 bg-gray-200 h-12 flex items-center justify-center text-sm text-gray-600">
          Waveform Visualization (To be implemented)
        </div>
        {/* Placeholder for Scrubber */}
        <div className="col-span-2 bg-gray-200 h-6 flex items-center justify-center text-sm text-gray-600">
          Scrubber (To be implemented)
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
