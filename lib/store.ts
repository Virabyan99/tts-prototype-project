import { create } from 'zustand';
import { produce } from 'immer';

// Define the shape of our state
interface AppState {
  noteContent: string; // Store the note content
  detectedLanguage: string; // Store the ISO 639-3 language code (e.g., 'eng' for English)
  setNoteContent: (content: string) => void;
  setDetectedLanguage: (language: string) => void;
}

// Create the Zustand store with Immer
export const useAppStore = create<AppState>((set) => ({
  noteContent: '',
  detectedLanguage: 'eng', // Default to English
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
}));