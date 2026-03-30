class AmbientService {
  private audio: HTMLAudioElement | null = null;
  private enabled = false;

  get isEnabled(): boolean {
    return this.enabled;
  }

  ensureAudio(): HTMLAudioElement {
    if (!this.audio) {
      const a = new Audio("/ambient.mp3");
      a.loop = true;
      a.preload = "auto";
      this.audio = a;
    }
    return this.audio;
  }

  async setEnabled(on: boolean): Promise<void> {
    this.enabled = on;
    const audio = this.ensureAudio();

    if (!on) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }

    try {
      await audio.play();
    } catch {
      // neutral failure mode
    }
  }

  stop(): void {
    this.enabled = false;
    if (!this.audio) return;
    this.audio.pause();
    this.audio.currentTime = 0;
  }
}

export const ambientService = new AmbientService();
