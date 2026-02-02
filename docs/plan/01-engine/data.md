# Data Structures & Storage

## File Structure
```
packages/engine/src/data/
├── ds-list.ts      # List data structure
├── ds-map.ts       # Map/dictionary
├── ds-grid.ts      # 2D grid
├── ds-stack.ts     # Stack
├── ds-queue.ts     # Queue
├── ds-priority.ts  # Priority queue
├── ini.ts          # INI file system (localStorage)
├── file-system.ts  # File functions (IndexedDB)
└── json.ts         # JSON functions
```

## Data Structure ID System

```typescript
// All ds_* functions return numeric IDs (GML-style)
const list = ds_list_create(); // Returns number ID
ds_list_add(list, "value");
ds_list_destroy(list);
```

## List Functions

| Function | Description |
|----------|-------------|
| `ds_list_create()` | Create list |
| `ds_list_destroy(list)` | Destroy list |
| `ds_list_clear(list)` | Clear all |
| `ds_list_empty(list)` | Check empty |
| `ds_list_size(list)` | Get size |
| `ds_list_add(list, ...vals)` | Add values |
| `ds_list_insert(list, pos, val)` | Insert at position |
| `ds_list_replace(list, pos, val)` | Replace at position |
| `ds_list_delete(list, pos)` | Delete at position |
| `ds_list_find_index(list, val)` | Find value index |
| `ds_list_find_value(list, pos)` | Get value at pos |
| `ds_list_sort(list, ascending)` | Sort list |
| `ds_list_shuffle(list)` | Shuffle list |
| `ds_list_copy(dest, src)` | Copy list |
| `ds_list_read(list, str)` | Read from string |
| `ds_list_write(list)` | Write to string |

## Map Functions

| Function | Description |
|----------|-------------|
| `ds_map_create()` | Create map |
| `ds_map_destroy(map)` | Destroy map |
| `ds_map_clear(map)` | Clear all |
| `ds_map_empty(map)` | Check empty |
| `ds_map_size(map)` | Get size |
| `ds_map_add(map, key, val)` | Add key-value |
| `ds_map_replace(map, key, val)` | Replace value |
| `ds_map_delete(map, key)` | Delete key |
| `ds_map_exists(map, key)` | Check key exists |
| `ds_map_find_value(map, key)` | Get value |
| `ds_map_find_previous(map, key)` | Previous key |
| `ds_map_find_next(map, key)` | Next key |
| `ds_map_find_first(map)` | First key |
| `ds_map_find_last(map)` | Last key |
| `ds_map_copy(dest, src)` | Copy map |
| `ds_map_secure_save(map, filename)` | Encrypted save |
| `ds_map_secure_load(filename)` | Encrypted load |

## Grid Functions

| Function | Description |
|----------|-------------|
| `ds_grid_create(w, h)` | Create grid |
| `ds_grid_destroy(grid)` | Destroy grid |
| `ds_grid_resize(grid, w, h)` | Resize grid |
| `ds_grid_width(grid)` | Get width |
| `ds_grid_height(grid)` | Get height |
| `ds_grid_clear(grid, val)` | Clear with value |
| `ds_grid_set(grid, x, y, val)` | Set cell |
| `ds_grid_get(grid, x, y)` | Get cell |
| `ds_grid_add(grid, x, y, val)` | Add to cell |
| `ds_grid_multiply(grid, x, y, val)` | Multiply cell |
| `ds_grid_set_region(grid, x1, y1, x2, y2, val)` | Set region |
| `ds_grid_get_max(grid, x1, y1, x2, y2)` | Max in region |
| `ds_grid_get_min(grid, x1, y1, x2, y2)` | Min in region |
| `ds_grid_get_mean(grid, x1, y1, x2, y2)` | Mean in region |
| `ds_grid_get_sum(grid, x1, y1, x2, y2)` | Sum in region |
| `ds_grid_sort(grid, col, ascending)` | Sort by column |

## Stack/Queue/Priority Functions

### Stack
| Function | Description |
|----------|-------------|
| `ds_stack_create()` | Create |
| `ds_stack_destroy(stack)` | Destroy |
| `ds_stack_push(stack, ...vals)` | Push values |
| `ds_stack_pop(stack)` | Pop value |
| `ds_stack_top(stack)` | Peek top |
| `ds_stack_empty(stack)` | Check empty |
| `ds_stack_size(stack)` | Get size |

### Queue
| Function | Description |
|----------|-------------|
| `ds_queue_create()` | Create |
| `ds_queue_destroy(queue)` | Destroy |
| `ds_queue_enqueue(queue, ...vals)` | Enqueue |
| `ds_queue_dequeue(queue)` | Dequeue |
| `ds_queue_head(queue)` | Peek head |
| `ds_queue_tail(queue)` | Peek tail |
| `ds_queue_empty(queue)` | Check empty |

### Priority Queue
| Function | Description |
|----------|-------------|
| `ds_priority_create()` | Create |
| `ds_priority_add(pq, val, priority)` | Add with priority |
| `ds_priority_delete_max(pq)` | Delete max |
| `ds_priority_delete_min(pq)` | Delete min |
| `ds_priority_find_max(pq)` | Find max |
| `ds_priority_find_min(pq)` | Find min |
| `ds_priority_change_priority(pq, val, priority)` | Change priority |

## INI File Functions (localStorage-backed)

| Function | Description |
|----------|-------------|
| `ini_open(filename)` | Open INI file |
| `ini_close()` | Close INI file |
| `ini_read_string(section, key, default)` | Read string |
| `ini_read_real(section, key, default)` | Read number |
| `ini_write_string(section, key, value)` | Write string |
| `ini_write_real(section, key, value)` | Write number |
| `ini_key_exists(section, key)` | Check key exists |
| `ini_section_exists(section)` | Check section exists |
| `ini_key_delete(section, key)` | Delete key |
| `ini_section_delete(section)` | Delete section |

## File Functions (IndexedDB-backed)

| Function | Description |
|----------|-------------|
| `file_exists(filename)` | Check file exists |
| `file_delete(filename)` | Delete file |
| `file_rename(oldname, newname)` | Rename file |
| `file_copy(filename, newname)` | Copy file |
| `directory_exists(dirname)` | Check dir exists |
| `directory_create(dirname)` | Create directory |
| `directory_destroy(dirname)` | Delete directory |
| `file_text_open_read(filename)` | Open for read |
| `file_text_open_write(filename)` | Open for write |
| `file_text_open_append(filename)` | Open for append |
| `file_text_close(file)` | Close file |
| `file_text_read_string(file)` | Read line |
| `file_text_write_string(file, str)` | Write string |
| `file_text_eof(file)` | Check EOF |
| `file_bin_open(filename, mode)` | Open binary |
| `file_bin_read_byte(file)` | Read byte |
| `file_bin_write_byte(file, byte)` | Write byte |

## JSON Functions (Native JS)

| Function | Description |
|----------|-------------|
| `json_parse(json_string)` | Parse JSON to object |
| `json_stringify(value)` | Convert to JSON |
