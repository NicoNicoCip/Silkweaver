#!/usr/bin/env node
'use strict'
/**
 * Publish the public Silkweaver packages to npm — @silkweaver/{project,engine,build,cli}, in
 * dependency order. Publishes whatever version is currently in the package.json files (run
 * `npm run version:set <v>` first, or use the `release:all` factory which bumps for you).
 *
 *   node scripts/publish-npm.cjs                 build, confirm, then publish to npm
 *   node scripts/publish-npm.cjs --dry-run       rehearse (npm publish --dry-run; uploads nothing)
 *   node scripts/publish-npm.cjs --yes           skip the confirmation prompt (for automation)
 *   node scripts/publish-npm.cjs --no-build      don't rebuild dist first (assume it's current)
 *   node scripts/publish-npm.cjs --otp=123456    pass a 2FA one-time password through to npm
 *   node scripts/publish-npm.cjs --tag=next      publish under a dist-tag other than 'latest'
 *
 * Already-published versions are skipped (npm versions are immutable). Requires `npm login` first.
 */

const { publishNpm, fail } = require('./release-lib.cjs')

const argv = process.argv.slice(2)
const has  = f => argv.includes(f)
const val  = k => { const a = argv.find(x => x.startsWith(k + '=')); return a ? a.slice(k.length + 1) : null }

for (const a of argv) {
    if (!['--dry-run', '--yes', '--no-build'].includes(a) && !a.startsWith('--otp=') && !a.startsWith('--tag='))
        fail(`Unknown argument: ${a}\nSee the header of scripts/publish-npm.cjs for usage.`)
}

publishNpm({
    dryRun: has('--dry-run'),
    yes:    has('--yes'),
    build:  !has('--no-build'),
    otp:    val('--otp'),
    tag:    val('--tag'),
}).catch(e => fail(e && e.stack ? e.stack : String(e)))
