/**
 * Generates a futuristic mission-complete sound using the Web Audio API.
 * This avoids needing external assets and fits the "Space Drive" aesthetic.
 */
export function playSuccessSound() {
  if (typeof window === 'undefined') return;

  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Create a futuristic "bloop-ping" sound
  const playTone = (freq: number, start: number, duration: number, type: OscillatorType = 'sine') => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, start + duration);
    
    gain.gain.setValueAtTime(0.1, start);
    gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(start);
    osc.stop(start + duration);
  };

  const now = audioCtx.currentTime;
  // Two-tone sequence
  playTone(440, now, 0.1, 'square');
  playTone(880, now + 0.05, 0.2, 'sine');
}
