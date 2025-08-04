// lib/tts.ts
// Utility for managing Web Speech API
export class TTSManager {
  private utterance: SpeechSynthesisUtterance | null = null;
  private synthesis: SpeechSynthesis;
  private onWordBoundary: (charIndex: number) => void = () => {};
  private onProgress: (progress: number) => void = () => {};
  private onSpeakingChange: (isSpeaking: boolean) => void = () => {};
  private onEndCallback: () => void = () => {};
  private currentText: string = '';
  private baseOffset: number = 0;
  private currentStart: number = 0;
  private currentLength: number = 0;

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

  // Set callback for speaking state changes
  setSpeakingChangeCallback(callback: (isSpeaking: boolean) => void): void {
    this.onSpeakingChange = callback;
  }

  // Set callback for when TTS ends
  setEndCallback(callback: () => void): void {
    this.onEndCallback = callback;
  }

  // Get available voices
  getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  // Start TTS with given text and language
  start(language: string, textToSpeak: string, offset?: number, voiceURI: string | null = null, speed: number = 1): void {
    this.stop(); // Stop any ongoing speech
    this.currentText = textToSpeak;
    this.baseOffset = offset || 0;
    this.currentStart = 0;
    this.currentLength = this.currentText.length;
    this.utterance = new SpeechSynthesisUtterance(this.currentText);
    this.utterance.lang = language; // Set language (e.g., 'en-US', 'es-ES')
    if (voiceURI) {
      const voice = this.getVoices().find((v) => v.voiceURI === voiceURI);
      if (voice) {
        this.utterance.voice = voice;
      }
    }
    this.utterance.rate = speed;
    this.utterance.onstart = () => this.onSpeakingChange(true);
    this.utterance.onboundary = (event) => {
      if (event.name === 'word' && event.charIndex !== undefined) {
        this.onWordBoundary(event.charIndex + this.currentStart + this.baseOffset);
        const progress = (event.charIndex + this.currentStart) / this.currentLength;
        this.onProgress(progress);
      }
    };
    this.utterance.onend = () => {
      this.onSpeakingChange(false);
      this.onEndCallback();
      this.onProgress(0); // Reset progress when playback ends
    };
    this.synthesis.speak(this.utterance);
  }

  // Seek to a specific position in the text
  seekTo(charIndex: number, language: string, voiceURI: string | null = null, speed: number = 1): void {
    if (this.currentText) {
      const remainingText = this.currentText.slice(charIndex);
      this.stop();
      this.currentStart = charIndex;
      this.utterance = new SpeechSynthesisUtterance(remainingText);
      this.utterance.lang = language;
      if (voiceURI) {
        const voice = this.getVoices().find((v) => v.voiceURI === voiceURI);
        if (voice) {
          this.utterance.voice = voice;
        }
      }
      this.utterance.rate = speed;
      this.utterance.onstart = () => this.onSpeakingChange(true);
      this.utterance.onboundary = (event) => {
        if (event.name === 'word' && event.charIndex !== undefined) {
          this.onWordBoundary(event.charIndex + this.currentStart + this.baseOffset);
          const progress = (event.charIndex + this.currentStart) / this.currentLength;
          this.onProgress(progress);
        }
      };
      this.utterance.onend = () => {
        this.onSpeakingChange(false);
        this.onEndCallback();
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