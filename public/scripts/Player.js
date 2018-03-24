import gGameEngine from './GameEngine.js';
import gInputEngine from './InputEngine.js';
import Utils from './Utils.js';
export default class Player {

    constructor(position, controls, id) {
        this.id = 0;
        this.velocity = 2;
        this.size = {
            w: 48,
            h: 48
        };
        this.alive = true;
        this.controls = {
            'up': 'up',
            'left': 'left',
            'down': 'down',
            'right': 'right'
        };
        if (id) {
            this.id = id;
        }

        if (controls) {
            this.controls = controls;
        }

        const img = gGameEngine.playerBoyImg;

        const spriteSheet = new createjs.SpriteSheet({
            images: [img],
            frames: { width: this.size.w, height: this.size.h, regX: 10, regY: 12 },
            animations: {
                idle: [0, 0, 'idle'],
                down: [0, 3, 'down', 0.1],
                left: [4, 7, 'left', 0.1],
                up: [8, 11, 'up', 0.1],
                right: [12, 15, 'right', 0.1],
                dead: [16, 16, 'dead', 0.1]
            }
        });
        this.bmp = new createjs.Sprite(spriteSheet);

        this.position = position;
        const pixels = Utils.convertToBitmapPosition(position);
        this.bmp.x = pixels.x;
        this.bmp.y = pixels.y;

        gGameEngine.stage.addChild(this.bmp);

    }

    update() {
        if (!this.alive) {
            return;
        }
        const position = { x: this.bmp.x, y: this.bmp.y };

        // TODO
    }


    // Checks whether we are on corner to target position. Returns position where we should move before we can go to target.
    getCornerFix(dirX, dirY) {
        // TODO
    }


    // Calculates and updates entity position according to its actual bitmap position
    updatePosition() {
        this.position = Utils.convertToEntityPosition(this.bmp);
    }


    // Returns true when collision is detected and we should not move to target position

    detectWallCollision(position) {
        // TODO
    }


    // Changes animation if requested animation is not already current
    animate(animation) {
        if (!this.bmp.currentAnimation || this.bmp.currentAnimation.indexOf(animation) === -1) {
            this.bmp.gotoAndPlay(animation);
        }
    }
}
