/**
 * @silkweaver/project — the canonical Silkweaver project format.
 *
 * The single source of truth for the on-disk shapes (project.json, room.json) shared
 * by the toolchain (build/cli) and the IDE. Types only — zero runtime dependencies,
 * so it is safe to import from any package (Node or browser).
 *
 * On-disk layout of a project folder:
 *   project.json            — the manifest (this file's `project_file`)
 *   objects/<name>.ts       — one gm_object subclass per object (class-per-object)
 *   rooms/<name>/room.json   — room definitions (`room_file`)
 *   sprites/<name>/…, backgrounds/…, scripts/<name>.ts, …
 */

/** A reference to a project resource in the manifest's registry. */
export interface resource_ref {
    name: string             // unique identifier
    icon?: string            // optional sprite name to use as this resource's tree thumbnail
    folder?: string          // optional '/'-separated tree folder path (empty/absent = category root)
    [key: string]: unknown   // type-specific extra fields
}

/** Global game/display settings (project.json `settings`). */
export interface project_settings {
    roomSpeed:    number    // target steps per second
    windowWidth:  number
    windowHeight: number
    startRoom:    string    // name of the first room
    displayColor: string    // CSS hex background clear colour, e.g. '#000000'
}

/** The resource registry (project.json `resources`) — name → reference, per category. */
export interface project_resources {
    sprites:     Record<string, resource_ref>
    sounds:      Record<string, resource_ref>
    backgrounds: Record<string, resource_ref>
    paths:       Record<string, resource_ref>
    scripts:     Record<string, resource_ref>
    fonts:       Record<string, resource_ref>
    timelines:   Record<string, resource_ref>
    objects:     Record<string, resource_ref>
    rooms:       Record<string, resource_ref>
}

/** A Silkweaver project manifest — `project.json`. */
export interface project_file {
    name:          string
    version:       string
    engineVersion: string
    settings:      project_settings
    resources:     project_resources
    /** Tree organisation: per-category list of folder paths (so empty folders persist too). */
    folders?:      Record<string, string[]>
}

/** A single placed instance in a room. */
export interface room_instance {
    id:            number    // unique within the room
    object_name:   string
    x:             number
    y:             number
    scale_x:       number
    scale_y:       number
    rotation:      number    // degrees
    creation_code: string
}

/** A background layer attached to a room. */
export interface room_background_layer {
    enabled:           boolean
    bg_name:           string    // background resource name
    tile_x:            boolean
    tile_y:            boolean
    stretch:           boolean
    visible_in_editor: boolean
}

/** A single placed tile in a room (a sub-rectangle of a background used as a tileset). */
export interface room_tile {
    id:      number    // unique within the room
    bg_name: string    // background resource used as the tileset
    left:    number    // source rectangle left in the tileset (px)
    top:     number    // source rectangle top in the tileset (px)
    width:   number    // tile/source width (px)
    height:  number    // tile/source height (px)
    x:       number    // room X position
    y:       number    // room Y position
    depth:   number    // draw depth (higher = further back)
}

/** A room view / viewport configuration. */
export interface room_view {
    enabled: boolean
    view_x:  number
    view_y:  number
    view_w:  number
    view_h:  number
    port_x:  number
    port_y:  number
    port_w:  number
    port_h:  number
    follow:  string    // object name to follow, or ''
}

/**
 * A room definition — `rooms/<name>/room.json`. This is the full written shape; readers should
 * treat a loaded file as `Partial<room_file>` and fill defaults (older files may omit fields),
 * as both the IDE room editor and the build toolchain do.
 */
export interface room_file {
    width:             number
    height:            number
    room_speed:        number
    persistent:        boolean
    creation_code:     string
    instances:         room_instance[]
    backgrounds:       room_background_layer[]
    views:             room_view[]
    tiles:             room_tile[]
    bg_color:          string     // room solid background colour (CSS hex, e.g. '#000000')
    bg_show_color:     boolean    // whether to clear the room to bg_color
    physics_world:     boolean
    physics_gravity_x: number
    physics_gravity_y: number
}
