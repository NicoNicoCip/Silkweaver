"use strict";
/**
 * Electron main process.
 * Creates the IDE BrowserWindow and handles IPC file system requests
 * from the renderer via the preload bridge.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
// =========================================================================
// Window
// =========================================================================
function create_window() {
    const win = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        title: 'Silkweaver IDE',
        backgroundColor: '#2b2b2b',
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });
    win.setMenuBarVisibility(false);
    win.loadFile(path.join(__dirname, '../../exports/ide/index.html'));
    // F12 to toggle DevTools
    win.webContents.on('before-input-event', (event, input) => {
        if (input.type === 'keyDown' && input.key === 'F12') {
            if (win.webContents.isDevToolsOpened()) {
                win.webContents.closeDevTools();
            }
            else {
                win.webContents.openDevTools({ mode: 'detach' });
            }
        }
    });
}
electron_1.app.whenReady().then(() => {
    create_window();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            create_window();
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
// =========================================================================
// IPC — File System Bridge
// =========================================================================
/** Pick a project folder (open or save-as) */
electron_1.ipcMain.handle('sw:pick-folder', async (_e, mode, defaultPath) => {
    const result = await electron_1.dialog.showOpenDialog({
        title: mode === 'open' ? 'Open Project Folder' : 'Save Project To Folder',
        properties: ['openDirectory', 'createDirectory'],
        defaultPath: defaultPath,
    });
    if (result.canceled || result.filePaths.length === 0)
        return null;
    return result.filePaths[0];
});
/** Read a text file */
electron_1.ipcMain.handle('sw:read-file', async (_e, abs_path) => {
    return fs.promises.readFile(abs_path, 'utf8');
});
/** Read a binary file and return it as a Base64 string */
electron_1.ipcMain.handle('sw:read-file-base64', async (_e, abs_path) => {
    const buf = await fs.promises.readFile(abs_path);
    return buf.toString('base64');
});
/** Write a text file (creates intermediate directories) */
electron_1.ipcMain.handle('sw:write-file', async (_e, abs_path, content) => {
    await fs.promises.mkdir(path.dirname(abs_path), { recursive: true });
    await fs.promises.writeFile(abs_path, content, 'utf8');
});
/** Write a binary file from a Base64 string */
electron_1.ipcMain.handle('sw:write-binary', async (_e, abs_path, base64) => {
    await fs.promises.mkdir(path.dirname(abs_path), { recursive: true });
    await fs.promises.writeFile(abs_path, Buffer.from(base64, 'base64'));
});
/** Check if a path exists */
electron_1.ipcMain.handle('sw:exists', async (_e, abs_path) => {
    try {
        await fs.promises.access(abs_path);
        return true;
    }
    catch {
        return false;
    }
});
// =========================================================================
// IPC — Game Build
// =========================================================================
/**
 * Builds the game from the project folder into exports/game.js.
 * Generates a _entry.ts bootstrapper, then runs esbuild to bundle it.
 * Returns { ok: true } or { ok: false, error: string }.
 */
electron_1.ipcMain.handle('sw:build-game', async (_e, project_folder) => {
    try {
        // Read project.json
        const proj_path = path.join(project_folder, 'project.json');
        const proj_text = await fs.promises.readFile(proj_path, 'utf8');
        const proj = JSON.parse(proj_text);
        const object_names = Object.keys(proj.resources.objects ?? {});
        const room_names = Object.keys(proj.resources.rooms ?? {});
        const sprite_names = Object.keys(proj.resources.sprites ?? {});
        const script_names = Object.keys(proj.resources.scripts ?? {});
        // Determine engine.js path relative to the project entry
        const engine_path = path.join(__dirname, '../engine.js');
        // Build object class definitions from their event files
        const object_imports = [];
        const object_class_defs = [];
        for (const obj_name of object_names) {
            const obj_json_path = path.join(project_folder, 'objects', obj_name, 'object.json');
            let obj_data = {};
            try {
                obj_data = JSON.parse(await fs.promises.readFile(obj_json_path, 'utf8'));
            }
            catch { /* new object with no saved data */ }
            const events = obj_data.events ?? [];
            const event_methods = [];
            for (const ev of events) {
                const ev_path = path.join(project_folder, 'objects', obj_name, `${ev}.ts`);
                let ev_code = '';
                try {
                    ev_code = await fs.promises.readFile(ev_path, 'utf8');
                }
                catch { /* empty event */ }
                // Wrap the raw code in the appropriate lifecycle method
                const method_name = _event_to_method(ev);
                if (method_name) {
                    event_methods.push(`    public ${method_name}(): void {\n${ev_code.split('\n').map(l => '        ' + l).join('\n')}\n    }`);
                }
            }
            // Inject sprite_index assignment at the start of on_create
            const sprite_init = obj_data.sprite_name
                ? `        this.sprite_index = _sprite_map['${obj_data.sprite_name}'] ?? -1`
                : '';
            // Check if user already has on_create event
            const has_create = events.includes('create');
            let create_method = '';
            if (sprite_init && !has_create) {
                // Add automatic on_create just for sprite assignment
                create_method = `    public on_create(): void {\n${sprite_init}\n    }`;
            }
            else if (sprite_init && has_create) {
                // Sprite init will be prepended in the existing on_create
                // Find and modify the existing on_create method
                for (let i = 0; i < event_methods.length; i++) {
                    if (event_methods[i].includes('public on_create()')) {
                        // Inject sprite assignment at start of method
                        event_methods[i] = event_methods[i].replace('public on_create(): void {', 'public on_create(): void {\n' + sprite_init);
                        break;
                    }
                }
            }
            const methods = has_create ? event_methods : [...event_methods, create_method].filter(Boolean);
            object_class_defs.push(`export class ${obj_name} extends gm_object {
    public static override object_name = '${obj_name}'
${methods.join('\n')}
}`);
        }
        // Build a lookup of solid flag per object type from object.json
        const object_solid = {};
        for (const obj_name of object_names) {
            const obj_json_path = path.join(project_folder, 'objects', obj_name, 'object.json');
            try {
                const d = JSON.parse(await fs.promises.readFile(obj_json_path, 'utf8'));
                object_solid[obj_name] = d.solid === true;
            }
            catch {
                object_solid[obj_name] = false;
            }
        }
        // Build room setup code
        const room_setups = [];
        const room_var_names = [];
        for (const room_name of room_names) {
            const rm_json_path = path.join(project_folder, 'rooms', room_name, 'room.json');
            let rm_data = {};
            try {
                rm_data = JSON.parse(await fs.promises.readFile(rm_json_path, 'utf8'));
            }
            catch { /* empty */ }
            const instances = rm_data.instances ?? [];
            const var_name = `_room_${room_name}`;
            const inst_lines = instances.map((inst, idx) => {
                if (!object_names.includes(inst.object_name))
                    return '';
                const v = `_inst_${inst.object_name}_${idx}`;
                const lines = [
                    `    const ${v} = new ${inst.object_name}(${var_name})`,
                    `    ${var_name}.room_instance_add(${inst.x}, ${inst.y}, ${v})`,
                ];
                if (object_solid[inst.object_name])
                    lines.push(`    ${v}.solid = true`);
                lines.push(`    ${v}.register_events()`);
                lines.push(`    game_loop.register(EVENT_TYPE.create, ${v}.on_create.bind(${v}))`);
                return lines.join('\n');
            }).filter(Boolean).join('\n');
            room_var_names.push(var_name);
            room_setups.push(`const ${var_name} = new room()
${var_name}.room_width  = ${rm_data.width ?? 640}
${var_name}.room_height = ${rm_data.height ?? 480}
${var_name}.room_speed  = ${rm_data.room_speed ?? 60}
${var_name}.room_persistent = ${rm_data.persistent ?? false}
${inst_lines}`);
        }
        // Script imports
        const script_imports = script_names.map(s => `import '${path.join(project_folder, 'scripts', s + '.ts').replace(/\\/g, '/')}';`).join('\n');
        // Sprite loading code (load from project folder)
        const sprite_loads = sprite_names.map(spr_name => {
            const meta_path = path.join(project_folder, 'sprites', spr_name, 'meta.json').replace(/\\/g, '/');
            return `await _load_sprite('${spr_name}', '${meta_path}', '${path.join(project_folder, 'sprites', spr_name).replace(/\\/g, '/')}')`;
        }).join('\n');
        // Background loading code (load from project folder)
        const bg_names = Object.keys(proj.resources.backgrounds || {});
        const bg_loads = bg_names.map(bg_name => {
            const meta_path = path.join(project_folder, 'backgrounds', bg_name, 'meta.json').replace(/\\/g, '/');
            return `await _load_background('${bg_name}', '${meta_path}', '${path.join(project_folder, 'backgrounds', bg_name).replace(/\\/g, '/')}')`;
        }).join('\n');
        // Determine start room
        const start_room = proj.settings.startRoom || room_names[0] || '';
        const start_var = start_room ? `_room_${start_room}` : room_var_names[0] ?? 'undefined';
        const entry_code = `// Auto-generated by Silkweaver IDE — do not edit manually.
import {
    game_loop, renderer, room, gm_object, instance, EVENT_TYPE,
    sprite, background, resource,
    draw_rectangle, draw_circle, draw_ellipse, draw_triangle,
    draw_point, draw_line, draw_line_width,
    draw_set_color, draw_get_color, draw_set_alpha, draw_get_alpha, draw_clear, draw_text,
    draw_set_font, draw_set_halign, draw_set_valign,
    c_aqua, c_black, c_blue, c_dkgray, c_fuchsia, c_gray, c_green,
    c_lime, c_ltgray, c_maroon, c_navy, c_olive, c_orange, c_purple,
    c_red, c_silver, c_teal, c_white, c_yellow,
    make_color_rgb, make_color_hsv,
    keyboard_check, keyboard_check_pressed, keyboard_check_released,
    vk_left, vk_right, vk_up, vk_down, vk_space, vk_shift, vk_control,
    vk_enter, vk_escape, vk_f1, vk_f2, vk_f3, vk_f4, vk_f5,
    mouse_check_button, mouse_check_button_pressed, mb_left, mb_right, mb_middle,
    window_mouse_get_x, window_mouse_get_y,
    random, irandom, random_range, irandom_range,
    clamp, lerp, abs, floor, ceil, round, sign, sqrt, sqr, min, max,
    point_distance, point_direction, lengthdir_x, lengthdir_y,
    angle_difference, dsin, dcos,
} from '${engine_path.replace(/\\/g, '/')}'

${script_imports}

// ── Object classes ──────────────────────────────────────────────────────────
${object_class_defs.join('\n\n')}

// ── Sprite loader ───────────────────────────────────────────────────────────
const _sprite_map: Record<string, number> = {}

async function _load_sprite(name: string, meta_path: string, img_dir: string): Promise<void> {
    // Sprites are loaded and dimensions extracted from meta.json
    // This is a best-effort loader — missing frames are silently skipped
    try {
        const meta = await fetch('file://' + meta_path).then(r => r.json())

        // Create sprite resource
        const spr = new sprite()
        spr.width = meta.width || 32
        spr.height = meta.height || 32
        spr.xoffset = meta.origin_x || 0
        spr.yoffset = meta.origin_y || 0

        // Load all frames specified in meta.json
        const frames = meta.frames || []
        if (frames.length === 0) {
            console.warn(\`[Sprite] \${name} has no frames defined in meta.json\`)
            return
        }

        // Load each frame image
        for (const frame_meta of frames) {
            const frame_name = frame_meta.name || frame_meta
            const frame_url = 'file://' + img_dir.replace(/\\\\/g, '/') + '/' + frame_name

            try {
                // Use texture_manager to load the image and create a WebGL texture
                const tex_entry = await renderer.tex_mgr.load(frame_url, false)
                spr.add_frame({
                    texture: tex_entry,
                    width: tex_entry.width,
                    height: tex_entry.height
                })
            } catch (err) {
                console.warn(\`[Sprite] Failed to load frame \${frame_name} for \${name}:\`, err)
            }
        }

        // Only register the sprite if at least one frame loaded successfully
        if (spr.frames.length > 0) {
            _sprite_map[name] = spr.id
        } else {
            console.warn(\`[Sprite] \${name} has no valid frames\`)
        }
    } catch (err) {
        console.warn(\`[Sprite] Failed to load \${name}:\`, err)
    }
}

// ── Background loader ───────────────────────────────────────────────────────
const _background_map: Record<string, number> = {}

async function _load_background(name: string, meta_path: string, img_dir: string): Promise<void> {
    // Backgrounds are loaded from meta.json + single image file
    try {
        const meta = await fetch('file://' + meta_path).then(r => r.json())

        if (!meta.file_name) {
            console.warn(\`[Background] \${name} has no file_name in meta.json\`)
            return
        }

        // Create background resource
        const bg = new background()
        bg.tile_h = meta.tile_h ?? false
        bg.tile_v = meta.tile_v ?? false
        bg.smooth = meta.smooth ?? false

        // Load the background image
        const img_url = 'file://' + img_dir.replace(/\\\\/g, '/') + '/' + meta.file_name

        try {
            // Use texture_manager to load with appropriate filtering
            const tex_entry = await renderer.tex_mgr.load(img_url, bg.smooth)
            bg.set_texture(tex_entry)
            _background_map[name] = bg.id
        } catch (err) {
            console.warn(\`[Background] Failed to load image for \${name}:\`, err)
        }
    } catch (err) {
        console.warn(\`[Background] Failed to load \${name}:\`, err)
    }
}

// ── Bootstrap ───────────────────────────────────────────────────────────────
export default async function init(canvas: HTMLCanvasElement): Promise<void> {
    renderer.init(canvas, ${proj.settings.windowWidth ?? 640}, ${proj.settings.windowHeight ?? 480})
    // Background clear color: ${proj.settings.displayColor ?? '#000000'}
    game_loop.init_input(canvas)

    // Load sprites
    ${sprite_loads}

    // Load backgrounds
    ${bg_loads}

    // Set up rooms
    ${room_setups.join('\n')}

    // Link room order
    ${room_var_names.map((v, i) => {
            const prev = room_var_names[i - 1];
            const next = room_var_names[i + 1];
            return [
                prev ? `${v}.room_previous = ${prev}.id` : '',
                next ? `${v}.room_next = ${next}.id` : '',
            ].filter(Boolean).join('\n    ');
        }).join('\n    ')}

    const start = ${start_var}
    if (!start) { console.error('[Game] No rooms defined.'); return }
    game_loop.start(start)
}
`;
        // Write the entry file into the project folder
        const entry_path = path.join(project_folder, '_entry.ts');
        await fs.promises.writeFile(entry_path, entry_code, 'utf8');
        // Determine output path: exports/game.js
        const out_path = path.join(__dirname, '../game.js');
        // Run esbuild directly via its Node API to avoid shell/path issues
        const esbuild_api = require(path.join(__dirname, '../../node_modules/esbuild'));
        await esbuild_api.build({
            entryPoints: [entry_path],
            bundle: true,
            outfile: out_path,
            format: 'esm',
        });
        // Clean up entry file
        await fs.promises.unlink(entry_path).catch(() => { });
        return { ok: true };
    }
    catch (e) {
        return { ok: false, error: String(e?.message ?? e) };
    }
});
/** Maps object editor event type strings to gm_object lifecycle method names. */
function _event_to_method(ev) {
    const map = {
        create: 'on_create',
        destroy: 'on_destroy',
        step: 'on_step',
        step_begin: 'on_step_begin',
        step_end: 'on_step_end',
        draw: 'on_draw',
        draw_gui: 'on_draw_gui',
    };
    return map[ev] ?? null;
}
