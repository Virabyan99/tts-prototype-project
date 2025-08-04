// components/TTSPanel.tsx
'use client';
import { useSpring, animated } from '@react-spring/web';
import { useAppStore } from '@/lib/store';
import { useEffect, useRef, useState } from 'react';
import { getTTSManager } from '@/lib/tts';
import { IconMicrophone, IconMicrophoneOff, IconDownload, IconTrash } from '@tabler/icons-react';

export default function TTSPanel() {
  const isPlaying = useAppStore((state) => state.isPlaying);
  const progress = useAppStore((state) => state.progress);
  const currentText = useAppStore((state) => state.currentText);
  const textLength = currentText.length;
  const detectedLanguage = useAppStore((state) => state.detectedLanguage);
  const voiceURI = useAppStore((state) => state.voiceURI);
  const speed = useAppStore((state) => state.speed);
  const isRecording = useAppStore((state) => state.isRecording);
  const setVoiceURI = useAppStore((state) => state.setVoiceURI);
  const setSpeed = useAppStore((state) => state.setSpeed);
  const setRecording = useAppStore((state) => state.setRecording);
  const seekTo = useAppStore((state) => state.seekTo);

  // Map ISO 639-3 to Web Speech API language codes
  const languageMap: Record<string, string> = {
    eng: 'en-US',
    spa: 'es-ES',
    fra: 'fr-FR',
  };

  // State for available voices
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // State for recording
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isRecorderSupported, setIsRecorderSupported] = useState(true);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = getTTSManager().getVoices();
      setVoices(availableVoices);
    };
    loadVoices();
    // Handle voice list changes (e.g., browser updates)
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Check MediaRecorder support
  useEffect(() => {
    if (!navigator.mediaDevices || !MediaRecorder || !MediaRecorder.isTypeSupported('audio/webm')) {
      setIsRecorderSupported(false);
      setRecording(false);
    }
  }, [setRecording]);

  // Handle recording
  useEffect(() => {
    let recorder: MediaRecorder | null = null;
    if (isRecording && isPlaying && isRecorderSupported) {
      (async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
            },
          });
          recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
          const chunks: Blob[] = [];
          recorder.ondataavailable = (e) => chunks.push(e.data);
          recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            setRecordedBlob(blob);
            stream.getTracks().forEach((track) => track.stop());
          };
          recorder.start();
          setMediaRecorder(recorder);
        } catch (err) {
          console.error('Error accessing microphone for recording:', err);
          setRecording(false);
        }
      })();
    } else if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
    return () => {
      if (recorder) {
        recorder.stop();
      }
    };
  }, [isRecording, isPlaying, isRecorderSupported, setRecording]);

  // Clean up recording when TTS stops
  useEffect(() => {
    if (!isPlaying && mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
  }, [isPlaying, mediaRecorder]);

  // Define animation for panel appearance/disappearance
  const panelAnimation = useSpring({
    opacity: isPlaying ? 1 : 0,
    height: isPlaying ? 200 : 0, // Use numerical values for animation
    transform: isPlaying ? 'translateY(0)' : 'translateY(-10px)',
    config: { tension: 200, friction: 20 }, // Smooth spring animation
  });

  // Ref for the scrubber track
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Update progress from TTSManager
  useEffect(() => {
    getTTSManager().setProgressCallback((newProgress) => {
      if (!isDragging) {
        useAppStore.getState().setProgress(newProgress);
      }
    });
    return () => {
      getTTSManager().setProgressCallback(() => {});
    };
  }, [isDragging]);

  // Handle scrubber drag
  const handleMouseDown = () => {
    setIsDragging(true);
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      const newProgress = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      useAppStore.getState().setProgress(newProgress);
    }
  };
  const handleMouseUp = () => {
    setIsDragging(false);
    seekTo(progress);
  };
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, progress]);

  // Animation for scrubber movement
  const scrubberAnimation = useSpring({
    left: `${progress * 100}%`,
    config: { tension: 200, friction: 20 },
  });

  // Refs for tracking progress changes
  const lastProgressRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const recentCharRates = useRef<number[]>([]);

  // States for waveform animation
  const [phase, setPhase] = useState(0);
  const [waveSpeed, setWaveSpeed] = useState(0.1);
  const [amp, setAmp] = useState(20);

  // Update speed and amp based on progress changes (approximating speech rhythm)
  useEffect(() => {
    if (!isPlaying) {
      lastProgressRef.current = 0;
      lastTimeRef.current = 0;
      recentCharRates.current = [];
      setWaveSpeed(0.1);
      setAmp(20);
      return;
    }

    const now = Date.now();

    if (lastTimeRef.current === 0) {
      lastTimeRef.current = now;
      lastProgressRef.current = 0;
      const defaultRate = 15 * speed; // Approximate chars/sec based on speed
      recentCharRates.current = [defaultRate];
      setWaveSpeed(defaultRate / 50); // Tune divisor for wave speed
      setAmp(20);
      return;
    }

    const dt = now - lastTimeRef.current;
    const dprogress = progress - lastProgressRef.current;

    if (dt > 0 && dprogress > 0) {
      const dchar = dprogress * textLength;
      const charRate = dchar / (dt / 1000);
      recentCharRates.current.push(charRate);
      if (recentCharRates.current.length > 5) {
        recentCharRates.current.shift();
      }
      const avgCharRate = recentCharRates.current.reduce((a, b) => a + b, 0) / recentCharRates.current.length;
      setWaveSpeed(avgCharRate / 50); // Tune for desired wave movement speed
      setAmp(dchar * 1.5 + 10); // Tune for amplitude variation per word
    }

    lastProgressRef.current = progress;
    lastTimeRef.current = now;
  }, [progress, isPlaying, textLength, speed]);

  // Animate phase when playing
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPhase((p) => p + waveSpeed);
      }, 50); // Update every 50ms
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, waveSpeed]);

  // Compute waveform heights based on sine wave for wave-like effect
  const waveformHeights = Array.from({ length: 50 }, (_, i) =>
    amp * (Math.sin(i * 0.2 + phase) * 0.5 + 0.5) + 10
  );

  // Filter voices by detected language
  const filteredVoices = voices.filter((voice) =>
    voice.lang.startsWith(languageMap[detectedLanguage]?.split('-')[0] || 'en')
  );

  // Handle download
  const handleDownload = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tts_recording.webm';
      a.click();
      URL.revokeObjectURL(url);
      setRecordedBlob(null);
    }
  };

  // Handle discard
  const handleDiscard = () => {
    setRecordedBlob(null);
  };

  return (
    <animated.div
      style={panelAnimation}
      className="w-full bg-gray-50 p-3 rounded-b shadow-md overflow-hidden"
    >
      <div className="grid grid-cols-2 gap-2">
        {/* Modern Waveform Visualization */}
        <div className="col-span-2 bg-gradient-to-r from-blue-100 to-blue-200 h-12 relative flex items-center justify-center rounded-lg shadow-inner">
          <div className="absolute inset-0 flex items-end px-2 space-x-0.5 overflow-hidden">
            {waveformHeights.map((height, i) => (
              <animated.div
                key={i}
                className="bg-blue-500 rounded-t w-full transition-all duration-150 ease-in-out"
                style={{
                  height: isPlaying ? `${height}px` : '0px', // Animate height to 0 when not playing
                  boxShadow: isPlaying ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none', // Add subtle shadow for depth
                  opacity: isPlaying ? 1 : 0.5, // Fade when not playing
                }}
              />
            ))}
            {/* Progress overlay with gradient */}
            <div
              className="absolute top-0 bottom-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-40 transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
        {/* Scrubber with improved styling */}
        <div className="col-span-2 relative">
          <div
            ref={trackRef}
            className="bg-gray-200 h-1 rounded-full cursor-pointer shadow-sm"
            onMouseDown={handleMouseDown}
          >
            <animated.div
              style={scrubberAnimation}
              className="absolute w-4 h-4 bg-blue-500 rounded-full -top-1.5 -ml-2 shadow-md ring-2 ring-blue-300 ring-opacity-50 transition-shadow duration-200 hover:shadow-lg"
            />
          </div>
        </div>
        {/* Voice Selector */}
        <div className="bg-white h-8 flex items-center justify-center text-sm text-gray-600 rounded-md border">
          <select
            value={voiceURI || ''}
            onChange={(e) => setVoiceURI(e.target.value || null)}
            className="w-full h-full p-1 border-0 rounded text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Select TTS Voice"
          >
            <option value="">Default Voice</option>
            {filteredVoices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>
        {/* Speed Selector */}
        <div className="bg-white h-8 flex items-center justify-center text-sm text-gray-600 rounded-md border">
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full h-full p-1 border-0 rounded text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Select TTS Speed"
          >
            {[0.8, 0.9, 1, 1.1, 1.2].map((speedOption) => (
              <option key={speedOption} value={speedOption}>
                {speedOption}x
              </option>
            ))}
          </select>
        </div>
        {/* Recording Controls */}
        <div className="col-span-2 flex items-center gap-2 bg-gray-200 h-8 rounded-md px-2">
          {isRecorderSupported ? (
            <>
              <button
                onClick={() => setRecording(!isRecording)}
                className={`flex items-center justify-center p-1 rounded ${isRecording ? 'bg-red-500 text-white' : 'bg-white text-gray-600'} hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-red-400`}
                aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
              >
                {isRecording ? <IconMicrophoneOff size={20} /> : <IconMicrophone size={20} />}
              </button>
              {recordedBlob && (
                <>
                  <button
                    onClick={handleDownload}
                    className="flex items-center justify-center p-1 bg-green-500 text-white rounded hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-green-400"
                    aria-label="Download Recording"
                  >
                    <IconDownload size={20} />
                  </button>
                  <button
                    onClick={handleDiscard}
                    className="flex items-center justify-center p-1 bg-gray-500 text-white rounded hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    aria-label="Discard Recording"
                  >
                    <IconTrash size={20} />
                  </button>
                </>
              )}
            </>
          ) : (
            <span className="text-sm text-gray-600">Recording not supported</span>
          )}
        </div>
      </div>
    </animated.div>
  );
}