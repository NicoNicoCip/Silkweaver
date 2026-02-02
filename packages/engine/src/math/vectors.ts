/**
 * A 2D vector representing a point or direction in 2D space.
 */
export class vector2 {
    public x: number = 0    // X component of the vector
    public y: number = 0    // Y component of the vector

    /**
     * Creates a new 2D vector.
     * @param x - X component (default 0)
     * @param y - Y component (default 0)
     */
    constructor(x: number = 0, y: number = 0) {
        this.x = x
        this.y = y
    }

    /**
     * Returns a JSON string representation of this vector.
     * @returns JSON string with x and y values
     */
    public toString(): string {
        return JSON.stringify(this)
    }
}