# Math & Utilities

## File Structure
```
packages/engine/src/math/
├── math.ts    # Math functions
├── random.ts  # Random number generation
└── ...

packages/engine/src/string/
├── string.ts  # String functions
└── regex.ts   # Regex functions (NEW)
```

## Math Functions

| Function | Description |
|----------|-------------|
| `abs(n)` | Absolute value |
| `sign(n)` | Sign of number |
| `round(n)` | Round to nearest |
| `floor(n)` | Round down |
| `ceil(n)` | Round up |
| `frac(n)` | Fractional part |
| `sqrt(n)` | Square root |
| `sqr(n)` | Square |
| `power(x, n)` | x to power n |
| `exp(n)` | e to power n |
| `ln(n)` | Natural log |
| `log2(n)` | Log base 2 |
| `log10(n)` | Log base 10 |
| `logn(n, x)` | Log base n |
| `min(...args)` | Minimum value |
| `max(...args)` | Maximum value |
| `mean(...args)` | Average |
| `median(...args)` | Median |
| `clamp(val, min, max)` | Clamp value |
| `lerp(a, b, t)` | Linear interpolation |

## Trigonometry (Radians)

| Function | Description |
|----------|-------------|
| `sin(n)` | Sine |
| `cos(n)` | Cosine |
| `tan(n)` | Tangent |
| `arcsin(n)` | Arc sine |
| `arccos(n)` | Arc cosine |
| `arctan(n)` | Arc tangent |
| `arctan2(y, x)` | Arc tangent 2 |

## Trigonometry (Degrees)

| Function | Description |
|----------|-------------|
| `dsin(n)` | Sine |
| `dcos(n)` | Cosine |
| `dtan(n)` | Tangent |
| `darcsin(n)` | Arc sine |
| `darccos(n)` | Arc cosine |
| `darctan(n)` | Arc tangent |
| `darctan2(y, x)` | Arc tangent 2 |
| `degtorad(deg)` | Degrees to radians |
| `radtodeg(rad)` | Radians to degrees |

## Geometry

| Function | Description |
|----------|-------------|
| `point_distance(x1, y1, x2, y2)` | Distance between points |
| `point_direction(x1, y1, x2, y2)` | Direction to point |
| `lengthdir_x(len, dir)` | X component of vector |
| `lengthdir_y(len, dir)` | Y component of vector |
| `dot_product(x1, y1, x2, y2)` | 2D dot product |
| `dot_product_3d(...)` | 3D dot product |
| `angle_difference(a1, a2)` | Shortest angle diff |

## Random Number Generation (Seedable)

| Function | Description |
|----------|-------------|
| `random(n)` | Random float 0 to n |
| `random_range(a, b)` | Random float a to b |
| `irandom(n)` | Random int 0 to n |
| `irandom_range(a, b)` | Random int a to b |
| `random_set_seed(seed)` | Set RNG seed |
| `random_get_seed()` | Get current seed |
| `randomize()` | Randomize seed |
| `choose(...args)` | Pick random argument |

## String Functions (0-based indexing)

| Function | Description |
|----------|-------------|
| `string(val)` | Convert to string |
| `real(str)` | Convert to number |
| `string_length(str)` | Get length |
| `string_char_at(str, index)` | Get char (0-based) |
| `string_ord_at(str, index)` | Get char code |
| `string_copy(str, index, count)` | Substring |
| `string_delete(str, index, count)` | Delete chars |
| `string_insert(substr, str, index)` | Insert string |
| `string_replace(str, substr, newstr)` | Replace first |
| `string_replace_all(str, substr, newstr)` | Replace all |
| `string_count(substr, str)` | Count occurrences |
| `string_pos(substr, str)` | Find position |
| `string_pos_ext(substr, str, start)` | Find from pos |
| `string_last_pos(substr, str)` | Find last |
| `string_lower(str)` | To lowercase |
| `string_upper(str)` | To uppercase |
| `string_letters(str)` | Letters only |
| `string_digits(str)` | Digits only |
| `string_lettersdigits(str)` | Letters & digits |
| `string_repeat(str, count)` | Repeat string |
| `string_format(val, total, dec)` | Format number |
| `chr(code)` | Char from code |
| `ord(char)` | Code from char |

## Regex Functions (NEW - not in GMS)

| Function | Description |
|----------|-------------|
| `regex_match(str, pattern)` | Match pattern |
| `regex_match_all(str, pattern)` | Find all matches |
| `regex_replace(str, pattern, replacement)` | Replace first |
| `regex_replace_all(str, pattern, replacement)` | Replace all |
| `regex_test(str, pattern)` | Test if matches |
| `regex_split(str, pattern)` | Split by pattern |

## Constants (Use JS Conventions)

```typescript
// Use JavaScript Math constants
Math.PI      // Instead of GMS 'pi'
true/false   // Standard boolean
undefined    // Standard undefined
```
