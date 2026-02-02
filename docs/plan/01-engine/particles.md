# Particle System

## File Structure
```
packages/engine/src/particle/
├── particle-type.ts    # Particle type definitions
├── particle-emitter.ts # Emitter management
└── particle-system.ts  # System coordination
```

## Particle System Functions

| Function | Description |
|----------|-------------|
| `part_system_create()` | Create particle system |
| `part_system_destroy(ps)` | Destroy system |
| `part_system_exists(ps)` | Check exists |
| `part_system_clear(ps)` | Clear all particles |
| `part_system_draw_order(ps, oldtonew)` | Set draw order |
| `part_system_depth(ps, depth)` | Set depth |
| `part_system_position(ps, x, y)` | Set position |
| `part_system_automatic_update(ps, automatic)` | Auto update |
| `part_system_automatic_draw(ps, automatic)` | Auto draw |
| `part_system_update(ps)` | Manual update |
| `part_system_drawit(ps)` | Manual draw |

## Particle Type Functions

| Function | Description |
|----------|-------------|
| `part_type_create()` | Create type |
| `part_type_destroy(pt)` | Destroy type |
| `part_type_exists(pt)` | Check exists |
| `part_type_clear(pt)` | Clear type |
| `part_type_shape(pt, shape)` | Set shape |
| `part_type_sprite(pt, sprite, animate, stretch, random)` | Set sprite |
| `part_type_size(pt, size_min, size_max, size_incr, size_wiggle)` | Set size |
| `part_type_scale(pt, xscale, yscale)` | Set scale |
| `part_type_speed(pt, speed_min, speed_max, speed_incr, speed_wiggle)` | Set speed |
| `part_type_direction(pt, dir_min, dir_max, dir_incr, dir_wiggle)` | Set direction |
| `part_type_gravity(pt, grav_amount, grav_dir)` | Set gravity |
| `part_type_orientation(pt, ang_min, ang_max, ang_incr, ang_wiggle, ang_relative)` | Set rotation |
| `part_type_color1(pt, color1)` | Single color |
| `part_type_color2(pt, color1, color2)` | Two colors |
| `part_type_color3(pt, color1, color2, color3)` | Three colors |
| `part_type_color_mix(pt, color1, color2)` | Mix colors |
| `part_type_color_rgb(pt, rmin, rmax, gmin, gmax, bmin, bmax)` | RGB range |
| `part_type_color_hsv(pt, hmin, hmax, smin, smax, vmin, vmax)` | HSV range |
| `part_type_alpha1(pt, alpha1)` | Single alpha |
| `part_type_alpha2(pt, alpha1, alpha2)` | Two alphas |
| `part_type_alpha3(pt, alpha1, alpha2, alpha3)` | Three alphas |
| `part_type_blend(pt, additive)` | Blend mode |
| `part_type_life(pt, life_min, life_max)` | Set lifetime |
| `part_type_step(pt, step_number, step_type)` | Step spawn |
| `part_type_death(pt, death_number, death_type)` | Death spawn |

## Particle Shape Constants

```typescript
const pt_shape_pixel = 0;
const pt_shape_disk = 1;
const pt_shape_square = 2;
const pt_shape_line = 3;
const pt_shape_star = 4;
const pt_shape_circle = 5;
const pt_shape_ring = 6;
const pt_shape_sphere = 7;
const pt_shape_flare = 8;
const pt_shape_spark = 9;
const pt_shape_explosion = 10;
const pt_shape_cloud = 11;
const pt_shape_smoke = 12;
const pt_shape_snow = 13;
```

## Emitter Functions

| Function | Description |
|----------|-------------|
| `part_emitter_create(ps)` | Create emitter |
| `part_emitter_destroy(ps, em)` | Destroy emitter |
| `part_emitter_destroy_all(ps)` | Destroy all |
| `part_emitter_exists(ps, em)` | Check exists |
| `part_emitter_clear(ps, em)` | Clear emitter |
| `part_emitter_region(ps, em, xmin, xmax, ymin, ymax, shape, distribution)` | Set region |
| `part_emitter_burst(ps, em, parttype, number)` | Burst spawn |
| `part_emitter_stream(ps, em, parttype, number)` | Stream spawn |

## Emitter Distribution Constants

```typescript
const ps_distr_linear = 0;
const ps_distr_gaussian = 1;
const ps_distr_invgaussian = 2;

const ps_shape_rectangle = 0;
const ps_shape_ellipse = 1;
const ps_shape_diamond = 2;
const ps_shape_line = 3;
```

## Particle Count Functions

| Function | Description |
|----------|-------------|
| `part_particles_create(ps, x, y, parttype, number)` | Create at point |
| `part_particles_create_color(ps, x, y, parttype, color, number)` | Create with color |
| `part_particles_clear(ps)` | Clear particles |
| `part_particles_count(ps)` | Count particles |
