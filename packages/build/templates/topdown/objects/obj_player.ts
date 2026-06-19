export class obj_player extends gm_object {

    on_step(): void {
// inputs
let key_up = keyboard_check(ord("W"));
let key_down = keyboard_check(ord("S"));
let key_left = keyboard_check(ord("A"));
let key_right = keyboard_check(ord("D"));

//direction
let dir: vector2 = new vector2(0,0);
if (key_up) {
    dir.y = -1;
}

if (key_down) {
    dir.y = 1;
}

if (key_left) {
    dir.x = -1;
}

if (key_right) {
    dir.x = 1;
}

// motion
let motion_x = dir.x * this.spd;
let motion_y = dir.y * this.spd;

if (!this.place_meeting(this.x + motion_x, this.y, _col)) {
    this.x += motion_x;
}

if (!this.place_meeting(this.x, this.y + motion_y, _col)) {
    this.y += motion_y;
}


    }

    static sprite = 'spr_player'
    spd = 3
}
