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
    return _insert_member(src, `    ${name} = ${expr}\n`)
}

/** Removes an instance variable field. */
export function remove_field(src: string, name: string): string {
    return _remove_member(src, m => ts.isPropertyDeclaration(m) && !_is_static(m) && _name_of(m) === name)
}

/** Adds an `on_*` event method stub if it is not already present. */
export function add_method(src: string, method: string, params = '', body = ''): string {
    const sf = _source(src); const cls = _find_class(sf)
    if (!cls) return src
    if (_find_member(cls, m => ts.isMethodDeclaration(m) && _name_of(m) === method)) return src
    const stub = `    ${method}(${params}): void {\n${body ? '        ' + body + '\n' : ''}    }\n`
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
// Scaffolding
// =========================================================================

/** Generates a minimal class-file source for a new object. */
export function scaffold_object(class_name: string): string {
    return `import { gm_object } from '@silkweaver/engine'

export class ${class_name} extends gm_object {
    on_create(): void {

    }
}
`
}
