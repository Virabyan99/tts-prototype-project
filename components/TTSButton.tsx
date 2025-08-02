'use client';

import { useAppStore } from '@/lib/store';
import { IconPlayerPlay, IconPlayerStop } from '@tabler/icons-react';

export default function TTSButton() {
  const isPlaying = useAppStore((state) => state.isPlaying);
  const togglePlaying = useAppStore((state) => state.togglePlaying);

  return (
    <button
      onClick={togglePlaying}
      className="flex items-center justify-center p-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
      aria-label={isPlaying ? 'Stop TTS' : 'Play TTS'}
    >
      {isPlaying ? (
        <IconPlayerStop size={24} />
      ) : (
        <IconPlayerPlay size={24} />
      )}
    </button>
  );
}