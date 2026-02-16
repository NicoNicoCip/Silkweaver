/**
 * Core Web Audio API context and graph management.
 *
 * All audio passes through:
 *   source → group gain → master gain → AudioContext.destination
 *
 * Call audio_system.init() once before playing any sounds.
 * The context starts suspended on many browsers until a user gesture;
 * audio_system.resume() should be called in any user-input handler.
 */

/**
 * Central audio context and master gain node.
 */
export class audio_system {
    private static _ctx:    AudioContext | null = null   // Shared Web Audio context
    private static _master: GainNode | null = null       // Master gain node (0–1)

    /**
     * Initialises the Web Audio context and master gain node.
     * Safe to call multiple times — only initialises once.
     */
    public static init(): void {
        if (this._ctx) return
        this._ctx    = new AudioContext()
        this._master = this._ctx.createGain()
        this._master.connect(this._ctx.destination)
        this._master.gain.value = 1
    }

    /**
     * Resumes the AudioContext after a user gesture.
     * Browsers suspend audio until user interaction occurs.
     */
    public static resume(): Promise<void> {
        if (!this._ctx) return Promise.resolve()
        return this._ctx.resume()
    }

    /**
     * Returns the shared AudioContext.
     * Throws if init() has not been called.
     */
    public static get ctx(): AudioContext {
        if (!this._ctx) throw new Error('audio_system: call init() first')
        return this._ctx
    }

    /**
     * Returns the master GainNode.
     * Throws if init() has not been called.
     */
    public static get master(): GainNode {
        if (!this._master) throw new Error('audio_system: call init() first')
        return this._master
    }

    /** Returns true if the audio system has been initialised. */
    public static get is_ready(): boolean {
        return this._ctx !== null
    }

    /**
     * Sets the master gain (volume) for all audio.
     * @param gain - Volume level (0 = silent, 1 = full)
     */
    public static set_master_gain(gain: number): void {
        if (!this._master) return
        this._master.gain.value = Math.max(0, gain)
    }

    /** Returns the current master gain level. */
    public static get_master_gain(): number {
        return this._master?.gain.value ?? 1
    }

    /**
     * Returns the current AudioContext time in seconds.
     * Used for precise scheduling.
     */
    public static get current_time(): number {
        return this._ctx?.currentTime ?? 0
    }
}
