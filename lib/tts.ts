// src/lib/tts.ts
// Utility for managing Web Speech API
export class TTSManager {
  private utterance: SpeechSynthesisUtterance | null = null;
  private synthesis: SpeechSynthesis;
  private onWordBoundary: (charIndex: number) => void;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.onWordBoundary = () => {}; // Default empty callback
  }

  // Set callback for word boundary events
  setWordBoundaryCallback(callback: (charIndex: number) => void): void {
    this.onWordBoundary = callback;
  }

  // Start TTS with given text and language
  start(text: string, language: string, selectedText?: string, offset?: number): void {
    this.stop(); // Stop any ongoing speech
    this.utterance = new SpeechSynthesisUtterance(selectedText || text);
    this.utterance.lang = language; // Set language (e.g., 'en-US', 'es-ES')
    this.utterance.onboundary = (event) => {
      if (event.name === 'word' && event.charIndex !== undefined) {
        this.onWordBoundary(event.charIndex + (offset || 0));
      }
    };
    this.synthesis.speak(this.utterance);
  }

  // Stop TTS
  stop(): void {
    if (this.utterance) {
      this.synthesis.cancel();
      this.utterance = null;
    }
  }

  // Check if TTS is active
  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }
}

// Lazy-initialized singleton instance (only created on client)
let _ttsManager: TTSManager | null = null;

export function getTTSManager(): TTSManager {
  if (typeof window === 'undefined') {
    throw new Error('TTSManager is browser-only and cannot be used on the server');
  }
  if (!_ttsManager) {
    _ttsManager = new TTSManager();
  }
  return _ttsManager;
}