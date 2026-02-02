# Input System

## File Structure
```
packages/engine/src/input/
├── keyboard.ts      # Keyboard input
├── mouse.ts         # Mouse input
├── gamepad.ts       # Gamepad API
├── touch.ts         # Touch input
└── input-manager.ts # Unified input handling
```

## Keyboard Functions

| Function | Description |
|----------|-------------|
| `keyboard_check(key)` | Key held |
| `keyboard_check_pressed(key)` | Key just pressed |
| `keyboard_check_released(key)` | Key just released |
| `keyboard_check_direct(key)` | Direct key state |
| `keyboard_clear(key)` | Clear key state |
| `keyboard_key_press(key)` | Simulate press |
| `keyboard_key_release(key)` | Simulate release |
| `keyboard_set_map(key1, key2)` | Remap key |
| `keyboard_get_map(key)` | Get mapped key |
| `keyboard_unset_map()` | Clear mappings |

## Keyboard Variables

| Variable | Description |
|----------|-------------|
| `keyboard_string` | Typed string |
| `keyboard_key` | Last key |
| `keyboard_lastkey` | Previous key |
| `keyboard_lastchar` | Last character |

## Key Constants

```typescript
const vk_nokey = 0;
const vk_anykey = 1;
const vk_left = 37;
const vk_right = 39;
const vk_up = 38;
const vk_down = 40;
const vk_enter = 13;
const vk_escape = 27;
const vk_space = 32;
const vk_shift = 16;
const vk_control = 17;
const vk_alt = 18;
const vk_backspace = 8;
const vk_tab = 9;
const vk_home = 36;
const vk_end = 35;
const vk_delete = 46;
const vk_insert = 45;
const vk_pageup = 33;
const vk_pagedown = 34;
const vk_pause = 19;
const vk_printscreen = 44;
const vk_f1 = 112; // through vk_f12
const vk_numpad0 = 96; // through vk_numpad9
const vk_multiply = 106;
const vk_divide = 111;
const vk_add = 107;
const vk_subtract = 109;
const vk_decimal = 110;
```

## Mouse Functions

| Function | Description |
|----------|-------------|
| `mouse_check_button(button)` | Button held |
| `mouse_check_button_pressed(button)` | Just pressed |
| `mouse_check_button_released(button)` | Just released |
| `mouse_clear(button)` | Clear state |
| `mouse_wheel_up()` | Wheel scrolled up |
| `mouse_wheel_down()` | Wheel scrolled down |
| `window_mouse_get_x()` | Mouse X in window |
| `window_mouse_get_y()` | Mouse Y in window |
| `window_mouse_set(x, y)` | Set mouse position |

## Mouse Variables

| Variable | Description |
|----------|-------------|
| `mouse_x` | X in room |
| `mouse_y` | Y in room |
| `mouse_button` | Currently held button |
| `mouse_lastbutton` | Last clicked button |

## Mouse Button Constants

```typescript
const mb_none = 0;
const mb_left = 1;
const mb_right = 2;
const mb_middle = 3;
const mb_any = 4;
```

## Gamepad Functions

| Function | Description |
|----------|-------------|
| `gamepad_is_supported()` | Check API support |
| `gamepad_is_connected(device)` | Check connected |
| `gamepad_get_device_count()` | Count gamepads |
| `gamepad_get_description(device)` | Get name |
| `gamepad_axis_count(device)` | Count axes |
| `gamepad_axis_value(device, axis)` | Get axis value |
| `gamepad_button_count(device)` | Count buttons |
| `gamepad_button_check(device, button)` | Button held |
| `gamepad_button_check_pressed(device, button)` | Just pressed |
| `gamepad_button_check_released(device, button)` | Just released |
| `gamepad_button_value(device, button)` | Analog value |
| `gamepad_set_vibration(device, left, right)` | Set vibration |

## Gamepad Constants

```typescript
const gp_face1 = 0; // A/Cross
const gp_face2 = 1; // B/Circle
const gp_face3 = 2; // X/Square
const gp_face4 = 3; // Y/Triangle
const gp_shoulderl = 4;
const gp_shoulderr = 5;
const gp_shoulderlb = 6;
const gp_shoulderrb = 7;
const gp_select = 8;
const gp_start = 9;
const gp_stickl = 10;
const gp_stickr = 11;
const gp_padu = 12;
const gp_padd = 13;
const gp_padl = 14;
const gp_padr = 15;
const gp_axislh = 0;
const gp_axislv = 1;
const gp_axisrh = 2;
const gp_axisrv = 3;
```

## Touch Functions

| Function | Description |
|----------|-------------|
| `device_mouse_check_button(device, button)` | Touch held |
| `device_mouse_check_button_pressed(device, button)` | Touch started |
| `device_mouse_check_button_released(device, button)` | Touch ended |
| `device_mouse_x(device)` | Touch X |
| `device_mouse_y(device)` | Touch Y |
| `device_mouse_raw_x(device)` | Raw X |
| `device_mouse_raw_y(device)` | Raw Y |
| `device_mouse_x_to_gui(device)` | X in GUI |
| `device_mouse_y_to_gui(device)` | Y in GUI |
| `device_is_keypad_open()` | Virtual keyboard open |
