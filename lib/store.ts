import { create } from 'zustand';
import { produce } from 'immer';
import { getTTSManager } from './tts';
import {franc} from 'franc';
import { loadPreferences } from './db';

// Define the shape of our state
interface AppState {
  noteContent: string; // Store the note content
  detectedLanguage: string; // Store the ISO 639-3 language code
  isPlaying: boolean; // Store TTS playback state
  progress: number; // TTS playback progress (0 to 1)
  currentText: string; // The text being spoken
  voiceURI: string | null;
  speed: number;
  setNoteContent: (content: string) => void;
  setDetectedLanguage: (language: string) => void;
  togglePlaying: (selectedText?: string, offset?: number) => void; // Toggle TTS playback
  setPlaying: (isPlaying: boolean) => void; // Set playback state explicitly
  setProgress: (progress: number) => void;
  seekTo: (progress: number) => void; // Seek to a specific progress point
  setVoiceURI: (voiceURI: string | null) => void;
  setSpeed: (speed: number) => void;
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
  progress: 0,
  currentText: '',
  voiceURI: null,
  speed: 1,
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
  togglePlaying: (selectedText?: string, offset?: number) => {
    const { isPlaying, noteContent, detectedLanguage, voiceURI, speed } = get();
    if (isPlaying) {
      getTTSManager().stop();
      set(
        produce((state) => {
          state.isPlaying = false;
          state.progress = 0;
        })
      );
    } else if (noteContent || selectedText) {
      const textToSpeak = selectedText || noteContent;
      const lang = selectedText
        ? franc(selectedText, { minLength: 10, only: ['eng', 'spa', 'fra'] }) !== 'und'
          ? franc(selectedText, { minLength: 10, only: ['eng', 'spa', 'fra'] })
          : detectedLanguage
        : detectedLanguage;
      getTTSManager().start(languageMap[lang] || 'en-US', textToSpeak, offset, voiceURI, speed);
      set(
        produce((state) => {
          state.isPlaying = true;
          state.currentText = textToSpeak;
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
  setProgress: (progress) =>
    set(
      produce((state) => {
        state.progress = progress;
      })
    ),
  seekTo: (progress) => {
    const { currentText, detectedLanguage, isPlaying, voiceURI, speed } = get();
    if (currentText && isPlaying) {
      const charIndex = Math.floor(progress * currentText.length);
      getTTSManager().seekTo(charIndex, languageMap[detectedLanguage] || 'en-US', voiceURI, speed);
      set(
        produce((state) => {
          state.progress = progress;
        })
      );
    }
  },
  setVoiceURI: (voiceURI) =>
    set(
      produce((state) => {
        state.voiceURI = voiceURI;
      })
    ),
  setSpeed: (speed) =>
    set(
      produce((state) => {
        state.speed = speed;
      })
    ),
}));

// Load preferences on store initialization
loadPreferences().then((prefs) => {
  if (prefs) {
    useAppStore.setState(
      produce((state: AppState) => {
        state.voiceURI = prefs.voiceURI;
        state.speed = prefs.speed;
      })
    );
  }
});