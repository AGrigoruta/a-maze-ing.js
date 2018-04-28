import Utils from './Utils.js';
import gGameEngine from './GameEngine.js';

export default class Princess {
    constructor(position) {
        this.size = {
            w: 48,
            h: 48
        };
        
        var img = gGameEngine.princessImg;

        var spriteSheet = new createjs.SpriteSheet({
            images: [img],
            frames: { width: this.size.w, height: this.size.h, regX: 10, regY: 12 },
            animations: {
                idle: [12, 12, 'idle'],
            }
        });
        this.bmp = new createjs.Sprite(spriteSheet);

        this.position = position;
        var pixels = Utils.convertToBitmapPosition(position);
        this.bmp.x = pixels.x;
        this.bmp.y = pixels.y;

        gGameEngine.stage.addChild(this.bmp);
    }
    
}