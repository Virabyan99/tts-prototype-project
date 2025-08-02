'use client';

import TTSButton from './TTSButton';

export default function Toolbar() {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-100 border-b rounded-t">
      <TTSButton />
    </div>
  );
}