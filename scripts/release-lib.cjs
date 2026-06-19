'use strict'
/**
 * Shared building blocks for the Silkweaver release scripts.
 *
 * Consumed by:
 *   - publish-npm.cjs     → `publishNpm()`        (push the 4 public packages to the npm registry)
 *   - release-github.cjs  → `pushReleaseTag()`    (tag + push → CI builds installers → draft Release)
 *   - release.cjs         → the factory that bumps the version, commits, then does both of the above
 *
 * Everything here is deliberately dependency-free (Node core only) and honours a `dryRun` flag so a
 * release can be rehearsed end-to-end without publishing, pushing, or committing anything.
 */

const fs       = require('fs')
const path     = require('path')
const readline = require('readline')
const { execSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..')

// ── tiny colour helpers (no-op when output isn't a TTY) ───────────────────────────────────────────
const tty = process.stdout.isTTY
const paint = (code, s) => tty ? `\x1b[${code}m${s}\x1b[0m` : String(s)
const bold = s => paint('1', s), dim = s => paint('2', s)
const green = s => paint('32', s), yellow = s => paint('33', s), red = s => paint('31', s), cyan = s => paint('36', s)

const step = msg => console.log('\n' + bold(cyan('▶ ' + msg)))
const ok   = msg => console.log(green('  ✓ ') + msg)
const info = msg => console.log(dim('  · ') + msg)
const warn = msg => console.warn(yellow('  ⚠ ') + msg)
/** Print an error and exit non-zero. */
const fail = msg => { console.error(red('\n✗ ' + msg)); process.exit(1) }

/** The four packages that ship to npm, in dependency order (a dep is published before its dependents). */
const PUBLIC_PACKAGES = [
    { name: '@silkweaver/project', dir: 'packages/project' },   // types-only, zero deps
    { name: '@silkweaver/engine',  dir: 'packages/engine'  },   // runtime (matter-js)
    { name: '@silkweaver/build',   dir: 'packages/build'   },   // depends on project + engine
    { name: '@silkweaver/cli',     dir: 'packages/cli'     },   // depends on build + project
]

const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/

/** Read the live root version off disk (not require()'d, so it reflects a just-run version bump). */
function readVersion() {
    return JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version
}

/** owner/repo parsed from the root package.json `repository.url`, or null. */
function repoSlug() {
    const url = (JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).repository || {}).url || ''
    const m = url.match(/github\.com[/:]([^/]+\/[^/.]+)/)
    return m ? m[1] : null
}

/**
 * Run a command, streaming its output. Prints the command first. When `dryRun` is set the command is
 * printed but NOT executed (used for the side-effecting steps: publish, tag, push, commit).
 * @returns true when it ran (or would have, in dry-run); exits on failure unless `optional`.
 */
function run(cmd, { dryRun = false, cwd = ROOT, optional = false } = {}) {
    console.log(dim('  $ ' + cmd) + (dryRun ? dim('   (dry-run — skipped)') : ''))
    if (dryRun) return true
    try {
        execSync(cmd, { cwd, stdio: 'inherit' })
        return true
    } catch {
        if (optional) { warn(`command failed (continuing): ${cmd}`); return false }
        fail(`Command failed: ${cmd}`)
    }
}

/** Run a read-only command and capture its trimmed stdout, or null if it errors/times out. */
function capture(cmd, { cwd = ROOT, timeout = 20000 } = {}) {
    try { return execSync(cmd, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout }).trim() }
    catch { return null }
}

// ── git ───────────────────────────────────────────────────────────────────────────────────────────
const gitClean        = () => capture('git status --porcelain') === ''
const currentBranch   = () => capture('git rev-parse --abbrev-ref HEAD')
const hasRemote       = (remote = 'origin') => !!capture(`git remote get-url ${remote}`)
const tagExistsLocal  = tag => capture(`git tag --list ${tag}`) === tag
const tagExistsRemote = (tag, remote = 'origin') => {
    const out = capture(`git ls-remote --tags ${remote} ${tag}`)
    return !!out && out.includes(`refs/tags/${tag}`)
}

// ── npm ───────────────────────────────────────────────────────────────────────────────────────────
const npmWhoami = () => capture('npm whoami')
/** True if exactly `version` of `name` is already on the registry (npm versions are immutable). */
const npmVersionPublished = (name, version) => capture(`npm view ${name}@${version} version`) === version

/** Ask a yes/no question on the terminal. Auto-yes when `yes` is set; defaults to "no". */
function confirm(question, { yes = false } = {}) {
    if (yes) return Promise.resolve(true)
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    return new Promise(res => rl.question(yellow('  ? ' + question) + dim(' [y/N] '),
        a => { rl.close(); res(/^y(es)?$/i.test(a.trim())) }))
}

/**
 * Publish the public packages to npm at whatever version is currently in their package.json.
 * Builds the toolchain first (so each `dist` is fresh) unless `build:false`. Already-published
 * versions are skipped. Honours `dryRun` (runs `npm publish --dry-run` — packs but never uploads).
 * @param opts.dryRun  rehearse only (no upload)
 * @param opts.yes     skip the confirmation prompt
 * @param opts.build   run `npm run build:tooling` first (default true)
 * @param opts.otp     optional 2FA one-time-password passthrough
 * @param opts.tag     optional npm dist-tag (e.g. 'next'); defaults to 'latest'
 */
async function publishNpm({ version = null, dryRun = false, yes = false, build = true, otp = null, tag = null } = {}) {
    version = version || readVersion()   // factory passes the target version so a dry-run previews it faithfully
    step(`Publish to npm — v${version}${dryRun ? dim(' (dry-run)') : ''}`)

    const who = npmWhoami()
    if (!who) {
        if (dryRun) warn('not logged in to npm — fine for a dry-run (publish --dry-run packs locally). You will need `npm login` for the real publish.')
        else fail('Not logged in to npm. Run `npm login` first (browser auth, once per session), then retry.')
    } else ok(`npm user: ${who}`)

    if (!dryRun) {
        const proceed = await confirm(`Publish ${PUBLIC_PACKAGES.length} package(s) at v${version} to npm as "${who}"? This is permanent.`, { yes })
        if (!proceed) fail('Aborted — nothing published.')
    }

    if (build) { step('Build toolchain (engine + build + cli dist)'); run('npm run build:tooling', { dryRun: false }) }
    else info('skipping build (--no-build)')

    const extra = (otp ? ` --otp=${otp}` : '') + (tag ? ` --tag=${tag}` : '')
    const published = [], skipped = []
    // `npm publish --dry-run` packs the *on-disk* package.json. It only previews the target version
    // when the bump has actually been written (standalone publish, or a real release). In a factory
    // dry-run the bump is skipped, so we report intent instead of letting npm reject the stale version.
    const canPack = version === readVersion()

    for (const pkg of PUBLIC_PACKAGES) {
        step(pkg.name + '@' + version)
        if (npmVersionPublished(pkg.name, version)) {
            warn('already on the registry — skipping (npm versions are immutable)')
            skipped.push(pkg.name)
            continue
        }
        if (dryRun && !canPack) {
            info(`would publish (rehearsal skips \`npm publish --dry-run\` — the bump to ${version} isn't written to disk yet)`)
            published.push(pkg.name)
            continue
        }
        // `npm publish --dry-run` runs locally (packs the tarball, lists contents) — a useful rehearsal
        // when on-disk == target. The dry-run lives in the flag; a real run drops it and uploads.
        run(`npm publish${dryRun ? ' --dry-run' : ''}${extra}`, { cwd: path.join(ROOT, pkg.dir) })
        published.push(pkg.name)
    }

    console.log()
    if (published.length) ok(`${dryRun ? 'Would publish' : 'Published'}: ${published.join(', ')}`)
    if (skipped.length)   info(`Skipped (already published): ${skipped.join(', ')}`)
    return { version, published, skipped }
}

/**
 * Tag the current commit `v<version>` and push the branch + tag to the remote, which triggers the
 * `Release installers` workflow (builds win/mac/linux installers → a DRAFT GitHub Release).
 * Requires a clean working tree (the version bump must already be committed). Honours `dryRun`.
 * @param opts.dryRun  print the git commands without running them
 * @param opts.yes     skip the confirmation prompt
 * @param opts.tag     override the tag (default `v<version>`)
 * @param opts.remote  git remote (default 'origin')
 */
async function pushReleaseTag({ version = null, dryRun = false, yes = false, tag = null, remote = 'origin' } = {}) {
    version = version || readVersion()   // factory passes the target version so a dry-run previews it faithfully
    tag = tag || ('v' + version)
    step(`GitHub release — tag ${tag}${dryRun ? dim(' (dry-run)') : ''}`)

    if (!hasRemote(remote)) fail(`No git remote "${remote}". Add one (git remote add ${remote} <url>) before releasing.`)
    const branch = currentBranch()
    info(`remote: ${remote}   branch: ${branch}`)

    if (!gitClean()) {
        // In a real run the factory commits the bump before this step. In a dry-run nothing was
        // committed, so a dirty tree here is expected — warn rather than block the rehearsal.
        if (dryRun) warn('working tree is dirty — in a real release the bump would be committed before this step.')
        else fail('Working tree has uncommitted changes. Commit the version bump first — or use `npm run release:all`, which commits for you.')
    }
    if (tagExistsLocal(tag) || tagExistsRemote(tag, remote))
        fail(`Tag ${tag} already exists. Bump to a new version, or delete the tag (git tag -d ${tag} / git push ${remote} :refs/tags/${tag}) if it was a mistake.`)

    if (!dryRun) {
        const proceed = await confirm(`Tag ${tag} and push "${branch}" + tag to ${remote}? CI will build installers and open a DRAFT Release.`, { yes })
        if (!proceed) fail('Aborted — nothing tagged or pushed.')
    }

    run(`git tag -a ${tag} -m "Silkweaver ${tag}"`, { dryRun })
    run(`git push ${remote} ${branch} --follow-tags`, { dryRun })

    ok(`${dryRun ? 'Would push' : 'Pushed'} ${tag}.`)
    const slug = repoSlug()
    if (slug) {
        console.log()
        info(`CI:       https://github.com/${slug}/actions`)
        info(`Releases: https://github.com/${slug}/releases  (review the DRAFT, then Publish so the in-app updater sees it)`)
    }
    return { version, tag, branch }
}

module.exports = {
    ROOT, SEMVER, PUBLIC_PACKAGES,
    bold, dim, green, yellow, red, cyan,
    step, ok, info, warn, fail,
    readVersion, repoSlug,
    run, capture,
    gitClean, currentBranch, hasRemote, tagExistsLocal, tagExistsRemote,
    npmWhoami, npmVersionPublished, confirm,
    publishNpm, pushReleaseTag,
}
