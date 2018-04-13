import gGameEngine from './GameEngine.js';
import Utils from './Utils.js';
import Player from './Player.js';
import PlayerAI from './PlayerAI.js';

export default class Enemy {

    constructor(position) {
        this.velocity = 1;
        this.size = {
            w: 24,
            h: 24
        };
        this.move = {
            x: 0,
            y: 0
        };
        this.direction = 'right';
        this.dirX = 1;
        this.dirY = 0;
        const img = gGameEngine.enemyImg;
        const spriteSheet = new createjs.SpriteSheet({
            images: [img],
            frames: {
                width: this.size.w,
                height: this.size.h,
                regX: 10
            },
            animations: {
                idle: [0, 0, 'idle'],
                right: [3, 10, 'right', 0.1],
                down: [3, 10, 'down', 0.1],
                left: [38, 44, 'left', 0.1],
                up: [38, 44, 'up', 0.1],
            }
        });
        this.bmp = new createjs.Sprite(spriteSheet);

        this.position = position;
        const pixels = Utils.convertToBitmapPosition(position);
        this.bmp.x = pixels.x;
        this.bmp.y = pixels.y;

        gGameEngine.stage.addChild(this.bmp);
    }

    // ============================= MY CODE ==============================

    // move enemy and check players collision with monsters
    update() {
        this.moveEnemy();
        // player human collision
        for (let activePlayer of gGameEngine.players) {
            if (this.detectPlayerCollision({
                    x: activePlayer.bmp.x,
                    y: activePlayer.bmp.y
                })) {
                activePlayer.alive = false;
                activePlayer.animate('dead');
            }
        }
        // playerAI collision
        if (this.detectPlayerAICollision({
                x: gGameEngine.playerAI.bmp.x,
                y: gGameEngine.playerAI.bmp.y
            })) {
            gGameEngine.playerAI.alive = false;
            gGameEngine.playerAI.animate('dead');
        }
    }

    // calculate enemy movement
    moveEnemy() {
        // Check available directions at limit of movement
        if (this.detectWallStrictCollision(this.position, this.direction) && this.isStrictPosition()) {
            let availableMove = [];
            if (gGameEngine.getTileMaterial({
                    x: this.position.x,
                    y: this.position.y - 1
                }) === 'grass') {
                availableMove.push('up');
            }
            if (gGameEngine.getTileMaterial({
                    x: this.position.x + 1,
                    y: this.position.y
                }) === 'grass') {
                availableMove.push('right');
            }
            if (gGameEngine.getTileMaterial({
                    x: this.position.x,
                    y: this.position.y + 1
                }) === 'grass') {
                availableMove.push('down');
            }
            if (gGameEngine.getTileMaterial({
                    x: this.position.x - 1,
                    y: this.position.y
                }) === 'grass') {
                availableMove.push('left');
            }

            this.direction = availableMove[Math.floor(Math.random() * availableMove.length)];

            switch (this.direction) {
                case 'up':
                    this.dirX = 0;
                    this.dirY = -1;
                    break;
                case 'right':
                    this.dirX = 1;
                    this.dirY = 0;
                    break;
                case 'down':
                    this.dirX = 0;
                    this.dirY = 1;
                    break;
                case 'left':
                    this.dirX = -1;
                    this.dirY = 0;
                    break;
            }
        } else {
            // Check for middle intersections
            if (this.isStrictPosition()) {
                let availableIntersections = [this.direction];
                if (this.dirX) {
                    if (!this.detectWallStrictCollision(this.position, 'up')) {
                        availableIntersections.push('up');
                    } else if (!this.detectWallStrictCollision(this.position, 'down')) {
                        availableIntersections.push('down');
                    }
                } else if (this.dirY) {
                    if (!this.detectWallStrictCollision(this.position, 'left')) {
                        availableIntersections.push('left');
                    } else if (!this.detectWallStrictCollision(this.position, 'right')) {
                        availableIntersections.push('right');
                    }
                }
                this.direction = availableIntersections[Math.floor(Math.random() * availableIntersections.length)];
                switch (this.direction) {
                    case 'up':
                        this.move.y -= this.velocity;
                        this.dirX = 0;
                        this.dirY = -1;
                        break;
                    case 'down':
                        this.move.y += this.velocity;
                        this.dirX = 0;
                        this.dirY = 1;
                        break;
                    case 'left':
                        this.move.x -= this.velocity;
                        this.dirX = -1;
                        this.dirY = 0;
                        break;
                    case 'right':
                        this.move.x += this.velocity;
                        this.dirX = 1;
                        this.dirY = 0;
                        break;
                }
            } else {
                // Move enemy
                switch (this.direction) {
                    case 'up':
                        this.move.y -= this.velocity;
                        break;
                    case 'down':
                        this.move.y += this.velocity;
                        break;
                    case 'left':
                        this.move.x -= this.velocity;
                        break;
                    case 'right':
                        this.move.x += this.velocity;
                        break;
                }
            }
            const pixels = Utils.convertToBitmapPosition(this.position);

            this.bmp.x = pixels.x + this.move.x;
            this.bmp.y = pixels.y + this.move.y;

            this.animate(this.direction);

            this.position.x = Math.floor(this.bmp.x / gGameEngine.tileSize);
            this.position.y = Math.floor(this.bmp.y / gGameEngine.tileSize);
            this.move.x = this.bmp.x % gGameEngine.tileSize;
            this.move.y = this.bmp.y % gGameEngine.tileSize;
        }

    }

    // detect wall collision only when move={0, 0}
    detectWallStrictCollision(position, dir) {

        switch (dir) {
            case 'up':
                return gGameEngine.getTileMaterial({
                    x: position.x,
                    y: position.y - 1
                }) != 'grass';
            case 'down':
                return gGameEngine.getTileMaterial({
                    x: position.x,
                    y: position.y + 1
                }) != 'grass';
            case 'left':
                return gGameEngine.getTileMaterial({
                    x: position.x - 1,
                    y: position.y
                }) != 'grass';
            case 'right':
                return gGameEngine.getTileMaterial({
                    x: position.x + 1,
                    y: position.y
                }) != 'grass';
            default:
                return false;
        }

    }

    // detect if move={0, 0}
    isStrictPosition() {
        return this.move.x === 0 && this.move.y === 0;
    }

    // detect player collision with enemies
    detectPlayerCollision(position) {
        const player = {};
        player.left = position.x;
        player.top = position.y;
        player.right = player.left + 28;
        player.bottom = player.top + 28;

        // Check possible collision with active enemy
        const activeEnemy = {};
        activeEnemy.left = this.bmp.x;
        activeEnemy.top = this.bmp.y;
        activeEnemy.right = activeEnemy.left + this.size.w;
        activeEnemy.bottom = activeEnemy.top + this.size.h;

        if (gGameEngine.intersectRect(player, activeEnemy)) {
            return true;
        }
        return false;
    }

    // detect player AI collision with enemies
    detectPlayerAICollision(position) {
        const player = {};
        player.left = position.x;
        player.top = position.y;
        player.right = player.left + 28;
        player.bottom = player.top + 28;

        // Check possible collision with active enemy
        const activeEnemy = {};
        activeEnemy.left = this.bmp.x;
        activeEnemy.top = this.bmp.y;
        activeEnemy.right = activeEnemy.left + this.size.w;
        activeEnemy.bottom = activeEnemy.top + this.size.h;

        if (gGameEngine.intersectRect(player, activeEnemy)) {
            return true;
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
