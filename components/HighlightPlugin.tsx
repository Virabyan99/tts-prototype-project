'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createRangeSelection, TextNode, $setSelection, ElementNode } from 'lexical';
import { useEffect, useRef } from 'react';
import { getTTSManager } from '@/lib/tts';

type RangeDetails = {
  anchorKey: string;
  anchorOffset: number;
  focusKey: string;
  focusOffset: number;
};

export default function HighlightPlugin() {
  const [editor] = useLexicalComposerContext();
  const previousRangeRef = useRef<RangeDetails | null>(null);

  useEffect(() => {
    // Callback to highlight the word at the given character index
    const highlightWord = (charIndex: number) => {
      editor.update(() => {
        // Clear previous highlight if exists
        if (previousRangeRef.current) {
          const prevSelection = $createRangeSelection();
          prevSelection.anchor.set(
            previousRangeRef.current.anchorKey,
            previousRangeRef.current.anchorOffset,
            'text'
          );
          prevSelection.focus.set(
            previousRangeRef.current.focusKey,
            previousRangeRef.current.focusOffset,
            'text'
          );
          const nodes = prevSelection.getNodes();
          nodes.forEach((node) => {
            if (node instanceof TextNode) {
              node.setFormat(0); // Clear all formats, including highlight
            }
          });
        }

        const textContent = $getRoot().getTextContent();
        const words = textContent.split(/\s+/);
        let currentIndex = 0;

        // Find the word at the character index
        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          const wordStart = currentIndex;
          const wordEnd = currentIndex + word.length;

          if (charIndex >= wordStart && charIndex < wordEnd + 1) {
            let cumulative = 0;
            let found = false;

            // Iterate through all nodes to find the correct position
            $getRoot().getChildren().forEach((paragraph) => {
              if (found || !(paragraph instanceof ElementNode)) return;
              paragraph.getChildren().forEach((node) => {
                if (found) return;
                if (node instanceof TextNode) {
                  const text = node.getTextContent();
                  const nodeStart = cumulative;
                  const nodeEnd = cumulative + text.length;

                  // Check if the word is within this node
                  if (wordStart >= nodeStart && wordEnd <= nodeEnd) {
                    const relativeStart = wordStart - nodeStart;
                    const relativeEnd = wordEnd - nodeStart;

                    // Create a range selection for the word
                    const selection = $createRangeSelection();
                    selection.anchor.set(node.getKey(), relativeStart, 'text');
                    selection.focus.set(node.getKey(), relativeEnd, 'text');

                    // Apply highlight format to the selected word
                    const nodes = selection.getNodes();
                    nodes.forEach((node) => {
                      if (node instanceof TextNode) {
                        // Split only if necessary to isolate the word
                        if (relativeStart > 0 || relativeEnd < node.getTextContentSize()) {
                          const splits = node.splitText(relativeStart, relativeEnd);
                          const middle = splits[relativeStart > 0 ? 1 : 0];
                          if (middle instanceof TextNode) {
                            middle.setFormat('highlight');
                            // Update range to reference the new middle node
                            previousRangeRef.current = {
                              anchorKey: middle.getKey(),
                              anchorOffset: 0,
                              focusKey: middle.getKey(),
                              focusOffset: middle.getTextContentSize(),
                            };
                          }
                        } else {
                          node.setFormat('highlight');
                          previousRangeRef.current = {
                            anchorKey: node.getKey(),
                            anchorOffset: relativeStart,
                            focusKey: node.getKey(),
                            focusOffset: relativeEnd,
                          };
                        }
                      }
                    });

                    found = true;
                  }
                  cumulative += text.length;
                }
              });
              if (!found) {
                cumulative += 1; // Account for \n between paragraphs
              }
            });

            return;
          }
          currentIndex += word.length + 1; // Account for spaces
        }
      });
    };

    // Register the callback with TTSManager
    getTTSManager().setWordBoundaryCallback(highlightWord);

    // Clear highlighting when TTS stops
    const handleTTSStop = () => {
      if (!getTTSManager().isSpeaking()) {
        editor.update(() => {
          if (previousRangeRef.current) {
            const prevSelection = $createRangeSelection();
            prevSelection.anchor.set(
              previousRangeRef.current.anchorKey,
              previousRangeRef.current.anchorOffset,
              'text'
            );
            prevSelection.focus.set(
              previousRangeRef.current.focusKey,
              previousRangeRef.current.focusOffset,
              'text'
            );
            const nodes = prevSelection.getNodes();
            nodes.forEach((node) => {
              if (node instanceof TextNode) {
                node.setFormat(0); // Clear all formats
              }
            });
            previousRangeRef.current = null;
          }
          $setSelection(null); // Clear selection
        });
      }
    };

    // Check TTS state periodically
    const interval = setInterval(handleTTSStop, 1000);

    // Clean up
    return () => {
      clearInterval(interval);
      getTTSManager().setWordBoundaryCallback(() => {}); // Reset callback
    };
  }, [editor]);

  return null;
}
