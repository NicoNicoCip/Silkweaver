/**
 * External-editor preferences. Lets the user point image assets (sprites/backgrounds) at a real
 * pixel-art app (Aseprite/Photoshop/GIMP/…) instead of the built-in editor for heavy work. The
 * "Edit externally" buttons read this; an empty value means "use the OS default app". Persisted in
 * localStorage. The path is a full path to the editor executable.
 */

const LS_IMAGE_EDITOR = 'sw.ext.image_editor'

/** The configured image-editor executable path, or '' to use the OS default app. */
export function ext_image_editor_get(): string {
    return localStorage.getItem(LS_IMAGE_EDITOR) ?? ''
}

/** Sets (or clears, with '') the image-editor executable path. */
export function ext_image_editor_set(value: string): void {
    const v = value.trim()
    if (v) localStorage.setItem(LS_IMAGE_EDITOR, v)
    else   localStorage.removeItem(LS_IMAGE_EDITOR)
}
