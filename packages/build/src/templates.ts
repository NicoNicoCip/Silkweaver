/**
 * Starter templates for the New Project flow.
 *
 * Each template is a real, ready-to-build project folder bundled under `../templates/<id>/`
 * (sprites and all). Creating a project from a template is just a recursive copy of that folder
 * into the destination — no codegen — so the templates stay editable/diffable in the repo and a
 * dogfooded example game *is* the template. Pure Node (fs/path), reusable from the IDE or CLI.
 */

import * as fs   from 'node:fs'
import * as path from 'node:path'

export interface template_info {
    id:            string
    label:         string
    description:   string
    display_color: string   // from the template's project.json (settings.displayColor)
}

/** Ordered registry of the bundled starter templates (folders live under ../templates/<id>). */
const TEMPLATE_REGISTRY: { id: string; label: string; description: string }[] = [
    { id: 'empty',      label: 'Empty',      description: 'A blank project with a single empty room.' },
    { id: 'platformer', label: 'Platformer', description: 'A/D to move, Space to jump — gravity, solid platforms, parent-based collision.' },
    { id: 'topdown',    label: 'Top-down',   description: 'WASD movement with parent-based wall collision (place_meeting + a _col parent).' },
]

/** Absolute path to the bundled templates directory (sibling of dist/). */
function templates_dir(): string {
    return path.join(__dirname, '..', 'templates')
}

/** Names never copied into a new project (build artifacts / VCS / deps), as a defensive guard. */
const COPY_DENYLIST = new Set(['_entry.ts', '_engine_globals.ts', 'node_modules', '.git', 'exports', 'game.js'])

/** Returns the available starter templates — only those whose folder is actually installed. */
export function list_templates(): template_info[] {
    const out: template_info[] = []
    for (const t of TEMPLATE_REGISTRY) {
        let display_color = '#1a1a2e'
        try {
            const j = JSON.parse(fs.readFileSync(path.join(templates_dir(), t.id, 'project.json'), 'utf8'))
            if (typeof j?.settings?.displayColor === 'string') display_color = j.settings.displayColor
        } catch { continue }   // folder missing/unreadable → omit it
        out.push({ id: t.id, label: t.label, description: t.description, display_color })
    }
    return out
}

/**
 * Materializes a starter template into `dest_folder` by recursively copying its bundled project
 * folder, then (optionally) setting the display name in project.json.
 * @param template_id - 'empty' | 'platformer' | 'topdown'
 * @param dest_folder - Absolute path of the new project folder (created if missing)
 * @param name        - Optional display name to write into project.json
 */
export async function create_from_template(template_id: string, dest_folder: string, name?: string): Promise<void> {
    if (!TEMPLATE_REGISTRY.some(t => t.id === template_id)) throw new Error(`Unknown template: ${template_id}`)
    const src = path.join(templates_dir(), template_id)
    if (!fs.existsSync(path.join(src, 'project.json'))) throw new Error(`Template '${template_id}' is not installed`)
    if (fs.existsSync(path.join(dest_folder, 'project.json'))) throw new Error('A project already exists in that folder')

    await fs.promises.mkdir(dest_folder, { recursive: true })
    await fs.promises.cp(src, dest_folder, {
        recursive: true,
        filter: (s) => !COPY_DENYLIST.has(path.basename(s)),
    })

    if (name && name.trim()) {
        const proj_path = path.join(dest_folder, 'project.json')
        try {
            const j = JSON.parse(await fs.promises.readFile(proj_path, 'utf8'))
            j.name = name.trim()
            await fs.promises.writeFile(proj_path, JSON.stringify(j, null, 2) + '\n', 'utf8')
        } catch { /* keep the template's bundled name */ }
    }
}
