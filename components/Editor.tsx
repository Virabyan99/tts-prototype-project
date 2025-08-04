// src/components/Editor.tsx
'use client';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { saveNote, loadNote } from '@/lib/db';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { CodeNode } from '@lexical/code';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import {franc} from 'franc';
import Toolbar from './Toolbar';
import { getTTSManager } from '@/lib/tts';
import HighlightPlugin from './HighlightPlugin';

const initialConfig = {
  namespace: 'NoteEditor',
  onError: (error: Error) => console.error(error),
  theme: {
    paragraph: 'editor-paragraph',
    text: {
      bold: 'editor-bold',
      italic: 'editor-italic',
      underline: 'editor-underline',
    },
  },
  nodes: [
    HeadingNode,
    QuoteNode,
    CodeNode,
    ListNode,
    ListItemNode,
    LinkNode,
  ],
};

// Plugin to sync Lexical state with Zustand and IndexedDB
function SyncPlugin() {
  const [editor] = useLexicalComposerContext();
  const setNoteContent = useAppStore((state) => state.setNoteContent);
  const setDetectedLanguage = useAppStore((state) => state.setDetectedLanguage);
  const setPlaying = useAppStore((state) => state.setPlaying);

  // Function to detect language using Franc
  const detectLanguage = useCallback(
    (text: string) => {
      if (text.length < 10) return 'eng';
      const result = franc(text, { minLength: 10, only: ['eng', 'spa', 'fra'] });
      return result !== 'und' ? result : 'eng';
    },
    []
  );

  useEffect(() => {
    // Load note on mount
    loadNote().then((content) => {
      if (content) {
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(content));
          root.append(paragraph);
        });
        setNoteContent(content);
        setDetectedLanguage(detectLanguage(content));
      }
    });

    // Sync content and detect language on update
    const unsubscribe = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const content = $getRoot().getTextContent();
        setNoteContent(content);
        setDetectedLanguage(detectLanguage(content));
        saveNote(content);
      });
    });

    // Sync TTS state
    const handleTTSState = () => {
      setPlaying(getTTSManager().isSpeaking());
    };

    // Check TTS state periodically
    const interval = setInterval(handleTTSState, 1000);

    // Clean up
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [editor, setNoteContent, setDetectedLanguage, detectLanguage, setPlaying]);

  return null;
}

export default function Editor() {
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container border rounded p-4 bg-white w-full max-w-2xl">
        <Toolbar />
        <RichTextPlugin
          contentEditable={<ContentEditable className="min-h-[200px] outline-none" />}
          placeholder={<div className="text-gray-400">Start typing your note...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <SyncPlugin />
        <HighlightPlugin />
      </div>
    </LexicalComposer>
  );
}