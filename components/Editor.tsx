'use client';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { saveNote, loadNote } from '@/lib/db';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

// Import required nodes for markdown transformers
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { CodeNode } from '@lexical/code';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';

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
      }
    });

    // Save note on content change
    const unsubscribe = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const content = $getRoot().getTextContent();
        setNoteContent(content);
        saveNote(content);
      });
    });

    return () => unsubscribe();
  }, [editor, setNoteContent]);

  return null;
}

export default function Editor() {
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container border rounded p-4 bg-white">
        <RichTextPlugin
          contentEditable={<ContentEditable className="min-h-[200px] outline-none" />}
          placeholder={<div className="text-gray-400">Start typing your note...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <SyncPlugin />
      </div>
    </LexicalComposer>
  );
}