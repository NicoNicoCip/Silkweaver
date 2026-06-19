export class obj_player extends gm_object {
    spd = 5;
    jump_force = 15;
    weight = 1;

    on_create(): void {
        this.grounded = false;
        this.vertical_acc = 0.0;
        this.vertical_vel = 0.0;
        this.horizontal_vel = 0.0;
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
        this.horizontal_vel = dir * this.spd;
        if (!this.place_meeting(this.x + this.horizontal_vel, this.y, _col)) {
            this.x += this.horizontal_vel;
        }

        // ------------------------------
        // jump and gravity
        // ------------------------------

        // grounding
        if (this.place_meeting(this.x, this.y + 1, _col)) {
            this.grounded = true;
            this.vertical_vel = 0;
            this.vertical_acc = 0;
        } else {
            this.grounded = false;
        }

        // vertical acceleration (gravity pulls down while airborne)
        if (!this.grounded) {
            this.vertical_acc = -this.weight;
        }

        // jump
        if (key_jump && this.grounded) {
            this.vertical_acc = this.jump_force;
        }

        // apply acceleration, then move — snapping flush against anything in the way
        this.vertical_vel += this.vertical_acc;
        if (this.place_meeting(this.x, this.y - this.vertical_vel, _col)) {
            while (!this.place_meeting(this.x, this.y - sign(this.vertical_vel), _col)) {
                this.y -= sign(this.vertical_vel);
            }
            this.vertical_vel = 0;
        }
        this.y -= this.vertical_vel;
    }
    static sprite = 'spr_player'
}
