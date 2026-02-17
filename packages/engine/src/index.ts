/**
 * Silkweaver Engine — public API entry point.
 *
 * Import individual namespaces or use named imports.
 * The engine is initialized by calling renderer.init() before game_loop.start().
 */

// =========================================================================
// Core
// =========================================================================
export { game_loop } from './core/game_loop.js'
export { instance, with_object } from './core/instance.js'
export { room } from './core/room.js'
export { resource } from './core/resource.js'
export { EVENT_TYPE, game_event } from './core/game_event.js'
export { gm_object, object_exists, object_get_name, object_get_sprite, object_get_parent, object_is_ancestor } from './core/gm_object.js'

// Paths
export {
    path_kind_linear, path_kind_smooth,
    path_create, path_delete, path_exists,
    path_add_point, path_clear_points, path_get_number,
    path_get_x, path_get_y, path_get_speed, path_get_length,
    path_get_point_x, path_get_point_y, path_get_point_speed,
    path_set_closed, path_set_kind, path_set_precision,
    path_flip, path_mirror, path_reverse,
} from './core/path.js'

// Timelines
export {
    timeline_create, timeline_delete, timeline_exists,
    timeline_moment_add, timeline_moment_clear, timeline_get_moment_count,
    timeline_set_speed, timeline_set_loop,
    timeline_play, timeline_pause, timeline_stop,
    timeline_set_position, timeline_get_position,
    timeline_step, timeline_step_all,
} from './core/timeline.js'

// =========================================================================
// Collision
// =========================================================================
export { MASK_RECT, MASK_CIRCLE, MASK_ELLIPSE, get_bbox, update_bbox, instances_collide, point_in_instance, rect_in_instance, circle_in_instance } from './collision/collision.js'

// =========================================================================
// Drawing
// =========================================================================
export { renderer } from './drawing/renderer.js'
export type { surface } from './drawing/renderer.js'
export { sprite, sprite_get_width, sprite_get_height, sprite_get_xoffset, sprite_get_yoffset, sprite_get_number } from './drawing/sprite.js'
export { background, background_get_width, background_get_height } from './drawing/background.js'
export { font_resource } from './drawing/font.js'
export { texture_manager } from './drawing/texture_manager.js'
export type { texture_entry } from './drawing/texture_manager.js'

// Shader system
export {
    user_shader, shader_set, shader_reset, shader_current,
    shader_get_uniform, shader_set_uniform_f, shader_set_uniform_f2,
    shader_set_uniform_f3, shader_set_uniform_f4,
    shader_set_uniform_i, shader_set_uniform_i2,
    shader_set_uniform_f_array, shader_set_uniform_matrix,
} from './drawing/shader_system.js'

// View / camera system
export {
    view_get, view_set_enabled, view_set_position, view_set_size,
    view_set_port, view_set_angle, view_apply,
    camera_set_view_pos, camera_set_view_size,
    view_get_x, view_get_y,
} from './drawing/view.js'
export type { view_config } from './drawing/view.js'

// Draw functions (GMS-style API)
export {
    draw_set_color, draw_get_color,
    draw_set_alpha, draw_get_alpha,
    draw_clear,
    draw_set_blend_mode,
    draw_sprite, draw_sprite_ext, draw_sprite_part, draw_sprite_stretched,
    draw_background, draw_background_ext, draw_background_stretched, draw_background_tiled,
    draw_point, draw_line, draw_line_width,
    draw_rectangle, draw_circle, draw_ellipse, draw_triangle,
    draw_text, draw_set_font, draw_set_halign, draw_set_valign,
    string_width, string_height,
    surface_create, surface_set_target, surface_reset_target,
    surface_free, surface_exists, surface_get_width, surface_get_height,
    draw_surface,
} from './drawing/draw_functions.js'

// Color constants and utilities
export {
    c_aqua, c_black, c_blue, c_dkgray, c_fuchsia, c_gray, c_green,
    c_lime, c_ltgray, c_maroon, c_navy, c_olive, c_orange, c_purple,
    c_red, c_silver, c_teal, c_white, c_yellow,
    bm_normal, bm_add, bm_max, bm_subtract,
    fa_left, fa_center, fa_right, fa_top, fa_middle, fa_bottom,
    make_color_rgb, make_color_hsv,
    color_get_red, color_get_green, color_get_blue,
    merge_color, color_to_rgb_normalized,
} from './drawing/color.js'

// =========================================================================
// Input
// =========================================================================

// Keyboard
export {
    keyboard_manager,
    keyboard_check, keyboard_check_pressed, keyboard_check_released,
    keyboard_check_direct, keyboard_clear, keyboard_key_press, keyboard_key_release,
    keyboard_set_map, keyboard_get_map, keyboard_unset_map,
    vk_nokey, vk_anykey, vk_backspace, vk_tab, vk_enter, vk_shift, vk_control,
    vk_alt, vk_pause, vk_escape, vk_space, vk_pageup, vk_pagedown, vk_end,
    vk_home, vk_left, vk_up, vk_right, vk_down, vk_insert, vk_delete,
    vk_f1, vk_f2, vk_f3, vk_f4, vk_f5, vk_f6, vk_f7, vk_f8, vk_f9, vk_f10,
    vk_f11, vk_f12, vk_numpad0, vk_numpad1, vk_numpad2, vk_numpad3, vk_numpad4,
    vk_numpad5, vk_numpad6, vk_numpad7, vk_numpad8, vk_numpad9,
    vk_multiply, vk_add, vk_subtract, vk_decimal, vk_divide, vk_printscreen,
} from './input/keyboard.js'

// Mouse
export {
    mouse_manager,
    mouse_check_button, mouse_check_button_pressed, mouse_check_button_released,
    mouse_clear, mouse_wheel_up, mouse_wheel_down,
    window_mouse_get_x, window_mouse_get_y, window_mouse_set,
    mb_none, mb_left, mb_right, mb_middle, mb_any,
} from './input/mouse.js'

// Gamepad
export {
    gamepad_manager,
    gamepad_is_supported, gamepad_is_connected, gamepad_get_device_count,
    gamepad_get_description, gamepad_axis_count, gamepad_axis_value,
    gamepad_button_count, gamepad_button_check, gamepad_button_check_pressed,
    gamepad_button_check_released, gamepad_button_value, gamepad_set_vibration,
    gp_face1, gp_face2, gp_face3, gp_face4,
    gp_shoulderl, gp_shoulderr, gp_shoulderlb, gp_shoulderrb,
    gp_select, gp_start, gp_stickl, gp_stickr,
    gp_padu, gp_padd, gp_padl, gp_padr,
    gp_axislh, gp_axislv, gp_axisrh, gp_axisrv,
} from './input/gamepad.js'

// Touch
export {
    touch_manager,
    device_mouse_check_button, device_mouse_check_button_pressed,
    device_mouse_check_button_released, device_mouse_x, device_mouse_y,
    device_get_touch_count,
} from './input/touch.js'

// =========================================================================
// Data Structures
// =========================================================================
export {
    ds_list_create, ds_list_destroy, ds_list_add, ds_list_insert,
    ds_list_find_value, ds_list_find_index, ds_list_replace, ds_list_delete,
    ds_list_size, ds_list_empty, ds_list_clear, ds_list_copy,
    ds_list_sort, ds_list_shuffle, ds_list_exists,
} from './data/ds_list.js'

export {
    ds_map_create, ds_map_destroy, ds_map_add, ds_map_set,
    ds_map_find_value, ds_map_exists, ds_map_delete, ds_map_size,
    ds_map_empty, ds_map_clear, ds_map_copy,
    ds_map_find_first, ds_map_find_next, ds_map_find_last, ds_map_find_previous,
    ds_map_exists_id,
} from './data/ds_map.js'

export {
    ds_grid_create, ds_grid_destroy, ds_grid_get, ds_grid_set,
    ds_grid_add, ds_grid_multiply, ds_grid_clear,
    ds_grid_width, ds_grid_height, ds_grid_copy,
    ds_grid_region_get, ds_grid_set_region, ds_grid_add_region, ds_grid_multiply_region,
    ds_grid_get_max, ds_grid_get_min, ds_grid_get_sum, ds_grid_get_mean,
    ds_grid_exists,
} from './data/ds_grid.js'

export {
    ds_stack_create, ds_stack_destroy, ds_stack_push, ds_stack_pop,
    ds_stack_top, ds_stack_size, ds_stack_empty, ds_stack_clear,
    ds_stack_copy, ds_stack_exists,
} from './data/ds_stack.js'

export {
    ds_queue_create, ds_queue_destroy, ds_queue_enqueue, ds_queue_dequeue,
    ds_queue_head, ds_queue_tail, ds_queue_size, ds_queue_empty,
    ds_queue_clear, ds_queue_copy, ds_queue_exists,
} from './data/ds_queue.js'

export {
    ds_priority_create, ds_priority_destroy, ds_priority_add,
    ds_priority_delete_value, ds_priority_delete_min, ds_priority_delete_max,
    ds_priority_find_min, ds_priority_find_max, ds_priority_find_priority,
    ds_priority_size, ds_priority_empty, ds_priority_clear,
    ds_priority_copy, ds_priority_exists,
} from './data/ds_priority.js'

// =========================================================================
// Storage
// =========================================================================
export {
    ini_open, ini_close,
    ini_read_string, ini_read_real, ini_write_string, ini_write_real,
    ini_key_exists, ini_section_exists, ini_key_delete, ini_section_delete,
    ini_delete,
} from './storage/ini.js'

export {
    file_text_open_read, file_text_open_write, file_text_open_append,
    file_text_close, file_text_readln, file_text_read_string,
    file_text_eof, file_text_write_string, file_text_writeln,
    file_exists, file_delete,
} from './storage/file_system.js'

export {
    json_encode, json_decode, json_stringify_pretty,
    json_deep_clone, json_is_valid, json_save, json_load, json_delete,
} from './storage/json_storage.js'

// =========================================================================
// Audio
// =========================================================================
export { audio_system } from './audio/audio_system.js'
export { audio_group, audio_group_set_gain, audio_group_get_gain, audio_group_stop } from './audio/audio_group.js'
export {
    sound_asset, sound_instance,
    audio_play_sound, audio_stop_sound, audio_stop_all,
    audio_is_playing, audio_sound_gain, audio_sound_pitch,
    audio_set_master_gain, audio_get_master_gain,
} from './audio/sound.js'
export {
    spatial_sound_instance,
    audio_set_listener_position, audio_play_sound_at, audio_set_sound_position,
    audio_get_listener_x, audio_get_listener_y,
} from './audio/audio_3d.js'

// =========================================================================
// Physics
// =========================================================================
export {
    physics_world_create, physics_world_destroy, physics_world_step,
    physics_world_gravity, physics_world_on_collision_start,
    physics_world_on_collision_end, physics_get_scale, physics_world_get_engine,
} from './physics/physics_world.js'

export {
    physics_fixture_create, physics_fixture_set_box, physics_fixture_set_circle,
    physics_fixture_set_polygon, physics_fixture_set_density,
    physics_fixture_set_restitution, physics_fixture_set_friction,
    physics_fixture_set_sensor, physics_fixture_bind, physics_fixture_delete,
    physics_body_destroy, physics_body_apply_force, physics_body_apply_impulse,
    physics_body_set_velocity, physics_body_set_position, physics_body_set_angular_velocity,
    physics_body_set_static, physics_body_get_x, physics_body_get_y,
    physics_body_get_angle, physics_body_get_vx, physics_body_get_vy,
    physics_body_get_angular_velocity, physics_body_exists, physics_body_get_raw,
} from './physics/physics_body.js'

export {
    physics_joint_distance_create, physics_joint_revolute_create,
    physics_joint_weld_create, physics_joint_spring_create,
    physics_joint_destroy, physics_joint_exists, physics_joint_get_raw,
} from './physics/physics_joint.js'

// =========================================================================
// Networking
// =========================================================================

// Buffer
export {
    buffer_u8, buffer_s8, buffer_u16, buffer_s16, buffer_u32, buffer_s32,
    buffer_f32, buffer_f64, buffer_bool, buffer_string, buffer_u64,
    buffer_fixed, buffer_grow, buffer_wrap, buffer_fast,
    buffer_seek_start, buffer_seek_relative, buffer_seek_end,
    buffer_create, buffer_delete, buffer_exists, buffer_get_size, buffer_tell,
    buffer_seek, buffer_write, buffer_read, buffer_fill, buffer_copy,
    buffer_get_bytes, buffer_from_bytes,
    buffer_base64_encode, buffer_base64_decode,
} from './networking/buffer.js'

// WebSocket
export {
    network_type_connect, network_type_disconnect, network_type_data,
    network_type_non_blocking_connect,
    network_create_socket, network_send_raw, network_send_text, network_destroy,
    network_get_ready_state, network_set_on_open, network_set_on_message,
    network_set_on_close, network_set_on_error, network_socket_exists,
} from './networking/websocket_client.js'

// WebRTC
export {
    webrtc_create_peer, webrtc_create_channel, webrtc_create_offer,
    webrtc_create_answer, webrtc_set_remote_answer, webrtc_add_ice_candidate,
    webrtc_send, webrtc_send_text, webrtc_destroy_peer,
    webrtc_set_on_channel, webrtc_set_on_ice_candidate,
    webrtc_set_on_message, webrtc_set_on_open, webrtc_set_on_close,
    webrtc_peer_exists, webrtc_get_state,
} from './networking/webrtc_client.js'

// HTTP
export {
    http_get, http_post, http_post_json, http_get_bytes, http_request,
} from './networking/http_client.js'
export type { http_response, http_binary_response } from './networking/http_client.js'

// =========================================================================
// Particles
// =========================================================================

// Particle types
export {
    pt_shape_pixel, pt_shape_disk, pt_shape_square, pt_shape_line,
    pt_shape_star, pt_shape_circle, pt_shape_ring, pt_shape_sphere,
    pt_shape_flare, pt_shape_spark, pt_shape_explosion, pt_shape_cloud,
    pt_shape_smoke, pt_shape_snow,
    part_type_create, part_type_destroy, part_type_exists,
    part_type_shape, part_type_size, part_type_speed, part_type_direction,
    part_type_gravity, part_type_orientation, part_type_life,
    part_type_color1, part_type_color2, part_type_color3,
    part_type_alpha1, part_type_alpha2, part_type_alpha3,
    part_type_blend, part_type_step, part_type_death,
} from './particles/particle_type.js'

// Particle systems
export {
    part_system_create, part_system_destroy, part_system_exists,
    part_system_depth, part_system_clear, part_system_count,
    part_system_update, part_system_draw,
} from './particles/particle_system.js'

// Particle emitters
export {
    ps_shape_rectangle, ps_shape_ellipse, ps_shape_diamond, ps_shape_line,
    ps_distr_linear, ps_distr_gaussian, ps_distr_inv_gaussian,
    part_emitter_create, part_emitter_destroy, part_emitter_exists,
    part_emitter_region, part_emitter_burst, part_emitter_stream,
} from './particles/particle_emitter.js'

// =========================================================================
// 3D System
// =========================================================================

// Transform stack + matrix utilities
export {
    mat4_identity, mat4_mul, mat4_translate, mat4_scale,
    mat4_rotate_x, mat4_rotate_y, mat4_rotate_z,
    mat4_perspective, mat4_look_at, mat4_ortho,
    d3d_transform_get, d3d_transform_set_identity,
    d3d_transform_set_translation, d3d_transform_set_scaling, d3d_transform_set_rotation,
    d3d_transform_add_translation, d3d_transform_add_scaling,
    d3d_transform_add_rotation_x, d3d_transform_add_rotation_y, d3d_transform_add_rotation_z,
    d3d_transform_stack_push, d3d_transform_stack_pop, d3d_transform_stack_clear,
} from './3d/transform_3d.js'
export type { mat4 } from './3d/transform_3d.js'

// Lighting
export {
    d3d_lighttype_directional, d3d_lighttype_point, MAX_LIGHTS,
    d3d_light_enable, d3d_light_define_direction, d3d_light_define_point,
    d3d_light_set_ambient, d3d_light_get_uniforms, d3d_light_get_all,
} from './3d/lighting_3d.js'

// Models
export {
    pr_pointlist, pr_linelist, pr_linestrip, pr_trianglelist, pr_trianglestrip, pr_trianglefan,
    d3d_model_create, d3d_model_destroy, d3d_model_exists, d3d_model_clear,
    d3d_model_primitive_begin, d3d_model_primitive_end,
    d3d_model_vertex, d3d_model_vertex_normal, d3d_model_vertex_texture,
    d3d_model_set_normal, d3d_model_set_uv,
    d3d_model_block, d3d_model_sphere, d3d_model_draw,
} from './3d/model.js'

// Model loader
export { model_load_obj, model_load_obj_url } from './3d/model_loader.js'

// =========================================================================
// Math & Utilities
// =========================================================================
export { vector2 } from './math/vectors.js'

// Math utilities
export {
    degtorad, radtodeg,
    dsin, dcos, dtan, arcsin, arccos, arctan, arctan2,
    lengthdir_x, lengthdir_y, point_distance, point_distance_3d, point_direction,
    angle_difference, lerp, clamp, sign, frac, sqr, sqrt, abs,
    floor, ceil, round, power, log2, log10, ln, exp,
    min, max, median, mean, between, approx, wrap,
    dot2, dot3, cross2,
} from './math/math_utils.js'

// Random
export {
    random_set_seed, random_get_seed, randomize,
    random, irandom, random_range, irandom_range,
    array_shuffle, array_random, random_native,
} from './math/random.js'

// String utilities
export {
    string_length, string_copy, string_pos, string_pos_ext,
    string_delete, string_insert, string_replace, string_replace_all,
    string_count, string_lower, string_upper,
    string_letters, string_digits, string_lettersdigits,
    string_trim, string_trim_start, string_trim_end,
    string_repeat, string_reverse, string_char_at,
    string_byte_at, string_byte_length,
    chr, ord, ansi_char, string_format, string, real,
    string_split, string_join,
} from './math/string_utils.js'

// Regex utilities
export {
    regex_match, regex_find, regex_find_all,
    regex_replace, regex_replace_all, regex_split,
    regex_pos, regex_groups,
} from './math/regex_utils.js'
