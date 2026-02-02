/**
 * Abstract base class for all game resources.
 * Provides auto-incrementing unique ID and name for each resource instance.
 */
export abstract class resource {
    private static gid = 0                                  // Global ID counter for all resources
    private static all: Map<number, resource> = new Map()   // Registry of all resources by ID
    public readonly id: number = this.incrementID()         // Unique identifier for this resource
    public readonly name: string = this.constructor.name    // Name derived from the class type

    /**
     * Increments and returns the next available resource ID.
     * @returns The next unique resource ID
     */
    private incrementID(): number {
        return resource.gid++
    }

    constructor() {
        resource.all.set(this.id, this)
    }

    protected static removeByID(id: number): void {
        resource.all.delete(id)
    }

    protected static findByID(id: number): resource | undefined {
        return resource.all.get(id)
    }
}