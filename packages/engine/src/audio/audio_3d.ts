/**
 * 3D / spatial audio utilities.
 *
 * Wraps the Web Audio API PannerNode for positional audio.
 * Uses a simple 2D model: listener sits at (lx, ly, 0), sounds at (sx, sy, 0).
 * Distance-based attenuation follows the inverse-distance rolloff model.
 *
 * Usage:
 *   audio_set_listener_position(view_x + view_w/2, view_y + view_h/2)
 *   const inst = audio_play_sound_at(asset, x, y)
 */

import { audio_system } from './audio_system.js'
import { sound_asset, sound_instance, register_instance } from './sound.js'
import { get_or_create_group } from './audio_group.js'

// =========================================================================
// Listener state
// =========================================================================

let _listener_x: number = 0  // Listener world X (updated each frame by camera)
let _listener_y: number = 0  // Listener world Y

// =========================================================================
// Spatial sound instance
// =========================================================================

/**
 * A sound_instance with an attached PannerNode for 3D positioning.
 */
export class spatial_sound_instance {
    public readonly instance:   sound_instance   // Underlying 2D sound instance handle
    private _panner: PannerNode                  // Web Audio spatial node

    constructor(panner: PannerNode, inst: sound_instance) {
        this.instance = inst
        this._panner  = panner
    }

    /**
     * Updates the world-space position of this sound source.
     * @param x - World X position
     * @param y - World Y position
     */
    public set_position(x: number, y: number): void {
        // Web Audio uses a 3D coordinate system; map 2D (x, y) to (x, y, 0)
        this._panner.positionX.value = x
        this._panner.positionY.value = y
        this._panner.positionZ.value = 0
    }

    /** Stops playback. */
    public stop(): void { this.instance.stop() }

    /** Returns true if currently playing. */
    public get is_playing(): boolean { return this.instance.is_playing }
}

// =========================================================================
// Public GMS-style API
// =========================================================================

/**
 * Sets the listener position in world space.
 * Should be updated each step to match the camera/view centre.
 * @param x - World X of the listener
 * @param y - World Y of the listener
 */
export function audio_set_listener_position(x: number, y: number): void {
    _listener_x = x
    _listener_y = y

    const listener = audio_system.ctx.listener
    if (listener.positionX) {
        // Modern API (Firefox 50+, Chrome 52+)
        listener.positionX.value = x
        listener.positionY.value = y
        listener.positionZ.value = 0
    } else {
        // Legacy fallback
        listener.setPosition(x, y, 0)
    }
}

/**
 * Plays a sound with 3D positional audio at a world-space location.
 * @param asset - Sound asset to play
 * @param x - World X position of the sound source
 * @param y - World Y position of the sound source
 * @param ref_distance - Distance at which volume starts attenuating (default 100)
 * @param max_distance - Distance at which volume reaches minimum (default 1000)
 * @param loop - Whether to loop
 * @returns spatial_sound_instance handle
 */
export function audio_play_sound_at(
    asset:        sound_asset,
    x:            number,
    y:            number,
    ref_distance: number  = 100,
    max_distance: number  = 1000,
    loop:         boolean = false,
): spatial_sound_instance {
    if (!asset.buffer) throw new Error(`sound_asset ${asset.id}: not yet loaded`)

    const ctx   = audio_system.ctx
    const group = get_or_create_group(asset.group_name)

    const source = ctx.createBufferSource()
    source.buffer = asset.buffer
    source.loop   = loop

    const panner = ctx.createPanner()
    panner.panningModel      = 'HRTF'
    panner.distanceModel     = 'inverse'
    panner.refDistance       = ref_distance
    panner.maxDistance       = max_distance
    panner.rolloffFactor     = 1
    panner.positionX.value   = x
    panner.positionY.value   = y
    panner.positionZ.value   = 0

    const gain_node = ctx.createGain()
    gain_node.gain.value = 1

    source.connect(panner)
    panner.connect(gain_node)
    gain_node.connect(group.gain_node)

    source.start()

    const inst         = new sound_instance(source, gain_node)
    register_instance(inst, asset.group_name)
    const spatial_inst = new spatial_sound_instance(panner, inst)
    return spatial_inst
}

/**
 * Updates an existing spatial sound instance's world position.
 * Call each step if the sound source is moving.
 * @param inst - The spatial_sound_instance to update
 * @param x - New world X
 * @param y - New world Y
 */
export function audio_set_sound_position(inst: spatial_sound_instance, x: number, y: number): void {
    inst.set_position(x, y)
}

/** Returns the current listener X position. */
export function audio_get_listener_x(): number { return _listener_x }

/** Returns the current listener Y position. */
export function audio_get_listener_y(): number { return _listener_y }
