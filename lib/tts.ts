// Utility for managing Web Speech API
export class TTSManager {
  private utterance: SpeechSynthesisUtterance | null = null;
  private synthesis: SpeechSynthesis;

  constructor() {
    this.synthesis = window.speechSynthesis;
  }

  // Start TTS with given text and language
  start(text: string, language: string): void {
    this.stop(); // Stop any ongoing speech
    this.utterance = new SpeechSynthesisUtterance(text);
    this.utterance.lang = language; // Set language (e.g., 'en-US', 'es-ES')
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