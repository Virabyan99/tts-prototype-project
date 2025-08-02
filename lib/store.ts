import { create } from 'zustand';
import { produce } from 'immer';

// Define the shape of our state
interface AppState {
  noteContent: string; // Store the note content
  detectedLanguage: string; // Store the ISO 639-3 language code
  isPlaying: boolean; // Store TTS playback state
  setNoteContent: (content: string) => void;
  setDetectedLanguage: (language: string) => void;
  togglePlaying: () => void; // Toggle TTS playback state
}

// Create the Zustand store with Immer
export const useAppStore = create<AppState>((set, get) => ({
  noteContent: '',
  detectedLanguage: 'eng',
  isPlaying: false,
  setNoteContent: (content) =>
    set(
      produce((state) => {
        state.noteContent = content;
      })
    ),
  setDetectedLanguage: (language) =>
    set(
      produce((state) => {
        state.detectedLanguage = language;
      })
    ),
  togglePlaying: () =>
    set(
      produce((state) => {
        state.isPlaying = !state.isPlaying;
      })
    ),
}));