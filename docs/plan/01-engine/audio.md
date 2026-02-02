# Audio System

## File Structure
```
packages/engine/src/audio/
├── audio-system.ts   # Web Audio API wrapper
├── sound.ts          # Sound resource
├── audio-emitter.ts  # 3D audio emitter
├── audio-listener.ts # 3D audio listener
├── audio-group.ts    # Sound groups
└── audio-effects.ts  # Audio effects
```

## Supported Formats
- MP3
- OGG
- WAV

## Basic Audio Functions

| Function | Description |
|----------|-------------|
| `audio_play_sound(sound, priority, loop)` | Play sound |
| `audio_play_sound_at(sound, x, y, z, falloff_ref, falloff_max, falloff_factor, loop, priority)` | Play 3D sound |
| `audio_pause_sound(sound)` | Pause sound |
| `audio_resume_sound(sound)` | Resume sound |
| `audio_stop_sound(sound)` | Stop sound |
| `audio_stop_all()` | Stop all sounds |
| `audio_is_playing(sound)` | Check playing |
| `audio_is_paused(sound)` | Check paused |

## Sound Properties

| Function | Description |
|----------|-------------|
| `audio_sound_gain(sound, volume, time)` | Set volume |
| `audio_sound_pitch(sound, pitch)` | Set pitch |
| `audio_sound_get_gain(sound)` | Get volume |
| `audio_sound_get_pitch(sound)` | Get pitch |
| `audio_sound_length(sound)` | Get length |
| `audio_sound_set_track_position(sound, pos)` | Set position |
| `audio_sound_get_track_position(sound)` | Get position |

## Audio Emitter Functions (3D Audio)

| Function | Description |
|----------|-------------|
| `audio_emitter_create()` | Create emitter |
| `audio_emitter_free(emitter)` | Free emitter |
| `audio_emitter_exists(emitter)` | Check exists |
| `audio_emitter_position(emitter, x, y, z)` | Set position |
| `audio_emitter_velocity(emitter, vx, vy, vz)` | Set velocity |
| `audio_emitter_falloff(emitter, ref, max, factor)` | Set falloff |
| `audio_emitter_gain(emitter, gain)` | Set gain |
| `audio_emitter_pitch(emitter, pitch)` | Set pitch |
| `audio_play_sound_on(emitter, sound, loop, priority)` | Play on emitter |

## Audio Listener Functions

| Function | Description |
|----------|-------------|
| `audio_listener_position(x, y, z)` | Set position |
| `audio_listener_velocity(vx, vy, vz)` | Set velocity |
| `audio_listener_orientation(...)` | Set orientation |
| `audio_listener_get_data(index)` | Get listener data |
| `audio_set_listener_mask(mask)` | Set listener mask |
| `audio_get_listener_mask()` | Get listener mask |
| `audio_get_listener_count()` | Count listeners |

## Audio Group Functions

| Function | Description |
|----------|-------------|
| `audio_group_load(group)` | Load group |
| `audio_group_unload(group)` | Unload group |
| `audio_group_is_loaded(group)` | Check loaded |
| `audio_group_set_gain(group, volume, time)` | Set group volume |
| `audio_group_name(group)` | Get group name |
| `audio_group_stop_all(group)` | Stop all in group |

## Master Audio Functions

| Function | Description |
|----------|-------------|
| `audio_master_gain(gain)` | Set master volume |
| `audio_get_master_gain(index)` | Get master volume |
| `audio_channel_num(num)` | Set channel count |
| `audio_system_is_available()` | Check system available |
| `audio_system_is_initialised()` | Check initialized |

## Implementation Notes

Uses Web Audio API for:
- Spatial audio (PannerNode)
- Volume control (GainNode)
- Pitch shifting (playbackRate)
- Effects processing
