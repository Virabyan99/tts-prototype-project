import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define the database schema
interface NoteDB extends DBSchema {
  notes: {
    key: string;
    value: { content: string; timestamp: number };
  };
}

// Initialize the database
async function initDB(): Promise<IDBPDatabase<NoteDB>> {
  return openDB<NoteDB>('tts-notes', 1, {
    upgrade(db) {
      db.createObjectStore('notes', { keyPath: 'key' });
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