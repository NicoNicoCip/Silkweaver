#!/usr/bin/env node
'use strict'
/**
 * Cut a GitHub release for the current version: tag the HEAD commit `v<version>` and push the branch
 * + tag to the remote. Pushing a `v*` tag triggers the `Release installers` workflow, which builds
 * the win/mac/linux installers and uploads them (plus the auto-updater metadata) to a DRAFT GitHub
 * Release. Review the draft and hit Publish so the in-app updater can see it.
 *
 *   node scripts/release-github.cjs               tag v<version> + push (after confirmation)
 *   node scripts/release-github.cjs --dry-run     print the git commands without running them
 *   node scripts/release-github.cjs --yes         skip the confirmation prompt
 *   node scripts/release-github.cjs --tag=v1.3.0  override the tag name
 *   node scripts/release-github.cjs --remote=upstream    push to a remote other than origin
 *
 * Requires a clean working tree — commit the version bump first (or use the `release:all` factory).
 */

const { pushReleaseTag, fail } = require('./release-lib.cjs')

const argv = process.argv.slice(2)
const has  = f => argv.includes(f)
const val  = k => { const a = argv.find(x => x.startsWith(k + '=')); return a ? a.slice(k.length + 1) : null }

for (const a of argv) {
    if (!['--dry-run', '--yes'].includes(a) && !a.startsWith('--tag=') && !a.startsWith('--remote='))
        fail(`Unknown argument: ${a}\nSee the header of scripts/release-github.cjs for usage.`)
}

pushReleaseTag({
    dryRun: has('--dry-run'),
    yes:    has('--yes'),
    tag:    val('--tag'),
    remote: val('--remote') || 'origin',
}).catch(e => fail(e && e.stack ? e.stack : String(e)))
