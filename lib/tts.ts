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

// Singleton instance
export const ttsManager = new TTSManager();