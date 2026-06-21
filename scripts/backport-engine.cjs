#!/usr/bin/env node
'use strict'
/**
 * Build a self-contained engine bundle (`engine-<version>.mjs`) for one or more versions and,
 * optionally, upload it to that version's GitHub Release — the asset the IDE's engine version
 * manager downloads and vendors into a project's `.engine/`.
 *
 * Why this can be one uniform recipe: the engine's module layout has NOT changed across the entire
 * history (`packages/engine/src/index.ts`, esbuild, `matter-js ^0.20`), so the same build works for
 * every version with no per-version special cases. This exists to backport the releases that shipped
 * BEFORE the version manager (v1.0.0 … v1.4.0, which have no engine asset). Future releases publish
 * the asset automatically from CI — see `.github/workflows/release.yml`.
 *
 * The bundle matches what `@silkweaver/build`'s `vendor_engine` produces (bundle + ESM + keepNames +
 * matter-js inlined) so a downloaded asset is interchangeable with a freshly-vendored engine.
 *
 *   node scripts/backport-engine.cjs                  build the current working tree → engine-<version>.mjs
 *   node scripts/backport-engine.cjs v1.0.0 v1.1.0    build those tags (from their archived source)
 *   node scripts/backport-engine.cjs --all            build every released tag from the floor (v1.0.0) up
 *   node scripts/backport-engine.cjs v1.2.0 --upload  build + `gh release upload v1.2.0 …`
 *   node scripts/backport-engine.cjs v1.0.0 --upload --tag=Release   upload onto a differently-named release
 *   --out=<dir>   output directory (default: ./.engine-assets)
 *   --tag=<tag>   upload onto this release tag instead of v<version> (single version only — for the
 *                 early release whose tag is misnamed). The asset is still named engine-<version>.mjs,
 *                 which is what the IDE keys the version off, so the release's name is irrelevant.
 *
 * Build needs the repo's node_modules (esbuild + matter-js). Upload needs the GitHub CLI (`gh`)
 * authenticated and the target Release to already exist.
 */

const fs   = require('fs')
const path = require('path')
const { ROOT, step, ok, info, warn, fail, run, capture, readVersion } = require('./release-lib.cjs')

/** Backport floor — the first stable release (decided with the user 2026-06-21). */
const FLOOR = '1.0.0'

const argv = process.argv.slice(2)
const has  = f => argv.includes(f)
const val  = k => { const a = argv.find(x => x.startsWith(k + '=')); return a ? a.slice(k.length + 1) : null }

/** Compare two `x.y.z` strings: <0 if a<b, 0 if equal, >0 if a>b. */
function semverCmp(a, b) {
    const pa = a.split('.').map(n => parseInt(n, 10) || 0)
    const pb = b.split('.').map(n => parseInt(n, 10) || 0)
    for (let i = 0; i < 3; i++) { const d = (pa[i] || 0) - (pb[i] || 0); if (d) return Math.sign(d) }
    return 0
}

/**
 * Bundle a version's engine to `engine-<version>.mjs`. When `ref` is set the engine source is read
 * from that git ref (archived to a temp dir); otherwise the current working tree is used.
 */
async function buildOne(version, ref, outDir) {
    const esbuild = require('esbuild')
    let entry, cleanup = () => {}
    if (ref) {
        const tmp = fs.mkdtempSync(path.join(ROOT, '.backport-tmp-'))
        // Extract just packages/engine from the tag. (tar ships with Git Bash / Windows 10+ / CI.)
        if (!run(`git archive ${ref} packages/engine | tar -x -C "${tmp}"`, { optional: true })) {
            fs.rmSync(tmp, { recursive: true, force: true })
            throw new Error(`Could not archive packages/engine from ${ref} (does the tag exist?)`)
        }
        entry   = path.join(tmp, 'packages', 'engine', 'src', 'index.ts')
        cleanup = () => fs.rmSync(tmp, { recursive: true, force: true })
    } else {
        entry = path.join(ROOT, 'packages', 'engine', 'src', 'index.ts')
    }
    const outfile = path.join(outDir, `engine-${version}.mjs`)
    try {
        await esbuild.build({
            entryPoints: [entry],
            bundle:      true,
            format:      'esm',
            keepNames:   true,                              // the engine reads constructor.name at runtime
            target:      'es2020',                          // the engine's compile target (CLAUDE.md)
            // Pin class-field semantics and skip tsconfig discovery so the bundle is identical whether
            // built from the working tree or a temp archive (which can't see the root tsconfig.base.json).
            tsconfigRaw: { compilerOptions: { useDefineForClassFields: false } },
            outfile,
            nodePaths:   [path.join(ROOT, 'node_modules')], // resolve matter-js even from a temp source dir
            logLevel:    'warning',
        })
    } finally {
        cleanup()
    }
    return outfile
}

/** True if a published GitHub Release already exists for the tag. */
function releaseExists(tag) {
    return capture(`gh release view ${tag} --json tagName`) !== null
}

/**
 * Attach a built asset to its release via the GitHub CLI. The earliest tags (e.g. v1.0.0) predate the
 * CI installer pipeline and may have a git tag but NO GitHub Release — so create one if it's missing
 * (the tag already exists), otherwise upload onto the existing release.
 */
function upload(version, file, tagOverride) {
    const tag = tagOverride || `v${version}`
    if (!releaseExists(tag)) {
        info(`No GitHub Release for ${tag} yet — creating one to host the engine asset.`)
        const cmd = `gh release create ${tag} "${file}" --title "${tag}" --latest=false ` +
            `--notes "Engine runtime asset (engine-${version}.mjs) for the Silkweaver engine version manager."`
        if (!run(cmd, { optional: true })) {
            warn(`Could not create Release ${tag}. Check gh auth (write access) and that the tag is pushed.`)
            warn(`  Manual: ${cmd}`)
            return false
        }
        ok(`created Release ${tag} with engine-${version}.mjs`)
        return true
    }
    if (!run(`gh release upload ${tag} "${file}" --clobber`, { optional: true })) {
        warn(`Upload failed for ${tag}. Ensure gh is authenticated with write access.`)
        warn(`  Manual: gh release upload ${tag} "${file}" --clobber`)
        return false
    }
    ok(`uploaded engine-${version}.mjs → ${tag}`)
    return true
}

/** Resolve the list of {version, ref} targets from the CLI args. */
function resolveTargets() {
    if (has('--all')) {
        const tags = (capture('git tag --list "v*"') || '')
            .split('\n').map(s => s.trim()).filter(t => /^v\d+\.\d+\.\d+$/.test(t))
            .map(t => t.slice(1))
            .filter(v => semverCmp(v, FLOOR) >= 0)
            .sort(semverCmp)
        return tags.map(v => ({ version: v, ref: `v${v}` }))
    }
    const positional = argv.filter(a => !a.startsWith('--'))
    if (positional.length === 0) return [{ version: readVersion(), ref: null }]   // current working tree
    return positional.map(p => { const v = p.replace(/^v/, ''); return { version: v, ref: `v${v}` } })
}

;(async () => {
    const outDir   = val('--out') || path.join(ROOT, '.engine-assets')
    const doUpload = has('--upload')
    fs.mkdirSync(outDir, { recursive: true })

    const targets = resolveTargets()
    if (!targets.length) fail('No target versions. Pass tags (v1.0.0 …) or --all.')

    step(`Backport engine asset — ${targets.length} version(s)${doUpload ? ' (+ upload)' : ''}`)
    const built = []
    for (const t of targets) {
        info(`building engine-${t.version}.mjs ${t.ref ? `from ${t.ref}` : '(working tree)'}`)
        const file = await buildOne(t.version, t.ref, outDir)
        ok(`built ${path.basename(file)} (${(fs.statSync(file).size / 1024).toFixed(1)}kb)`)
        built.push({ ...t, file })
    }

    if (doUpload) {
        step('Upload to GitHub releases')
        const tagOverride = val('--tag')
        if (tagOverride && built.length !== 1) fail('--tag overrides a single release tag — pass exactly one version with it.')
        let failures = 0
        for (const b of built) if (!upload(b.version, b.file, tagOverride)) failures++
        if (failures) fail(`${failures} upload(s) failed — see warnings above.`)
    } else {
        info(`Built into ${outDir}. Re-run with --upload to attach each to its release (needs gh).`)
    }
})().catch(e => fail(e && e.stack ? e.stack : String(e)))
