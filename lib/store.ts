import { create } from 'zustand';
import { produce } from 'immer';
import { getTTSManager } from './tts'; // Updated import

// Define the shape of our state
interface AppState {
  noteContent: string; // Store the note content
  detectedLanguage: string; // Store the ISO 639-3 language code
  isPlaying: boolean; // Store TTS playback state
  setNoteContent: (content: string) => void;
  setDetectedLanguage: (language: string) => void;
  togglePlaying: () => void; // Toggle TTS playback
  setPlaying: (isPlaying: boolean) => void; // Set playback state explicitly
}

// Map ISO 639-3 codes to Web Speech API language codes
const languageMap: Record<string, string> = {
  eng: 'en-US',
  spa: 'es-ES',
  fra: 'fr-FR',
};

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
  togglePlaying: () => {
    const { isPlaying, noteContent, detectedLanguage } = get();
    if (isPlaying) {
      getTTSManager().stop(); // Updated
      set(
        produce((state) => {
          state.isPlaying = false;
        })
      );
    } else if (noteContent) {
      getTTSManager().start(noteContent, languageMap[detectedLanguage] || 'en-US'); // Updated
      set(
        produce((state) => {
          state.isPlaying = true;
        })
      );
    }
  },
  setPlaying: (isPlaying) =>
    set(
      produce((state) => {
        state.isPlaying = isPlaying;
      })
    ),
}));