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
        this.lastDirection = '';
        this.dirX = 1;
        this.dirY = 0;
        this.wait = false;
        this.started = false;
        this.startTimerMax = Math.random() * 60;
        var img = gGameEngine.enemyImg;
        var spriteSheet = new createjs.SpriteSheet({
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
        var pixels = Utils.convertToBitmapPosition(position);
        this.bmp.x = pixels.x;
        this.bmp.y = pixels.y;

        gGameEngine.stage.addChild(this.bmp);
    }

    update() {

        this.wait = false;

        if (!this.started && this.startTimer < this.startTimerMax) {
            this.startTimer++;
            if (this.startTimer >= this.startTimerMax) {
                this.started = true;
            }
            this.animate('idle');
            this.wait = true;
        }

        if (!this.wait) {
            this.moveToTargetPosition();
        }
    }

    moveToTargetPosition() {

        if (this.dirX == -1) {
            this.direction = 'left';
        } else if (this.dirX == 1) {
            this.direction = 'right';
        }

        this.animate(this.direction);

        var velocity = this.velocity;

        var targetPosition = { x: this.bmp.x + this.dirX * velocity, y: this.bmp.y + this.dirY * velocity };
        if (this.detectWallCollision(targetPosition)) {
            if (this.dirX == 0) {
                this.dirY = this.dirY * (-1);
            } else if (this.dirY == 0) {
                this.dirX = this.dirX * (-1);
            }
        } else {
            this.bmp.x = targetPosition.x;
            this.bmp.y = targetPosition.y;
        }

        this.updatePosition();
    }

    updatePosition() {
        this.position = Utils.convertToEntityPosition(this.bmp);

    }

    animate(animation) {
        if (!this.bmp.currentAnimation || this.bmp.currentAnimation.indexOf(animation) === -1) {
            this.bmp.gotoAndPlay(animation);
        }
    }

    detectWallCollision(position) {
        var enemy = {};
        enemy.left = position.x;
        enemy.top = position.y;
        enemy.right = enemy.left + this.size.w;
        enemy.bottom = enemy.top + this.size.h;

        // Check possible collision with all wall and wood tiles
        var tiles = gGameEngine.tiles;
        for (var i = 0; i < tiles.length; i++) {
            var tilePosition = tiles[i].position;

            var tile = {};
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
}
