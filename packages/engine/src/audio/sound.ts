/**
 * Sound resource and playback management.
 *
 * A `sound_asset` holds a decoded AudioBuffer (loaded from a URL or ArrayBuffer).
 * Playing a sound creates a `sound_instance` (AudioBufferSourceNode + GainNode).
 *
 * Sound instances are fire-and-forget by default. Retaining the returned
 * instance ID allows stopping, pausing, or changing volume mid-play.
 *
 * Routing: source → instance gain → group gain → master gain → destination
 */

import { audio_system } from './audio_system.js'
import { resource } from '../core/resource.js'
import { get_or_create_group, set_stop_group_callback } from './audio_group.js'

// Register the group-stop callback once the registry is available.
// This breaks the circular dependency: audio_group.ts never imports sound.ts.
set_stop_group_callback((group_name: string) => {
    for (const [id, name] of _instance_groups) {
        if (name === group_name) _instances.get(id)?.stop()
    }
})

// =========================================================================
// Sound asset resource
// =========================================================================

/**
 * A decoded audio asset that can be played one or more times.
 */
export class sound_asset extends resource {
    public buffer:     AudioBuffer | null = null  // Decoded PCM data
    public loop:       boolean = false             // Whether playback loops by default
    public group_name: string  = 'default'         // Audio group this asset belongs to

    /**
     * Loads a sound from a URL, decoding it into an AudioBuffer.
     * @param url - URL to an audio file (mp3, ogg, wav, etc.)
     * @param group_name - Audio group to assign this sound to
     * @param loop - Whether to loop by default
     * @returns Promise that resolves when decoding is complete
     */
    public async load_url(url: string, group_name: string = 'default', loop: boolean = false): Promise<void> {
        this.group_name = group_name
        this.loop       = loop
        const response  = await fetch(url)
        const array_buf = await response.arrayBuffer()
        this.buffer     = await audio_system.ctx.decodeAudioData(array_buf)
    }

    /**
     * Loads a sound from a pre-fetched ArrayBuffer.
     * @param array_buf - Raw audio data
     * @param group_name - Audio group
     * @param loop - Whether to loop by default
     */
    public async load_buffer(array_buf: ArrayBuffer, group_name: string = 'default', loop: boolean = false): Promise<void> {
        this.group_name = group_name
        this.loop       = loop
        this.buffer     = await audio_system.ctx.decodeAudioData(array_buf)
    }
}

// =========================================================================
// Sound instance (live playback handle)
// =========================================================================

let _next_instance_id = 1  // Monotonically increasing instance ID counter

/**
 * A live playback of a sound_asset.
 * Returned by audio_play_sound(); pass the ID to stop/query.
 */
export class sound_instance {
    public readonly instance_id: number                    // Unique handle for this playback
    private _source:    AudioBufferSourceNode              // Web Audio source node
    private _gain:      GainNode                           // Per-instance volume control
    private _playing:   boolean = true                     // Whether currently playing
    private _on_ended:  (() => void) | null = null         // Callback on natural end

    constructor(source: AudioBufferSourceNode, gain: GainNode) {
        this.instance_id = _next_instance_id++
        this._source     = source
        this._gain       = gain

        // Track natural end (loop sounds never fire ended)
        this._source.addEventListener('ended', () => {
            this._playing = false
            if (this._on_ended) this._on_ended()
        })
    }

    /** Stops playback immediately. */
    public stop(): void {
        if (!this._playing) return
        try { this._source.stop() } catch (_) { /* already stopped */ }
        this._playing = false
    }

    /**
     * Sets the gain for this specific playback instance.
     * @param gain - Volume level (0–1)
     */
    public set_gain(gain: number): void {
        this._gain.gain.value = Math.max(0, gain)
    }

    /** Returns the current instance gain. */
    public get_gain(): number {
        return this._gain.gain.value
    }

    /**
     * Sets the playback pitch as a speed multiplier.
     * 1.0 = normal, 2.0 = one octave up, 0.5 = one octave down.
     * @param pitch - Playback rate multiplier
     */
    public set_pitch(pitch: number): void {
        this._source.playbackRate.value = Math.max(0.01, pitch)
    }

    /** Returns true if this instance is still playing. */
    public get is_playing(): boolean { return this._playing }

    /**
     * Registers a callback invoked when the sound ends naturally (not on stop()).
     * @param cb - Callback function
     */
    public on_ended(cb: () => void): void {
        this._on_ended = cb
    }
}

// =========================================================================
// Sound instance registry
// =========================================================================

const _instances:       Map<number, sound_instance> = new Map()
const _instance_groups: Map<number, string>          = new Map()  // instance_id → group_name

function _register(inst: sound_instance, group_name: string = ''): void {
    _instances.set(inst.instance_id, inst)
    _instance_groups.set(inst.instance_id, group_name)
    inst.on_ended(() => {
        _instances.delete(inst.instance_id)
        _instance_groups.delete(inst.instance_id)
    })
}

/**
 * Registers a sound_instance in the global instance registry.
 * Used by external modules (e.g. audio_3d) that construct instances directly.
 * @param inst - The instance to register
 * @param group_name - The audio group this instance belongs to
 */
export function register_instance(inst: sound_instance, group_name: string = ''): void {
    _register(inst, group_name)
}


// =========================================================================
// Playback functions
// =========================================================================

/**
 * Plays a sound asset and returns a sound_instance for control.
 * @param asset - The sound asset to play
 * @param loop - Override loop setting (defaults to asset.loop)
 * @param gain - Initial volume (0–1, defaults to 1)
 * @param pitch - Playback rate multiplier (defaults to 1)
 * @returns The live sound_instance handle
 */
export function play_sound(
    asset: sound_asset,
    loop:  boolean = asset.loop,
    gain:  number  = 1,
    pitch: number  = 1,
): sound_instance {
    if (!asset.buffer) throw new Error(`sound_asset ${asset.id}: not yet loaded`)

    const ctx    = audio_system.ctx
    const group  = get_or_create_group(asset.group_name)

    const source = ctx.createBufferSource()
    source.buffer        = asset.buffer
    source.loop          = loop
    source.playbackRate.value = Math.max(0.01, pitch)

    const gain_node = ctx.createGain()
    gain_node.gain.value = Math.max(0, gain)

    source.connect(gain_node)
    gain_node.connect(group.gain_node)

    source.start()

    const inst = new sound_instance(source, gain_node)
    _register(inst, asset.group_name)
    return inst
}

// =========================================================================
// Public GMS-style API
// =========================================================================

/**
 * Plays a sound asset.
 * @param asset - Sound to play
 * @param loop - Whether to loop
 * @param priority - Ignored (GMS API parity only)
 * @returns sound_instance handle
 */
export function audio_play_sound(asset: sound_asset, loop: boolean = false, priority: number = 0): sound_instance {
    return play_sound(asset, loop)
}

/**
 * Stops a specific sound instance.
 * @param inst - The sound_instance returned by audio_play_sound
 */
export function audio_stop_sound(inst: sound_instance): void {
    inst.stop()
}

/**
 * Stops all currently playing sounds.
 */
export function audio_stop_all(): void {
    for (const inst of _instances.values()) inst.stop()
    _instances.clear()
    _instance_groups.clear()
}

/**
 * Returns true if the given sound instance is currently playing.
 * @param inst - The sound_instance to query
 */
export function audio_is_playing(inst: sound_instance): boolean {
    return inst.is_playing
}

/**
 * Sets the gain for a specific sound instance.
 * @param inst - The sound_instance
 * @param gain - Volume level (0–1)
 */
export function audio_sound_gain(inst: sound_instance, gain: number): void {
    inst.set_gain(gain)
}

/**
 * Sets the pitch for a specific sound instance.
 * @param inst - The sound_instance
 * @param pitch - Playback rate multiplier (1 = normal)
 */
export function audio_sound_pitch(inst: sound_instance, pitch: number): void {
    inst.set_pitch(pitch)
}

/**
 * Sets the master gain for all audio.
 * @param gain - Volume level (0–1)
 */
export function audio_set_master_gain(gain: number): void {
    audio_system.set_master_gain(gain)
}

/**
 * Returns the current master gain.
 */
export function audio_get_master_gain(): number {
    return audio_system.get_master_gain()
}
