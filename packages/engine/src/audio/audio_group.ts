/**
 * Audio groups — named gain buses that sounds can be assigned to.
 *
 * Each group has its own GainNode that sits between sound sources
 * and the master gain node:
 *   source → group gain → master gain → destination
 *
 * Groups are created on first use and never destroyed.
 */

import { audio_system } from './audio_system.js'
import { resource } from '../core/resource.js'

// =========================================================================
// audio_group resource
// =========================================================================

/**
 * A named audio bus with an independent gain level.
 */
export class audio_group extends resource {
    public readonly group_name: string   // Human-readable group name
    private _gain_node: GainNode | null = null  // Web Audio gain node for this bus

    /**
     * @param group_name - Unique name for this audio group
     */
    constructor(group_name: string) {
        super()
        this.group_name = group_name
    }

    /**
     * Returns the GainNode for this group, creating it if necessary.
     * Lazily initialised so it can be constructed before audio_system.init().
     */
    public get gain_node(): GainNode {
        if (!this._gain_node) {
            this._gain_node = audio_system.ctx.createGain()
            this._gain_node.connect(audio_system.master)
        }
        return this._gain_node
    }

    /**
     * Sets the gain (volume) for this group.
     * @param gain - Volume level (0 = silent, 1 = full)
     */
    public set_gain(gain: number): void {
        this.gain_node.gain.value = Math.max(0, gain)
    }

    /** Returns the current gain for this group. */
    public get_gain(): number {
        return this._gain_node?.gain.value ?? 1
    }

    /**
     * Stops all sounds in this group by disconnecting and reconnecting
     * the gain node. Individual sound tracking is handled by sound_instance.
     * This is a volume-only group; stopping is done via the sound registry.
     */
    public stop_all(): void {
        if (_stop_group_cb) _stop_group_cb(this.group_name)
    }
}

// =========================================================================
// Group registry
// =========================================================================

const _groups: Map<string, audio_group> = new Map()

// Injected by sound.ts to avoid a circular import
let _stop_group_cb: ((group_name: string) => void) | null = null

/**
 * Registers the callback used by audio_group.stop_all() to stop live instances.
 * Called once by sound.ts after module initialisation.
 * @param cb - Function that stops all instances in a named group
 */
export function set_stop_group_callback(cb: (group_name: string) => void): void {
    _stop_group_cb = cb
}

/**
 * Returns or creates an audio group with the given name.
 * @param name - Group name
 */
export function get_or_create_group(name: string): audio_group {
    let g = _groups.get(name)
    if (!g) {
        g = new audio_group(name)
        _groups.set(name, g)
    }
    return g
}

// =========================================================================
// Public GMS-style API
// =========================================================================

/**
 * Sets the gain for a named audio group.
 * @param group_name - Group name
 * @param gain - Volume level (0–1)
 */
export function audio_group_set_gain(group_name: string, gain: number): void {
    get_or_create_group(group_name).set_gain(gain)
}

/**
 * Returns the current gain for a named audio group.
 * @param group_name - Group name
 */
export function audio_group_get_gain(group_name: string): number {
    return get_or_create_group(group_name).get_gain()
}

/**
 * Stops all sounds in a named audio group.
 * @param group_name - Group name
 */
export function audio_group_stop(group_name: string): void {
    get_or_create_group(group_name).stop_all()
}
