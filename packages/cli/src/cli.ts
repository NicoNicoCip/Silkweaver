#!/usr/bin/env node
/**
 * Silkweaver CLI — create, build, run, and export a game with no IDE.
 *
 *   silkweaver new <name>                 scaffold a new project (an npm package)
 *   silkweaver build [project] [out]      build a portable HTML5 folder (default out: <project>/dist)
 *   silkweaver run [project] [--port N]   build, serve over http, and open in the browser
 *   silkweaver export [project] [out]     export — --target web|win|mac|linux (default web)
 *
 * Drives @silkweaver/build (the same toolchain the IDE uses).
 */

import * as build from '@silkweaver/build'
import * as http  from 'node:http'
import * as fs    from 'node:fs'
import * as path  from 'node:path'
import * as os    from 'node:os'
import { spawn }  from 'node:child_process'

// =========================================================================
// Entry
// =========================================================================

async function main(): Promise<void> {
    const [cmd, ...rest] = process.argv.slice(2)
    try {
        switch (cmd) {
            case 'new':    await cmd_new(rest);    break
            case 'build':  await cmd_build(rest);  break
            case 'export': await cmd_export(rest); break
            case 'run':    await cmd_run(rest);    break
            case 'help': case '-h': case '--help': case undefined: print_help(); break
            default:
                console.error(`Unknown command: ${cmd}\n`)
                print_help()
                process.exit(1)
        }
    } catch (e: any) {
        console.error(`✗ ${e?.message ?? e}`)
        process.exit(1)
    }
}

function print_help(): void {
    console.log(`Silkweaver CLI

  silkweaver new <name>                 scaffold a new project
  silkweaver build [project] [out]      build a portable HTML5 folder (default out: <project>/dist)
  silkweaver run [project] [--port N]   build, serve over http, and open in the browser
  silkweaver export [project] [out] --target web|win|mac|linux

  project defaults to the current directory.`)
}

/** Returns the absolute project path from the first non-flag arg, defaulting to cwd. */
function project_arg(args: string[]): string {
    const first = args.find(a => !a.startsWith('-'))
    return path.resolve(first ?? '.')
}

// =========================================================================
// build
// =========================================================================

async function cmd_build(args: string[]): Promise<void> {
    const project = project_arg(args)
    const positional = args.filter(a => !a.startsWith('-'))
    const out = path.resolve(positional[1] ?? path.join(project, 'dist'))
    console.log(`Building ${project} → ${out}`)
    await build.export_html5(project, out)
    console.log(`✓ Built. Serve it (e.g. \`silkweaver run\`) — HTML5 games need an http server.`)
}

// =========================================================================
// export
// =========================================================================

async function cmd_export(args: string[]): Promise<void> {
    const project = project_arg(args)
    const positional = args.filter(a => !a.startsWith('-'))
    const target = flag(args, '--target') ?? 'web'
    const out = path.resolve(positional[1] ?? path.join(project, 'dist'))

    if (target === 'web') {
        console.log(`Exporting HTML5: ${project} → ${out}`)
        await build.export_html5(project, out)
        console.log('✓ HTML5 export complete.')
        return
    }

    const PLATFORMS: Record<string, [string, string]> = {
        win:   ['win32',  'x64'],
        mac:   ['darwin', 'arm64'],
        linux: ['linux',  'x64'],
    }
    const pa = PLATFORMS[target]
    if (!pa) throw new Error(`Unknown --target '${target}' (use web | win | mac | linux)`)
    console.log(`Packaging ${target} executable: ${project} → ${out} (this can take a minute)`)
    const result = await build.export_executable(project, out, pa[0], pa[1])
    console.log(`✓ Executable export complete → ${result}`)
}

// =========================================================================
// run — build, serve over http, open
// =========================================================================

async function cmd_run(args: string[]): Promise<void> {
    const project = project_arg(args)
    const port    = Number(flag(args, '--port') ?? 8080)
    const out     = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'silkweaver-run-'))

    console.log(`Building ${project}…`)
    await build.export_html5(project, out)

    const server = serve(out, port)
    const url = `http://localhost:${port}/`
    server.on('listening', () => {
        console.log(`▶ Serving ${url}  (Ctrl+C to stop)`)
        open_browser(url)
    })
    server.on('error', (e: any) => {
        console.error(`✗ Could not start server on port ${port}: ${e.message}`)
        process.exit(1)
    })
}

const MIME: Record<string, string> = {
    '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
    '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.gif': 'image/gif', '.webp': 'image/webp',
    '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg',
}

/** Minimal static file server rooted at `dir`. */
export function serve(dir: string, port: number): http.Server {
    return http.createServer((req, res) => {
        let rel = decodeURIComponent((req.url ?? '/').split('?')[0]!)
        if (rel === '/' || rel === '') rel = '/index.html'
        const file = path.join(dir, rel)
        // Containment check: reject anything that escapes `dir` (path.relative avoids the
        // prefix-match pitfall of startsWith, where a sibling dir with the same name prefix passes).
        const within = path.relative(dir, file)
        if (within.startsWith('..') || path.isAbsolute(within)) { res.writeHead(403).end('Forbidden'); return }
        fs.readFile(file, (err, data) => {
            if (err) { res.writeHead(404).end('Not found'); return }
            res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream' }).end(data)
        })
    }).listen(port)
}

function open_browser(url: string): void {
    const cmd = process.platform === 'win32' ? 'cmd'
              : process.platform === 'darwin' ? 'open'
              : 'xdg-open'
    const cmdArgs = process.platform === 'win32' ? ['/c', 'start', '', url] : [url]
    try { spawn(cmd, cmdArgs, { stdio: 'ignore', detached: true }).unref() } catch { /* best effort */ }
}

// =========================================================================
// new — scaffold a project (an npm package)
// =========================================================================

async function cmd_new(args: string[]): Promise<void> {
    const name = args.find(a => !a.startsWith('-'))
    if (!name) throw new Error('Usage: silkweaver new <name>')
    if (!/^[A-Za-z0-9_-]+$/.test(name)) throw new Error('Project name may only contain letters, digits, _ and -')
    const dir = path.resolve(name)
    if (fs.existsSync(dir)) throw new Error(`'${dir}' already exists`)

    const write = async (rel: string, content: string) => {
        const f = path.join(dir, rel)
        await fs.promises.mkdir(path.dirname(f), { recursive: true })
        await fs.promises.writeFile(f, content, 'utf8')
    }

    await write('project.json', SCAFFOLD.project(name))
    await write('package.json', SCAFFOLD.package(name))
    await write('tsconfig.json', SCAFFOLD.tsconfig())
    await write('.gitignore', 'node_modules/\ndist/\n')
    await write('objects/obj_player.ts', SCAFFOLD.player())
    await write('rooms/room_main/room.json', SCAFFOLD.room())

    console.log(`✓ Created ${name}\n`)
    console.log(`  cd ${name}`)
    console.log(`  npm install        # gets @silkweaver/engine (autocomplete) + the CLI`)
    console.log(`  npx silkweaver run`)
}

const SCAFFOLD = {
    project: (name: string) => JSON.stringify({
        name,
        version: '1.0.0',
        engineVersion: '1.0.0',
        settings: { roomSpeed: 60, windowWidth: 640, windowHeight: 480, startRoom: 'room_main', displayColor: '#1a1a2e' },
        resources: {
            sprites: {}, sounds: {}, backgrounds: {}, paths: {}, scripts: {}, fonts: {}, timelines: {},
            objects: { obj_player: { name: 'obj_player' } },
            rooms:   { room_main:  { name: 'room_main' } },
        },
    }, null, 2) + '\n',

    package: (name: string) => JSON.stringify({
        name,
        version: '1.0.0',
        private: true,
        type: 'module',
        scripts: {
            build:  'silkweaver build .',
            start:  'silkweaver run .',
            export: 'silkweaver export .',
        },
        devDependencies: {
            '@silkweaver/cli':    '^1.0.0',
            '@silkweaver/engine': '^1.0.0',
        },
    }, null, 2) + '\n',

    tsconfig: () => JSON.stringify({
        compilerOptions: {
            target: 'ES2020',
            module: 'ESNext',
            moduleResolution: 'bundler',
            strict: true,
            lib: ['ES2020', 'DOM'],
        },
        include: ['objects/**/*.ts', 'scripts/**/*.ts'],
    }, null, 2) + '\n',

    player: () => `import {
    gm_object,
    keyboard_check, vk_left, vk_right, vk_up, vk_down,
    draw_set_color, draw_rectangle, c_white,
} from '@silkweaver/engine'

export class obj_player extends gm_object {
    on_step(): void {
        const spd = 4
        if (keyboard_check(vk_left))  this.x -= spd
        if (keyboard_check(vk_right)) this.x += spd
        if (keyboard_check(vk_up))    this.y -= spd
        if (keyboard_check(vk_down))  this.y += spd
    }

    on_draw(): void {
        draw_set_color(c_white)
        draw_rectangle(this.x, this.y, this.x + 32, this.y + 32, false)
    }
}
`,

    room: () => JSON.stringify({
        width: 640, height: 480, room_speed: 60,
        instances: [{ id: 1, object_name: 'obj_player', x: 304, y: 224 }],
    }, null, 2) + '\n',
}

// =========================================================================
// helpers
// =========================================================================

/** Returns the value following a `--flag` argument, or undefined. */
function flag(args: string[], name: string): string | undefined {
    const i = args.indexOf(name)
    return i >= 0 ? args[i + 1] : undefined
}

main()
