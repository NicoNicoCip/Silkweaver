export class obj_player extends gm_object {
    spd = 5;
    jump_force = 16;
    weight = 1;

    on_create(): void {
        inst.grounded = false;
        inst.vertical_acc = 0.0;
        inst.vertical_vel = 0.0;
        inst.horizontal_vel = 0.0;
    }

    on_step(): void {
        // controlls
        let key_left = keyboard_check(ord("A"));
        let key_right = keyboard_check(ord("D"));
        let key_jump = keyboard_check(vk_space);

        // ------------------------------
        // left to right
        // ------------------------------

        // motion
        let dir = 0;
        if (key_left) {
            dir = -1;
        }

        if (key_right) {
            dir = 1;
        }

        // movenemt
        inst.horizontal_vel = dir * inst.spd;
        if (!sw.place_meeting(sw.x + inst.horizontal_vel, sw.y, _col)) {
            sw.x += inst.horizontal_vel;
        }

        // ------------------------------
        // jump and gravity
        // ------------------------------

        // grounding
        if (sw.place_meeting(sw.x, sw.y + 1, _col)) {
            inst.grounded = true;
            inst.vertical_vel = 0;
            inst.vertical_acc = 0;
        } else {
            inst.grounded = false;
        }

        // gravity
        if (!inst.grounded) {
            inst.vertical_acc = -inst.weight;
        }

        // jump
        if (key_jump && inst.grounded) {
            inst.vertical_acc = inst.jump_force;
        }

        // apply acceleration
        inst.vertical_vel += inst.vertical_acc;
        if (sw.place_meeting(sw.x, sw.y - inst.vertical_vel, _col)) {
            while (!sw.place_meeting(sw.x, sw.y - sign(inst.vertical_vel), _col)) {
                sw.y -= sign(inst.vertical_vel);
            }
            inst.vertical_vel = 0;
        }
        sw.y -= inst.vertical_vel;

        // ------------------------------
        // sprite flip
        // ------------------------------

        if (dir == 1) {
            sw.image_xscale = 1;
        } else if (dir == -1) {
            sw.image_xscale = -1;
        }
    }
    static sprite = 'spr_player'
}
