import Utils from './Utils.js';
import gGameEngine from './GameEngine.js';

export default class Princess {
    constructor(position) {
        this.size = {
            w: 48,
            h: 48
        };

        const img = gGameEngine.princessImg;

        const spriteSheet = new createjs.SpriteSheet({
            images: [img],
            frames: { width: this.size.w, height: this.size.h, regX: 10, regY: 12 },
            animations: {
                idle: [12, 12, 'idle'],
            }
        });
        
        this.move = {
            x: 0,
            y: 0
        }
        
        this.bmp = new createjs.Sprite(spriteSheet);

        this.position = position;
        const pixels = Utils.convertToBitmapPosition(position);
        this.bmp.x = pixels.x;
        this.bmp.y = pixels.y;

        gGameEngine.stage.addChild(this.bmp);
    }
    
    movePrincess(position, move) {
        
        const pixels = Utils.convertToBitmapPosition(position);
        
        gGameEngine.princess.position = position;
        gGameEngine.princess.bmp.x = pixels.x + move.x;
        gGameEngine.princess.bmp.y = pixels.y + move.y;

        gGameEngine.stage.addChild(gGameEngine.princess.bmp);
        
        gGameEngine.princess.position.x = Math.floor(gGameEngine.princess.bmp.x / gGameEngine.tileSize);
        gGameEngine.princess.position.y = Math.floor(gGameEngine.princess.bmp.y / gGameEngine.tileSize);
        gGameEngine.princess.move.x = gGameEngine.princess.bmp.x % gGameEngine.tileSize;
        gGameEngine.princess.move.y = gGameEngine.princess.bmp.y % gGameEngine.tileSize;
    }
        
}