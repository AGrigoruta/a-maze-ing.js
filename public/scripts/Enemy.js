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
        if (this.dirX === -1) {
            this.direction = 'left';
        } else if (this.dirX === 1) {
            this.direction = 'right';
        }

        this.animate(this.direction) 

        const targetPosition = { x: this.bmp.x + this.dirX * this.velocity, y: this.bmp.y + this.dirY * this.velocity}
        if (this.detectWallCollision(targetPosition)) {
            this.dirX = this.dirX * (-1);
        } else {
            this.bmp.x = targetPosition.x;
            this.bmp.y = targetPosition.y;
        }

        this.updatePosition();
        
    }

    // Calculates and updates entity position according to its actual bitmap position
    updatePosition() {
        this.position = Utils.convertToEntityPosition(this.bmp);
    }

    
    // Returns true when collision is detected and we should not move to target position
    
    detectWallCollision(position) {
        const enemy = {};
        enemy.left = position.x;
        enemy.top = position.y;
        enemy.right = enemy.left + this.size.w;
        enemy.bottom = enemy.top + this.size.h;

        // Check possible collision with all wall and wood tiles
        const tiles = gGameEngine.tiles;
        for (let i = 0; i < tiles.length; i++) {
            const tilePosition = tiles[i].position;

            const tile = {};
            tile.left = tilePosition.x * gGameEngine.tileSize + 25;
            tile.top = tilePosition.y * gGameEngine.tileSize + 20;
            tile.right = tile.left + gGameEngine.tileSize - 30;
            tile.bottom = tile.top + gGameEngine.tileSize - 30;

            if (gGameEngine.intersectRect(enemy, tile)) {
                return true;
            }
        }
        return false;
    }

    
    // Changes animation if requested animation is not already current
    animate(animation) {
        if (!this.bmp.currentAnimation || this.bmp.currentAnimation.indexOf(animation) === -1) {
            this.bmp.gotoAndPlay(animation);
        }
    }
}
