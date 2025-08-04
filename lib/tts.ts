
// Utility for managing Web Speech API
export class TTSManager {
  private utterance: SpeechSynthesisUtterance | null = null;
  private synthesis: SpeechSynthesis;
  private onWordBoundary: (charIndex: number) => void = () => {};
  private onProgress: (progress: number) => void = () => {};
  private currentText: string = '';

  constructor() {
    this.synthesis = window.speechSynthesis;
  }

  // Set callback for word boundary events
  setWordBoundaryCallback(callback: (charIndex: number) => void): void {
    this.onWordBoundary = callback;
  }

  // Set callback for playback progress
  setProgressCallback(callback: (progress: number) => void): void {
    this.onProgress = callback;
  }

  // Start TTS with given text and language
  start(text: string, language: string, selectedText?: string, offset?: number): void {
    this.stop(); // Stop any ongoing speech
    this.currentText = selectedText || text;
    this.utterance = new SpeechSynthesisUtterance(this.currentText);
    this.utterance.lang = language; // Set language (e.g., 'en-US', 'es-ES')
    this.utterance.onboundary = (event) => {
      if (event.name === 'word' && event.charIndex !== undefined) {
        this.onWordBoundary(event.charIndex + (offset || 0));
        const progress = event.charIndex / this.currentText.length;
        this.onProgress(progress);
      }
    };
    this.utterance.onend = () => {
      this.onProgress(0); // Reset progress when playback ends
    };
    this.synthesis.speak(this.utterance);
  }

  // Seek to a specific position in the text
  seekTo(charIndex: number, language: string): void {
    if (this.currentText) {
      const remainingText = this.currentText.slice(charIndex);
      this.stop();
      this.utterance = new SpeechSynthesisUtterance(remainingText);
      this.utterance.lang = language;
      this.utterance.onboundary = (event) => {
        if (event.name === 'word' && event.charIndex !== undefined) {
          this.onWordBoundary(event.charIndex + charIndex); // Adjust for sliced text
          const progress = (event.charIndex + charIndex) / this.currentText.length;
          this.onProgress(progress);
        }
      };
      this.utterance.onend = () => {
        this.onProgress(0);
      };
      this.synthesis.speak(this.utterance);
    }
  }

  // Stop TTS
  stop(): void {
    if (this.utterance) {
      this.synthesis.cancel();
      this.utterance = null;
      this.onProgress(0);
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
