/**
 * GMObject — base class for all game object definitions.
 *
 * A GMObject is a *blueprint* (like a class definition). It is not placed
 * in a room directly — the engine creates instances of it via instance_create().
 * Developers subclass GMObject to define their game objects and override
 * lifecycle methods (on_create, on_step, on_draw, etc.) from the instance class.
 *
 * Relationship:
 *   GMObject subclass  →  instance_create()  →  instance (lives in a room)
 *
 * The instance class already implements all instance behaviour. GMObject adds
 * the object-level metadata (default sprite, parent, name) that is shared
 * across all instances of a type.
 */

import { instance } from './instance.js'
import type { sprite } from '../drawing/sprite.js'

/**
 * Base class for all game objects.
 * Extend this to define a new object type. Override lifecycle methods as needed.
 */
export abstract class gm_object extends instance {
    /** Default sprite for instances of this object (can be overridden per-instance). */
    public static default_sprite: sprite | null = null

    /** Parent object class for inheritance queries (null = no parent). */
    public static parent: typeof gm_object | null = null

    /** Human-readable object name. Defaults to the class name. */
    public static object_name: string = ''

    /**
     * Returns the object name. Falls back to the constructor name if not set.
     */
    public static get_name(): string {
        return this.object_name || this.name
    }

    /**
     * Checks whether this object type is an ancestor (direct or indirect) of another.
     * @param child - The object type to test
     * @returns True if this class is somewhere in child's prototype chain
     */
    public static is_ancestor_of(child: typeof gm_object): boolean {
        let current: typeof gm_object | null = child.parent
        while (current !== null) {
            if (current === this) return true
            current = current.parent
        }
        return false
    }

    /**
     * Called once when the instance is created. Override in subclasses.
     */
    public on_create(): void {
        // Assign default sprite from the object class if the instance hasn't set one
        const cls = this.constructor as typeof gm_object
        if (this.sprite_index === -1 && cls.default_sprite !== null) {
            this.sprite_index = cls.default_sprite.id
        }
    }
}

// =========================================================================
// Object query functions (GMS API)
// =========================================================================

/**
 * Checks whether the given object class has been defined (is non-null).
 * In this engine, all imported object classes exist; this is a compatibility stub.
 * @param obj - Object class to check
 * @returns Always true for a valid class reference
 */
export function object_exists(obj: typeof gm_object | null | undefined): boolean {
    return obj != null
}

/**
 * Returns the name of an object class.
 * @param obj - Object class
 * @returns The object's name string
 */
export function object_get_name(obj: typeof gm_object): string {
    return obj.get_name()
}

/**
 * Returns the default sprite of an object class, or null if none.
 * @param obj - Object class
 * @returns Default sprite or null
 */
export function object_get_sprite(obj: typeof gm_object): sprite | null {
    return obj.default_sprite
}

/**
 * Returns the parent class of an object, or null if it has no parent.
 * @param obj - Object class
 * @returns Parent class or null
 */
export function object_get_parent(obj: typeof gm_object): typeof gm_object | null {
    return obj.parent
}

/**
 * Checks whether obj is a descendant of parent (i.e., parent is an ancestor of obj).
 * @param obj - Object to test
 * @param parent - Potential ancestor
 * @returns True if parent is an ancestor of obj
 */
export function object_is_ancestor(obj: typeof gm_object, parent: typeof gm_object): boolean {
    return parent.is_ancestor_of(obj)
}
