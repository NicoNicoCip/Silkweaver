# Physics System

## File Structure
```
packages/engine/src/physics/
├── physics-world.ts   # Matter.js world wrapper
├── physics-body.ts    # Physics body
├── physics-fixture.ts # Fixture handling
├── physics-joint.ts   # Joints
└── physics-events.ts  # Physics collision events
```

## Library: matter.js

> **Note**: Uses matter.js which has different behavior than GMS Box2D. Function names match GMS, but underlying physics behavior is matter.js native.

## World Functions

| Function | Description |
|----------|-------------|
| `physics_world_create(pixelToMeter)` | Create world |
| `physics_world_gravity(gx, gy)` | Set gravity |
| `physics_world_update_iterations(iterations)` | Set iterations |
| `physics_world_update_speed(speed)` | Set speed |
| `physics_pause_enable(pause)` | Pause physics |
| `physics_world_draw_debug()` | Draw debug |

## Fixture Functions

| Function | Description |
|----------|-------------|
| `physics_fixture_create()` | Create fixture |
| `physics_fixture_delete(fixture)` | Delete fixture |
| `physics_fixture_set_box_shape(fix, hw, hh)` | Box shape |
| `physics_fixture_set_circle_shape(fix, r)` | Circle shape |
| `physics_fixture_set_polygon_shape(fix)` | Polygon shape |
| `physics_fixture_set_chain_shape(fix, loop)` | Chain shape |
| `physics_fixture_set_edge_shape(fix)` | Edge shape |
| `physics_fixture_add_point(fix, x, y)` | Add polygon point |
| `physics_fixture_set_density(fix, density)` | Set density |
| `physics_fixture_set_friction(fix, friction)` | Set friction |
| `physics_fixture_set_restitution(fix, restitution)` | Set restitution |
| `physics_fixture_set_linear_damping(fix, damping)` | Linear damping |
| `physics_fixture_set_angular_damping(fix, damping)` | Angular damping |
| `physics_fixture_set_sensor(fix, sensor)` | Set sensor |
| `physics_fixture_set_kinematic(fix, kinematic)` | Set kinematic |
| `physics_fixture_bind(fix, inst)` | Bind to instance |
| `physics_fixture_bind_ext(fix, inst, xo, yo)` | Bind with offset |

## Body Functions

| Function | Description |
|----------|-------------|
| `physics_apply_force(xpos, ypos, xforce, yforce)` | Apply force |
| `physics_apply_impulse(xpos, ypos, ximp, yimp)` | Apply impulse |
| `physics_apply_local_force(xlocal, ylocal, xforce, yforce)` | Local force |
| `physics_apply_local_impulse(xlocal, ylocal, ximp, yimp)` | Local impulse |
| `physics_apply_torque(torque)` | Apply torque |
| `physics_apply_angular_impulse(impulse)` | Angular impulse |
| `physics_get_friction(inst)` | Get friction |
| `physics_get_density(inst)` | Get density |
| `physics_get_restitution(inst)` | Get restitution |
| `physics_set_friction(inst, friction)` | Set friction |
| `physics_set_density(inst, density)` | Set density |
| `physics_set_restitution(inst, restitution)` | Set restitution |
| `physics_mass_properties(inst, mass, cx, cy, inertia)` | Set mass |

## Physics Variables (Instance)

| Variable | Description |
|----------|-------------|
| `phy_active` | Physics enabled |
| `phy_angular_velocity` | Angular velocity |
| `phy_angular_damping` | Angular damping |
| `phy_linear_damping` | Linear damping |
| `phy_linear_velocity_x` | X velocity |
| `phy_linear_velocity_y` | Y velocity |
| `phy_position_x` | Physics X |
| `phy_position_y` | Physics Y |
| `phy_rotation` | Physics rotation |
| `phy_speed_x` | Speed X |
| `phy_speed_y` | Speed Y |
| `phy_com_x` | Center of mass X |
| `phy_com_y` | Center of mass Y |
| `phy_mass` | Mass |
| `phy_inertia` | Inertia |
| `phy_kinematic` | Is kinematic |
| `phy_sleeping` | Is sleeping |
| `phy_fixed_rotation` | Fixed rotation |
| `phy_bullet` | Bullet mode |

## Joint Functions

| Function | Description |
|----------|-------------|
| `physics_joint_revolute_create(...)` | Revolute joint |
| `physics_joint_prismatic_create(...)` | Prismatic joint |
| `physics_joint_distance_create(...)` | Distance joint |
| `physics_joint_pulley_create(...)` | Pulley joint |
| `physics_joint_gear_create(...)` | Gear joint |
| `physics_joint_weld_create(...)` | Weld joint |
| `physics_joint_friction_create(...)` | Friction joint |
| `physics_joint_rope_create(...)` | Rope joint |
| `physics_joint_wheel_create(...)` | Wheel joint |
| `physics_joint_delete(joint)` | Delete joint |
| `physics_joint_enable_motor(joint, enable)` | Enable motor |
| `physics_joint_get_value(joint, field)` | Get joint value |
| `physics_joint_set_value(joint, field, value)` | Set joint value |

## Physics Collision Events

```typescript
// Separate event types for physics collisions
class PhysicsObject extends GMObject {
  // Regular collision
  collision_Wall(other: Wall) {
    // Standard collision response
  }

  // Physics collision (in addition to regular)
  physics_collision_Wall(contact: PhysicsContact) {
    // Physics-specific collision handling
    const normal = contact.normal;
    const impulse = contact.impulse;
  }
}
```
