import gGameEngine from './GameEngine.js';
import Utils from './Utils.js';

export default class Enemy {

    constructor(position) {
        this.velocity = 1;
        this.size = {
            w: 24,
            h: 24
        };
        this.direction = 'right';
        this.dirX = 1;
        this.dirY = 0;
        const img = gGameEngine.enemyImg;
        const spriteSheet = new createjs.SpriteSheet({
            images: [img],
            frames: { width: this.size.w, height: this.size.h, regX: 10 },
            animations: {
                idle: [0, 0, 'idle'],
                right: [3, 10, 'right', 0.1],
                left: [38, 44, 'left', 0.1],
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
        this.moveToTargetPosition();
    }

    moveToTargetPosition() {
        
    }
}
