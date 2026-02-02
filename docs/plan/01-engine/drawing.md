# Drawing & Graphics

## File Structure
```
packages/engine/src/drawing/
├── renderer.ts        # WebGL 2 renderer
├── sprite.ts          # Sprite management
├── surface.ts         # Render targets
├── shader.ts          # Shader system
├── draw-functions.ts  # All draw_* functions
├── blend-modes.ts     # WebGL blend modes
├── font.ts            # Web font rendering
├── texture-manager.ts # Texture atlas
├── batch-renderer.ts  # Sprite batching
└── view.ts            # Views and cameras
```

## Sprite Functions

| Function | Description |
|----------|-------------|
| `draw_sprite(sprite, subimg, x, y)` | Draw sprite |
| `draw_sprite_ext(sprite, subimg, x, y, xscale, yscale, rot, color, alpha)` | Draw with transforms |
| `draw_sprite_part(sprite, subimg, left, top, width, height, x, y)` | Draw sprite region |
| `draw_sprite_stretched(sprite, subimg, x, y, w, h)` | Stretched draw |
| `draw_sprite_tiled(sprite, subimg, x, y)` | Tiled draw |
| `sprite_get_width(sprite)` | Get sprite width |
| `sprite_get_height(sprite)` | Get sprite height |
| `sprite_get_xoffset(sprite)` | Get X origin |
| `sprite_get_yoffset(sprite)` | Get Y origin |
| `sprite_get_number(sprite)` | Get frame count |

## Shape Drawing

| Function | Description |
|----------|-------------|
| `draw_point(x, y)` | Draw single pixel |
| `draw_line(x1, y1, x2, y2)` | Draw line |
| `draw_line_width(x1, y1, x2, y2, w)` | Line with width |
| `draw_rectangle(x1, y1, x2, y2, outline)` | Draw rectangle |
| `draw_roundrect(x1, y1, x2, y2, outline)` | Rounded rectangle |
| `draw_triangle(x1, y1, x2, y2, x3, y3, outline)` | Draw triangle |
| `draw_circle(x, y, r, outline)` | Draw circle |
| `draw_ellipse(x1, y1, x2, y2, outline)` | Draw ellipse |
| `draw_arrow(x1, y1, x2, y2, size)` | Draw arrow |
| `draw_path(path, x, y, absolute)` | Draw path |

## Color & Alpha

| Function | Description |
|----------|-------------|
| `draw_set_color(col)` | Set draw color |
| `draw_set_alpha(alpha)` | Set draw alpha |
| `draw_get_color()` | Get current color |
| `draw_get_alpha()` | Get current alpha |
| `draw_clear(col)` | Clear with color |
| `make_color_rgb(r, g, b)` | Create color |
| `make_color_hsv(h, s, v)` | Create HSV color |
| `color_get_red(col)` | Get red component |
| `color_get_green(col)` | Get green |
| `color_get_blue(col)` | Get blue |
| `merge_color(col1, col2, amount)` | Blend colors |

## Color Constants

```typescript
const c_aqua = 0xFFFF00;
const c_black = 0x000000;
const c_blue = 0xFF0000;
const c_dkgray = 0x404040;
const c_fuchsia = 0xFF00FF;
const c_gray = 0x808080;
const c_green = 0x008000;
const c_lime = 0x00FF00;
const c_ltgray = 0xC0C0C0;
const c_maroon = 0x000080;
const c_navy = 0x800000;
const c_olive = 0x008080;
const c_orange = 0x0080FF;
const c_purple = 0x800080;
const c_red = 0x0000FF;
const c_silver = 0xC0C0C0;
const c_teal = 0x808000;
const c_white = 0xFFFFFF;
const c_yellow = 0x00FFFF;
```

## Text Drawing

| Function | Description |
|----------|-------------|
| `draw_text(x, y, string)` | Draw text |
| `draw_text_ext(x, y, string, sep, w)` | Draw with wrapping |
| `draw_text_color(x, y, string, c1, c2, c3, c4, alpha)` | Gradient text |
| `draw_text_transformed(x, y, string, xscale, yscale, angle)` | Transformed text |
| `draw_set_font(font)` | Set font |
| `draw_set_halign(halign)` | Set horizontal align |
| `draw_set_valign(valign)` | Set vertical align |
| `string_width(string)` | Get string width |
| `string_height(string)` | Get string height |

## Font Alignment Constants

```typescript
const fa_left = 0;
const fa_center = 1;
const fa_right = 2;
const fa_top = 0;
const fa_middle = 1;
const fa_bottom = 2;
```

## Surface Functions

| Function | Description |
|----------|-------------|
| `surface_create(w, h)` | Create surface |
| `surface_free(surf)` | Free surface |
| `surface_exists(surf)` | Check if exists |
| `surface_set_target(surf)` | Set render target |
| `surface_reset_target()` | Reset to screen |
| `surface_get_width(surf)` | Get width |
| `surface_get_height(surf)` | Get height |
| `draw_surface(surf, x, y)` | Draw surface |
| `draw_surface_ext(...)` | Draw with transforms |

## Shader Functions

| Function | Description |
|----------|-------------|
| `shader_set(shader)` | Set active shader |
| `shader_reset()` | Reset to default |
| `shader_is_compiled(shader)` | Check if compiled |
| `shader_get_uniform(shader, name)` | Get uniform location |
| `shader_set_uniform_f(uniform, ...)` | Set float uniform |
| `shader_set_uniform_i(uniform, ...)` | Set int uniform |

## View Functions (Unlimited)

| Function | Description |
|----------|-------------|
| `view_create()` | Create new view |
| `view_destroy(view)` | Destroy view |
| `camera_create()` | Create camera |
| `camera_destroy(camera)` | Destroy camera |
| `camera_set_view_pos(cam, x, y)` | Set camera position |
| `camera_set_view_size(cam, w, h)` | Set camera size |
| `camera_get_view_x(cam)` | Get camera X |
| `camera_get_view_y(cam)` | Get camera Y |

## Blend Mode Constants

```typescript
const bm_normal = 0;
const bm_add = 1;
const bm_max = 2;
const bm_subtract = 3;
```
