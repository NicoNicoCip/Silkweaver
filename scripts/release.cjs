#!/usr/bin/env node
'use strict'
/**
 * The Silkweaver release factory — one command to ship a new version everywhere.
 *
 *   node scripts/release.cjs <version> [flags]        e.g.  node scripts/release.cjs 1.3.0
 *
 * It runs, in order:
 *   1. version bump   — scripts/set-version.cjs (all 7 package.json + lockfile, in lockstep)
 *   2. verify         — `tsc -b` typecheck, then `npm run build:tooling` (fresh dist for npm)
 *   3. commit         — git commit the bump as "v<version>" (nothing to commit is fine)
 *   4. npm            — publish @silkweaver/{project,engine,build,cli}            (skip: --skip-npm)
 *   5. github         — tag v<version> + push → CI builds installers → draft Release  (skip: --skip-github)
 *
 * Flags:
 *   --dry-run        rehearse the whole thing — bumps/commits/publishes/pushes NOTHING
 *   --yes            skip every confirmation prompt (CI / unattended)
 *   --skip-npm       don't publish to npm
 *   --skip-github    don't tag/push (no installer build)
 *   --no-commit      don't create the version-bump commit (you'll commit yourself)
 *   --otp=123456     2FA one-time password passed through to npm publish
 *   --allow-branch   proceed even when not on `main` (otherwise it just warns)
 *
 * npm versions are immutable and a pushed tag kicks off a real CI build, so do a `--dry-run` first.
 */

const lib = require('./release-lib.cjs')
const { ROOT, SEMVER, step, ok, info, warn, fail, run, readVersion,
        gitClean, currentBranch, npmWhoami, publishNpm, pushReleaseTag, bold, green, dim } = lib

const argv = process.argv.slice(2)
const has  = f => argv.includes(f)
const val  = k => { const a = argv.find(x => x.startsWith(k + '=')); return a ? a.slice(k.length + 1) : null }

const KNOWN = ['--dry-run', '--yes', '--skip-npm', '--skip-github', '--no-commit', '--allow-branch']
const positionals = []
for (const a of argv) {
    if (a.startsWith('-')) { if (!KNOWN.includes(a) && !a.startsWith('--otp=')) fail(`Unknown flag: ${a}\nSee the header of scripts/release.cjs for usage.`) }
    else positionals.push(a)
}

const version    = positionals[0]
const dryRun     = has('--dry-run')
const yes        = has('--yes')
const skipNpm    = has('--skip-npm')
const skipGithub = has('--skip-github')
const noCommit   = has('--no-commit')
const otp        = val('--otp')

if (!version) fail('Usage: node scripts/release.cjs <version> [--dry-run] [--yes] [--skip-npm] [--skip-github]')
if (!SEMVER.test(version)) fail(`"${version}" is not a valid semver version (expected x.y.z).`)

async function main() {
    console.log(bold(`\n${dryRun ? '🧪 DRY-RUN  ' : '🚀 '}Releasing Silkweaver v${version}${dryRun ? '  (no changes will be made)' : ''}`))

    // ── 1. preflight ────────────────────────────────────────────────────────────────────────────
    step('Preflight')
    const branch = currentBranch()
    if (!branch) fail('Not in a git repository.')
    info(`branch: ${branch}`)
    if (branch !== 'main') {
        if (has('--allow-branch')) warn(`not on main (on "${branch}") — proceeding because --allow-branch`)
        else fail(`Not on main (on "${branch}"). Switch to main, or pass --allow-branch to release from here.`)
    }
    if (!gitClean() && !dryRun)
        warn('working tree is dirty — those changes will be folded into the version-bump commit. Ctrl-C now if that is not what you want.')
    // Fail fast on a missing npm login *before* we bump/commit anything (a dry-run doesn't need auth).
    if (!skipNpm) {
        const who = npmWhoami()
        if (who) ok(`npm user: ${who}`)
        else if (dryRun) warn('not logged in to npm — ok for a dry-run; you will need `npm login` for the real release.')
        else fail('Not logged in to npm. Run `npm login` first (browser auth), then retry — or pass --skip-npm.')
    }

    // ── 2. version bump ─────────────────────────────────────────────────────────────────────────
    step(`Set version → ${version}`)
    run(`node scripts/set-version.cjs ${version}`, { dryRun })

    // ── 3. verify (typecheck + build the dist that npm will publish) ──────────────────────────────
    step('Verify (typecheck + build toolchain)')
    run('npx tsc -b', { dryRun })
    run('npm run build:tooling', { dryRun })

    // ── 4. commit the bump ────────────────────────────────────────────────────────────────────────
    if (noCommit) {
        info('skipping commit (--no-commit)')
    } else {
        step(`Commit "v${version}"`)
        if (!dryRun && gitClean()) {
            info('nothing to commit (version already set & committed)')
        } else {
            run('git add -A', { dryRun })
            // tolerate "nothing to commit" so re-runs don't hard-fail
            run(`git commit -m "v${version}"`, { dryRun, optional: true })
        }
    }

    // ── 5. npm ────────────────────────────────────────────────────────────────────────────────────
    // Pass `version` explicitly so a dry-run (where step 1 was skipped) still previews the target.
    if (skipNpm) info('skipping npm publish (--skip-npm)')
    else await publishNpm({ version, dryRun, yes, build: false, otp })   // build:false — step 3 already built dist

    // ── 6. github (tag + push → installer CI) ─────────────────────────────────────────────────────
    if (skipGithub) info('skipping GitHub tag/push (--skip-github)')
    else await pushReleaseTag({ version, dryRun, yes })

    // ── done ─────────────────────────────────────────────────────────────────────────────────────
    console.log(green(bold(`\n✓ ${dryRun ? 'Dry-run complete' : `Released v${version}`}.`)))
    if (!dryRun && !skipGithub) info('Watch the installer build in Actions, then Publish the draft Release.')
    if (dryRun) info('Re-run without --dry-run to actually release.')
}

main().catch(e => fail(e && e.stack ? e.stack : String(e)))
