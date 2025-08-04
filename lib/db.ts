import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define the database schema
interface NoteDB extends DBSchema {
  notes: {
    key: string;
    value: { content: string; timestamp: number };
  };
  preferences: {
    key: string;
    value: { voiceURI: string | null; speed: number };
  };
}

// Initialize the database
async function initDB(): Promise<IDBPDatabase<NoteDB>> {
  return openDB<NoteDB>('tts-notes', 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore('notes', { keyPath: 'key' });
      }
      if (oldVersion < 2) {
        db.createObjectStore('preferences', { keyPath: 'key' });
      }
    },
  });
}

// Save a note to IndexedDB
export async function saveNote(content: string): Promise<void> {
  const db = await initDB();
  await db.put('notes', { key: 'current-note', content, timestamp: Date.now() });
}

// Load a note from IndexedDB
export async function loadNote(): Promise<string | null> {
  const db = await initDB();
  const note = await db.get('notes', 'current-note');
  return note ? note.content : null;
}

// Save TTS preferences
export async function savePreferences(voiceURI: string | null, speed: number): Promise<void> {
  const db = await initDB();
  await db.put('preferences', { key: 'ttsPreferences', voiceURI, speed });
}

// Load TTS preferences
export async function loadPreferences(): Promise<{ voiceURI: string | null; speed: number } | null> {
  const db = await initDB();
  const prefs = await db.get('preferences', 'ttsPreferences');
  return prefs ? { voiceURI: prefs.voiceURI, speed: prefs.speed } : null;
}