import { create } from 'zustand';
import { produce } from 'immer';

// Define the shape of our state
interface AppState {
  noteContent: string; // Store the note content as a string
  setNoteContent: (content: string) => void; // Function to update content
}

// Create the Zustand store with Immer
export const useAppStore = create<AppState>((set) => ({
  noteContent: '',
  setNoteContent: (content) =>
    set(
      produce((state) => {
        state.noteContent = content; // Immutable update with Immer
      })
    ),
}));