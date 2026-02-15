/** Synthesize an iMessage-style notification sound using Web Audio API */
export function playMessageSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    // Two-tone "ding" — classic iMessage feel
    const notes = [1046.5, 1318.5]; // C6, E6
    const durations = [0.08, 0.12];

    let offset = 0;
    for (let i = 0; i < notes.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = notes[i];

      gain.gain.setValueAtTime(0.15, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + offset + durations[i]
      );

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + durations[i]);

      offset += durations[i] * 0.7; // slight overlap for smoothness
    }

    // Clean up context after sound finishes
    setTimeout(() => ctx.close(), 500);
  } catch {
    // Audio not supported or blocked — fail silently
  }
}
