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
    home:       _svg('<path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/>'),
    import:     _svg('<path d="M12 4v9"/><path d="M8 11l4 4 4-4"/><path d="M5 19h14"/>'),
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
    refresh:    _svg('<path d="M4 12a8 8 0 0 1 13.7-5.7L20 8"/><path d="M20 4v4h-4"/><path d="M20 12a8 8 0 0 1-13.7 5.7L4 16"/><path d="M4 20v-4h4"/>'),
    build:      _svg('<path d="M13 4l7 7-2.5 2.5-7-7z"/><path d="M11.5 5.5l-8 8 3 3 8-8"/>'),
    settings:   _svg('<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>'),
    delete:     _svg('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
    project:    _svg('<rect x="2.5" y="8" width="19" height="9" rx="4.5"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="16.5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="18.5" cy="14.5" r="1" fill="currentColor" stroke="none"/>'),
    help:       _svg('<path d="M4 4h7a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H4z"/><path d="M20 4h-7a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H20z"/>'),
    pause:      _svg('<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>', true),
    close:      _svg('<path d="M6 6l12 12M18 6L6 18"/>'),
    win_min:     _svg('<path d="M5 12h14"/>'),
    win_max:     _svg('<rect x="5" y="5" width="14" height="14"/>'),
    win_restore: _svg('<rect x="6" y="9" width="10" height="10"/><path d="M9 9V6h10v10h-3"/>'),

    // ── Pixel-editor tools + toolbar (inline SVG so they render identically everywhere) ──
    pencil:       _svg('<path d="M4 20l1-4L15 6l3 3L8 19z"/><path d="M13 8l3 3"/>'),
    eraser:       _svg('<path d="M8 18l-4-4 8-8 4 4-8 8z"/><path d="M11 21h9"/><path d="M9 11l4 4"/>'),
    fill:         _svg('<path d="M8 4l8 8-7 7-7-7 6-6z"/><path d="M16 12l3 4a1.7 1.7 0 1 1-3 0z"/>'),
    eyedropper:   _svg('<path d="M19 3a2.1 2.1 0 0 1 2 2c0 .6-.2 1.1-.6 1.5l-2.4 2.4 1 1-2 2-1-1-7 7-3 1 1-3 7-7-1-1 2-2 1 1 2.4-2.4c.4-.4 1-.6 1.6-.6z"/>'),
    line:         _svg('<path d="M5 19L19 5"/><circle cx="5" cy="19" r="1.6" fill="currentColor" stroke="none"/><circle cx="19" cy="5" r="1.6" fill="currentColor" stroke="none"/>'),
    rect:         _svg('<rect x="4" y="6" width="16" height="12" rx="1"/>'),
    rect_fill:    _svg('<rect x="4" y="6" width="16" height="12" rx="1"/>', true),
    ellipse:      _svg('<ellipse cx="12" cy="12" rx="8" ry="6"/>'),
    ellipse_fill: _svg('<ellipse cx="12" cy="12" rx="8" ry="6"/>', true),
    undo:         _svg('<path d="M9 8L4 12l5 4"/><path d="M4 12h9a5 5 0 0 1 0 10h-2"/>'),
    redo:         _svg('<path d="M15 8l5 4-5 4"/><path d="M20 12h-9a5 5 0 0 0 0 10h2"/>'),
    zoom_in:      _svg('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.5-4.5"/><path d="M11 8.5v5M8.5 11h5"/>'),
    zoom_out:     _svg('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.5-4.5"/><path d="M8.5 11h5"/>'),
    skip_prev:    _svg('<path d="M17 6v12l-9-6z"/><rect x="5" y="6" width="2" height="12" rx="1"/>', true),
    skip_next:    _svg('<path d="M7 6v12l9-6z"/><rect x="17" y="6" width="2" height="12" rx="1"/>', true),
    folder:       _svg('<path d="M3 6h6l2 2h10v10H3z"/>'),
    folder_add:   _svg('<path d="M3 6h6l2 2h10v10H3z"/><path d="M12 12v4M10 14h4"/>'),
} as const
