/**
 * Starter-template metadata for the New Project dropdown.
 *
 * The templates themselves are real, ready-to-build project folders bundled with
 * `@silkweaver/build` (sprites and all). Creating a project from a template just recursively
 * copies that folder into the destination — see start_page → `project_create_from_template`.
 * This file only carries the dropdown's id/label/description (ids match build's bundled folders).
 */

export interface template_def {
    id:          string
    label:       string
    description: string
}

/** The templates offered in the New Project dropdown (ids match @silkweaver/build's bundled folders). */
export const TEMPLATES: template_def[] = [
    { id: 'empty',      label: 'Empty',      description: 'A blank project with a single empty room.' },
    { id: 'platformer', label: 'Platformer', description: 'A/D to move, Space to jump — gravity, solid platforms, parent-based collision.' },
    { id: 'topdown',    label: 'Top-down',   description: 'WASD movement with parent-based wall collision (place_meeting + a _col parent).' },
]
