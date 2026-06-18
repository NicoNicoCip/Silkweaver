/**
 * IDE icons — inline SVG (no font dependency, so they render identically in Electron and any browser,
 * on any OS). Each value is an `<svg>` string sized via CSS (`.sw-tb-btn svg`, `.sw-tree-*-glyph svg`).
 * Stroke/fill use `currentColor`, so they inherit the surrounding text colour.
 */

const _svg = (body: string, filled = false): string =>
    `<svg viewBox="0 0 24 24" ${filled
        ? 'fill="currentColor" stroke="none"'
        : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'}>${body}</svg>`

export const ICON = {
    new_file:   _svg('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/>'),
    open:       _svg('<path d="M3 6h6l2 2h10v10H3z"/>'),
    save:       _svg('<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4"/><rect x="8" y="13" width="8" height="7"/>'),
    sprite:     _svg('<rect x="3" y="4" width="18" height="16" rx="1"/><circle cx="8.5" cy="9" r="1.6"/><path d="M21 16l-5-5-4 4-2-2-4 4"/>'),
    sound:      _svg('<path d="M9 17V4l11-2v13"/><circle cx="6" cy="17" r="2.6"/><circle cx="17" cy="15" r="2.6"/>'),
    background: _svg('<path d="M4 7l8-4 8 4-8 4z"/><path d="M4 12l8 4 8-4"/><path d="M4 17l8 4 8-4"/>'),
    path:       _svg('<path d="M5 18C5 10 8 6 12 6s7 4 7 12"/><circle cx="5" cy="18" r="1.7"/><circle cx="19" cy="18" r="1.7"/>'),
    script:     _svg('<path d="M8 7l-5 5 5 5"/><path d="M16 7l5 5-5 5"/>'),
    font:       _svg('<path d="M5 20L12 4l7 16"/><path d="M8 14h8"/>'),
    timeline:   _svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>'),
    object:     _svg('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>'),
    room:       _svg('<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>'),
    play:       _svg('<path d="M8 5v14l11-7z"/>', true),
    stop:       _svg('<rect x="6" y="6" width="12" height="12" rx="1"/>', true),
    build:      _svg('<path d="M13 4l7 7-2.5 2.5-7-7z"/><path d="M11.5 5.5l-8 8 3 3 8-8"/>'),
    settings:   _svg('<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>'),
    delete:     _svg('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
    project:    _svg('<rect x="2.5" y="8" width="19" height="9" rx="4.5"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="16.5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="18.5" cy="14.5" r="1" fill="currentColor" stroke="none"/>'),
    help:       _svg('<path d="M4 4h7a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H4z"/><path d="M20 4h-7a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H20z"/>'),
} as const
