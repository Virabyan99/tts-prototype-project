'use client';

import TTSButton from './TTSButton';
import TTSPanel from './TTSPanel';

export default function Toolbar() {
  return (
    <div className="flex flex-col items-start gap-2 p-2 bg-gray-100 border-b rounded-t">
      <div className="flex items-center gap-2">
        <TTSButton />
      </div>
      <TTSPanel />
    </div>
  );
}