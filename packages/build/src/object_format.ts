/**
 * Read/write layer for class-per-object files (`objects/<name>.ts`).
 *
 * The object editor's GUI is driven by this: `parse_object` extracts an object's
 * metadata / variables / events from its class, and the `set_*` / `add_*` /
 * `remove_*` helpers patch the source *surgically* (preserving the user's code and
 * formatting) when the GUI changes something. Uses the real TypeScript compiler API
 * for parsing, then string-splices at AST positions so unrelated code is untouched.
 *
 * Pure Node (typescript only) — unit-testable and reusable outside the IPC layer.
 */

import * as ts from 'typescript'

/** Known static-metadata field names an object class may declare. */
export type meta_field = 'sprite' | 'solid' | 'visible' | 'persistent' | 'depth' | 'parent'

/** Canonical GMS-style order of `on_*` event methods (used to keep events ordered in code). */
export const EVENT_ORDER: string[] = [
    'on_create', 'on_destroy',
    'on_step_begin', 'on_step', 'on_step_end',
    'on_draw_begin', 'on_draw', 'on_draw_end', 'on_draw_gui',
    'on_alarm',
    'on_key_press', 'on_key_release', 'on_key_held',
    'on_mouse_left_press', 'on_mouse_left_release', 'on_mouse_right_press',
    'on_collision',
    'on_room_start', 'on_room_end', 'on_game_start', 'on_game_end',
    'on_animation_end', 'on_path_end', 'on_outside_room', 'on_intersect_boundary',
    'on_no_more_lives', 'on_no_more_health', 'on_user',
]

export interface object_model {
    class_name: string
    sprite:     string | null    // static sprite = '…'  (resource name) or null
    parent:     string | null    // static parent = obj_x (class name) or null
    solid:      boolean
    visible:    boolean
    persistent: boolean
    depth:      number
    variables:  { name: string; value: string }[]   // instance fields (name + default expression text)
    events:     string[]                              // on_* method names present
}

// =========================================================================
// Parsing
// =========================================================================

function _source(src: string): ts.SourceFile {
    return ts.createSourceFile('object.ts', src, ts.ScriptTarget.Latest, /*setParentNodes*/ true)
}

function _find_class(sf: ts.SourceFile): ts.ClassDeclaration | undefined {
    return sf.statements.find(ts.isClassDeclaration) as ts.ClassDeclaration | undefined
}

function _is_static(m: ts.ClassElement): boolean {
    return !!ts.canHaveModifiers(m) && (ts.getModifiers(m) ?? []).some(mod => mod.kind === ts.SyntaxKind.StaticKeyword)
}

function _name_of(m: ts.ClassElement): string | null {
    return m.name && ts.isIdentifier(m.name) ? m.name.text : null
}

/** Extracts the object model from a class-file source. */
export function parse_object(src: string): object_model {
    const sf  = _source(src)
    const cls = _find_class(sf)

    const model: object_model = {
        class_name: cls?.name?.text ?? '',
        sprite: null, parent: null,
        solid: false, visible: true, persistent: false, depth: 0,
        variables: [], events: [],
    }
    if (!cls) return model

    for (const m of cls.members) {
        if (ts.isMethodDeclaration(m)) {
            const n = _name_of(m)
            if (n && n.startsWith('on_')) model.events.push(n)
            continue
        }
        if (ts.isPropertyDeclaration(m)) {
            const n = _name_of(m)
            if (!n) continue
            const init = m.initializer ? m.initializer.getText(sf) : ''
            if (_is_static(m)) {
                switch (n) {
                    case 'sprite':     model.sprite     = _string_literal(m.initializer); break
                    case 'parent':     model.parent     = m.initializer ? init : null;    break
                    case 'solid':      model.solid      = init === 'true';                 break
                    case 'visible':    model.visible    = init !== 'false';                break
                    case 'persistent': model.persistent = init === 'true';                 break
                    case 'depth':      model.depth      = Number(init) || 0;               break
                }
            } else {
                model.variables.push({ name: n, value: init })
            }
        }
    }
    return model
}

function _string_literal(node: ts.Expression | undefined): string | null {
    if (node && ts.isStringLiteral(node)) return node.text
    return null
}

/**
 * Collects every instance member reachable through `this.` in a class: declared instance fields
 * *plus* members created/assigned at runtime inside any event (e.g. `this.velocity = 0` in on_create,
 * read in on_step). This drives `this.` autocomplete, so a variable made in one event surfaces in all
 * the others — matching the usual split of constants on the object, runtime state in Create. Static
 * fields and method/event names are excluded (engine members are merged in separately).
 */
export function this_members(src: string): string[] {
    const sf = _source(src); const cls = _find_class(sf)
    if (!cls) return []
    const names = new Set<string>()
    for (const m of cls.members) {
        if (ts.isPropertyDeclaration(m) && !_is_static(m)) { const n = _name_of(m); if (n) names.add(n) }
    }
    // Any `this.<name> = …` (or compound assignment) anywhere in the class body — including nested
    // blocks/closures — counts as an instance member the user can reference elsewhere.
    const visit = (node: ts.Node): void => {
        if (ts.isBinaryExpression(node)
            && node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment
            && node.operatorToken.kind <= ts.SyntaxKind.LastAssignment
            && ts.isPropertyAccessExpression(node.left)
            && node.left.expression.kind === ts.SyntaxKind.ThisKeyword
            && ts.isIdentifier(node.left.name)) {
            names.add(node.left.name.text)
        }
        ts.forEachChild(node, visit)
    }
    visit(cls)
    return [...names]
}

// =========================================================================
// Patching (surgical string edits at AST positions)
// =========================================================================

interface edit { start: number; end: number; text: string }

function _apply(src: string, e: edit): string {
    return src.slice(0, e.start) + e.text + src.slice(e.end)
}

/** Inserts a member declaration on its own line just before the class's closing brace. */
function _insert_member(src: string, text: string): string {
    const sf = _source(src); const cls = _find_class(sf)
    if (!cls) return src
    const pos    = cls.end - 1   // the `}` of the class body
    const prefix = pos > 0 && src[pos - 1] !== '\n' ? '\n' : ''   // guard against mashing onto the prior line
    return _apply(src, { start: pos, end: pos, text: prefix + text })
}

/** Inserts `text` (a full member incl. trailing newline) on its own line before the member at `pos`. */
function _insert_before(src: string, pos: number, text: string): string {
    const line_start = src.lastIndexOf('\n', pos - 1) + 1
    return src.slice(0, line_start) + text + src.slice(line_start)
}

/** Inserts `text` (a full member incl. trailing newline) on its own line after the member ending at `end`. */
function _insert_after(src: string, end: number, text: string): string {
    let i = end
    while (i < src.length && src[i] !== '\n') i++   // to the end of the member's own line
    if (i < src.length && src[i] === '\n') i++       // past the line terminator
    return src.slice(0, i) + text + src.slice(i)
}

function _find_member(
    cls: ts.ClassDeclaration,
    pred: (m: ts.ClassElement) => boolean,
): ts.ClassElement | undefined {
    return cls.members.find(pred)
}

/**
 * Sets (adds or updates) a static metadata field. `expr` is the raw initializer
 * text (e.g. `'spr_player'`, `true`, `-5`, `obj_base`).
 */
export function set_static(src: string, name: meta_field, expr: string): string {
    const sf = _source(src); const cls = _find_class(sf)
    if (!cls) return src
    const existing = _find_member(cls, m => ts.isPropertyDeclaration(m) && _is_static(m) && _name_of(m) === name) as ts.PropertyDeclaration | undefined
    if (existing?.initializer) {
        return _apply(src, { start: existing.initializer.getStart(sf), end: existing.initializer.getEnd(), text: expr })
    }
    if (existing) {
        // declared without initializer — replace the whole member
        return _apply(src, { start: existing.getStart(sf), end: existing.getEnd(), text: `static ${name} = ${expr}` })
    }
    return _insert_member(src, `    static ${name} = ${expr}\n`)
}

/** Removes a static metadata field if present (e.g. clearing the sprite). */
export function remove_static(src: string, name: meta_field): string {
    return _remove_member(src, m => ts.isPropertyDeclaration(m) && _is_static(m) && _name_of(m) === name)
}

/** Sets (adds or updates) an instance variable field. */
export function set_field(src: string, name: string, expr: string): string {
    const sf = _source(src); const cls = _find_class(sf)
    if (!cls) return src
    const existing = _find_member(cls, m => ts.isPropertyDeclaration(m) && !_is_static(m) && _name_of(m) === name) as ts.PropertyDeclaration | undefined
    if (existing?.initializer) {
        return _apply(src, { start: existing.initializer.getStart(sf), end: existing.initializer.getEnd(), text: expr })
    }
    if (existing) {
        return _apply(src, { start: existing.getStart(sf), end: existing.getEnd(), text: `${name} = ${expr}` })
    }
    // New variable: keep all instance variables grouped at the TOP of the class, in add-order, so
    // every event below can reference them — and a later variable's initializer can safely read an
    // earlier one. Insert after the last existing variable; if none, before the first member.
    const stub = `    ${name} = ${expr}\n`
    const vars = cls.members.filter(m => ts.isPropertyDeclaration(m) && !_is_static(m))
    if (vars.length) return _insert_after(src, vars[vars.length - 1]!.getEnd(), stub)
    if (cls.members.length) return _insert_before(src, cls.members[0]!.getStart(sf), stub)
    return _insert_member(src, stub)
}

/** Removes an instance variable field. */
export function remove_field(src: string, name: string): string {
    return _remove_member(src, m => ts.isPropertyDeclaration(m) && !_is_static(m) && _name_of(m) === name)
}

/**
 * Adds an `on_*` event method stub if it is not already present, inserted in canonical event
 * order (before the first existing event method that comes later in EVENT_ORDER).
 */
export function add_method(src: string, method: string, params = '', body = ''): string {
    const sf = _source(src); const cls = _find_class(sf)
    if (!cls) return src
    if (_find_member(cls, m => ts.isMethodDeclaration(m) && _name_of(m) === method)) return src
    const stub = `    ${method}(${params}): void {\n${body ? '        ' + body + '\n' : ''}    }\n`

    const order = EVENT_ORDER.indexOf(method)
    if (order >= 0) {
        const after = cls.members.find(m => {
            if (!ts.isMethodDeclaration(m)) return false
            const n = _name_of(m)
            return !!n && EVENT_ORDER.indexOf(n) > order
        })
        if (after) return _insert_before(src, after.getStart(sf), stub)
    }
    return _insert_member(src, stub)
}

/** Removes an event method by name. */
export function remove_method(src: string, method: string): string {
    return _remove_member(src, m => ts.isMethodDeclaration(m) && _name_of(m) === method)
}

function _remove_member(src: string, pred: (m: ts.ClassElement) => boolean): string {
    const sf = _source(src); const cls = _find_class(sf)
    if (!cls) return src
    const m = _find_member(cls, pred)
    if (!m) return src
    // Remove the member's own line: back up over its leading indentation (but NOT the
    // preceding newline — that belongs to the previous member), and consume the trailing newline.
    let start = m.getStart(sf)
    while (start > 0 && (src[start - 1] === ' ' || src[start - 1] === '\t')) start--
    let end = m.getEnd()
    while (end < src.length && (src[end] === ' ' || src[end] === '\t')) end++
    if (src[end] === '\r') end++
    if (src[end] === '\n') end++
    return _apply(src, { start, end, text: '' })
}

// =========================================================================
// Event body extract / pack — per-event "virtual file" editing
// =========================================================================
//
// An event is edited as its OWN buffer: get_event_body returns just the method's body,
// de-indented to column 0, so the editor is a normal standalone file (Ctrl+A, auto-indent,
// autocomplete — no hidden areas, no live brace-matching). set_event_body packs that buffer
// back into the method, re-indented. Both are AST-based, so they're robust to braces/strings.

/** Strips common leading indentation + surrounding blank lines (method body → editable buffer). */
function _dedent(text: string): string {
    const lines = text.replace(/\r\n?/g, '\n').split('\n')
    while (lines.length && lines[0]!.trim() === '') lines.shift()
    while (lines.length && lines[lines.length - 1]!.trim() === '') lines.pop()
    if (lines.length === 0) return ''
    let min = Infinity
    for (const l of lines) {
        if (l.trim() === '') continue
        const w = /^[ \t]*/.exec(l)![0].length
        if (w < min) min = w
    }
    if (!isFinite(min)) min = 0
    return lines.map(l => (l.trim() === '' ? '' : l.slice(min))).join('\n')
}

/** Re-applies an indent prefix to each non-blank line (editable buffer → method body). */
function _indent(text: string, indent: string): string {
    return text.replace(/\r\n?/g, '\n').split('\n').map(l => (l.trim() === '' ? '' : indent + l)).join('\n')
}

/** Returns the leading whitespace of the line containing `pos`. */
function _line_indent(src: string, pos: number): string {
    const line_start = src.lastIndexOf('\n', pos - 1) + 1
    return /^[ \t]*/.exec(src.slice(line_start, pos))?.[0] ?? ''
}

function _find_event_method(cls: ts.ClassDeclaration, method: string): ts.MethodDeclaration | undefined {
    return cls.members.find(m => ts.isMethodDeclaration(m) && _name_of(m) === method) as ts.MethodDeclaration | undefined
}

/**
 * Returns one event method's body as an editable, de-indented buffer, or null if absent/bodyless.
 * @param method - The on_* method to extract (e.g. 'on_step')
 */
export function get_event_body(src: string, method: string): string | null {
    const sf = _source(src); const cls = _find_class(sf)
    if (!cls) return null
    const m = _find_event_method(cls, method)
    if (!m || !m.body) return null
    const inner = src.slice(m.body.getStart(sf) + 1, m.body.getEnd() - 1)   // between the braces
    return _dedent(inner)
}

/**
 * Replaces an event method's body with `body` (an edited, de-indented buffer), re-indenting it to
 * the method's level. Returns the full updated source; a no-op if the method is absent.
 * @param method - The on_* method to update
 * @param body   - The new body (column-0 / de-indented, as edited)
 */
export function set_event_body(src: string, method: string, body: string): string {
    const sf = _source(src); const cls = _find_class(sf)
    if (!cls) return src
    const m = _find_event_method(cls, method)
    if (!m || !m.body) return src
    const open  = m.body.getStart(sf)     // position of '{'
    const close = m.body.getEnd() - 1     // position of '}'
    const method_indent = _line_indent(src, m.getStart(sf))
    const dedented = _dedent(body)
    const inner    = dedented === '' ? '' : _indent(dedented, method_indent + '    ')
    const block    = '{\n' + (inner ? inner + '\n' : '') + method_indent + '}'
    return src.slice(0, open) + block + src.slice(close + 1)
}

// =========================================================================
// Normalize — variables-first + canonical event order + indentation (full class view)
// =========================================================================

/**
 * Re-indents code by bracket/brace/paren depth (leading whitespace only — never touches content or
 * spacing). Strings and comments are skipped. Good for typical game code; deeply nested `({`-style
 * continuations may be off by a level (cosmetic, not corrupting).
 */
function _reindent(code: string, unit = '    '): string {
    const lines = code.replace(/\r\n?/g, '\n').split('\n')
    const out: string[] = []
    let depth = 0
    let in_block = false   // inside a /* … */ comment spanning lines
    for (const raw of lines) {
        const line = raw.trim()
        if (line === '') { out.push(''); continue }
        let delta = 0, first_is_closer = false, started = false
        let i = 0
        let line_block: boolean = in_block
        while (i < line.length) {
            if (line_block) { if (line[i] === '*' && line[i + 1] === '/') { line_block = false; i += 2; continue } i++; continue }
            const c = line[i], n = line[i + 1]
            if (c === '/' && n === '/') break
            if (c === '/' && n === '*') { line_block = true; i += 2; continue }
            if (c === '"' || c === "'" || c === '`') { const q = c; i++; while (i < line.length && line[i] !== q) { if (line[i] === '\\') i++; i++ } i++; continue }
            const opener = c === '{' || c === '(' || c === '['
            const closer = c === '}' || c === ')' || c === ']'
            if (opener) delta++
            else if (closer) delta--
            if (!started && (opener || closer || /\S/.test(c!))) { started = true; if (closer) first_is_closer = true }
            i++
        }
        in_block = line_block
        const this_depth = Math.max(0, depth - (first_is_closer ? 1 : 0))
        out.push(unit.repeat(this_depth) + line)
        depth = Math.max(0, depth + delta)
    }
    return out.join('\n')
}

/**
 * Reorders all class members into canonical groups, preserving each member's attached comments:
 *   1. instance variables — in their existing relative order (field-init order can matter; one
 *      field's initializer may read another), so they're grouped but never shuffled among themselves;
 *   2. `on_*` event methods — in canonical EVENT_ORDER;
 *   3. everything else (statics, helper methods) — in place.
 * Variables-before-events is the whole point: every event can reference every variable. A no-op if
 * the order is already canonical.
 */
function _reorder_members(src: string): string {
    const sf = _source(src); const cls = _find_class(sf)
    if (!cls || cls.members.length <= 1) return src
    const members = cls.members
    const event_idx = (m: ts.ClassElement): number => {
        const n = _name_of(m)
        return n && ts.isMethodDeclaration(m) ? EVENT_ORDER.indexOf(n) : -1
    }
    const is_var = (m: ts.ClassElement): boolean => ts.isPropertyDeclaration(m) && !_is_static(m)

    const vars    = members.filter(is_var)
    const events  = members.filter(m => event_idx(m) >= 0).sort((a, b) => event_idx(a) - event_idx(b))
    const others  = members.filter(m => !is_var(m) && event_idx(m) < 0)
    const ordered = [...vars, ...events, ...others]
    if (ordered.every((m, i) => m === members[i])) return src   // already canonical

    // Rebuild the class body from each member's full text (getFullStart → getEnd includes the leading
    // trivia — newlines/indent/comments — so comments travel with their member). The class header up
    // to `{` and the closing `}` + trailing trivia are preserved verbatim.
    const chunk  = (m: ts.ClassElement): string => src.slice(m.getFullStart(), m.getEnd())
    const prefix = src.slice(0, members[0]!.getFullStart())
    const suffix = src.slice(members[members.length - 1]!.getEnd())
    return prefix + ordered.map(chunk).join('') + suffix
}

/**
 * Normalizes a class-per-object file for display in the full code view: variables hoisted above all
 * events, canonical event order, then consistent indentation. Unchanged if there's no class.
 */
export function normalize_object(src: string): string {
    return _reindent(_reorder_members(src))
}

// =========================================================================
// Scaffolding
// =========================================================================

/** Generates a minimal class-file source for a new object. Imports are auto-managed (none needed). */
export function scaffold_object(class_name: string): string {
    return `export class ${class_name} extends gm_object {
    on_create(): void {

    }
}
`
}
