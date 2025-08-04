'use client';

import { useAppStore } from '@/lib/store';
import { IconPlayerPlay, IconPlayerStop } from '@tabler/icons-react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback } from 'react';
import { $getRoot } from 'lexical';

export default function TTSButton() {
  const [editor] = useLexicalComposerContext();
  const isPlaying = useAppStore((state) => state.isPlaying);
  const togglePlaying = useAppStore((state) => state.togglePlaying);

  const handleClick = useCallback(() => {
    let selectedText: string | undefined;
    let offset = 0;
    editor.getEditorState().read(() => {
      const fullText = $getRoot().getTextContent();
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const selText = sel.toString().trim();
        if (selText) {
          selectedText = selText;
          offset = fullText.indexOf(selectedText);
          if (offset === -1) {
            selectedText = undefined;
            offset = 0;
          }
        }
      }
    });
    togglePlaying(selectedText, offset);
  }, [editor, togglePlaying]);

  return (
    <button
      onClick={handleClick}
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