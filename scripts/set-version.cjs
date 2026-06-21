#!/usr/bin/env node
/**
 * Bump every Silkweaver package to one version, in lockstep.
 *
 *   node scripts/set-version.cjs <version>            e.g.  node scripts/set-version.cjs 1.2.0
 *   node scripts/set-version.cjs <version> --no-lock  skip the package-lock.json re-sync
 *
 * Rewrites only the top-level "version" field in each package.json (a minimal one-line edit — all
 * other formatting is left untouched), then runs `npm install --package-lock-only` so the lockfile
 * matches (CI uses `npm ci`, which fails on a stale lock).
 *
 * The cross-package deps use caret ranges (^1.x), so they don't need touching for a minor/patch
 * bump. A MAJOR bump (e.g. 2.0.0) would also need those ranges widened by hand.
 */

const fs   = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const FILES = [
    'package.json',
    'packages/engine/package.json',
    'packages/project/package.json',
    'packages/build/package.json',
    'packages/cli/package.json',
    'packages/ide/package.json',
    'packages/electron/package.json',
]

const args    = process.argv.slice(2)
const noLock  = args.includes('--no-lock')
const version = args.find(a => !a.startsWith('-'))

if (!version) {
    console.error('Usage: node scripts/set-version.cjs <version> [--no-lock]   (e.g. 1.2.0)')
    process.exit(1)
}
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version)) {
    console.error(`✗ '${version}' is not a valid semver version (expected x.y.z).`)
    process.exit(1)
}

const root = path.resolve(__dirname, '..')
const errors = []
let changed = 0

for (const rel of FILES) {
    const file = path.join(root, rel)
    let text
    try { text = fs.readFileSync(file, 'utf8') }
    catch { errors.push(`${rel}: not found`); continue }

    // The first "version": "..." in a package.json is its own top-level field.
    const m = text.match(/"version":\s*"([^"]*)"/)
    if (!m) { errors.push(`${rel}: no "version" field`); continue }
    const old = m[1]

    if (old === version) { console.log(`  =  ${rel.padEnd(34)} already ${version}`); continue }

    const next = text.replace(/"version":\s*"[^"]*"/, `"version": "${version}"`)
    try {
        if (JSON.parse(next).version !== version) throw new Error('version not applied')
    } catch (e) { errors.push(`${rel}: ${e.message}`); continue }

    fs.writeFileSync(file, next)
    console.log(`  ✓  ${rel.padEnd(34)} ${old} → ${version}`)
    changed++
}

// The landing page (docs/index.html) isn't a package.json — bump its version badge too, via the
// stable <b data-sw-version> marker, so it never falls behind the packages again.
{
    const rel = 'docs/index.html'
    const file = path.join(root, rel)
    try {
        const src = fs.readFileSync(file, 'utf8')
        const next = src.replace(/(<b data-sw-version>)[^<]*(<\/b>)/, `$1${version}$2`)
        if (!/(<b data-sw-version>)[^<]*(<\/b>)/.test(src)) errors.push(`${rel}: no <b data-sw-version> marker`)
        else if (next === src) console.log(`  =  ${rel.padEnd(34)} already ${version}`)
        else { fs.writeFileSync(file, next); console.log(`  ✓  ${rel.padEnd(34)} → ${version}`); changed++ }
    } catch (e) { errors.push(`${rel}: ${e.message}`) }
}

if (errors.length) {
    console.error('\n✗ Problems (no lockfile sync run):')
    for (const e of errors) console.error('  - ' + e)
    process.exit(1)
}

if (changed > 0 && !noLock) {
    try {
        console.log('\nSyncing package-lock.json…')
        execSync('npm install --package-lock-only', { cwd: root, stdio: 'inherit' })
    } catch {
        console.warn('⚠ Could not sync package-lock.json automatically — run `npm install` before committing.')
    }
}

console.log(`\n${changed} file(s) set to ${version}.`)
if (changed > 0) console.log(`Next: commit (incl. package-lock.json), then \`git tag v${version} && git push --tags\`.`)
