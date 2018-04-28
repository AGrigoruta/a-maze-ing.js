import gGameEngine from './GameEngine.js';
import gInputEngine from './InputEngine.js';
import Utils from './Utils.js';
import { socket, multiplayer } from './Multiplayer.js';

export default class Player {

    constructor(position, controls, id) {
        this.id = 0;
        this.velocity = 3;
        this.wood = 0;
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

        var img = gGameEngine.playerBoyImg;

        var spriteSheet = new createjs.SpriteSheet({
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
        var pixels = Utils.convertToBitmapPosition(position);
        this.bmp.x = pixels.x;
        this.bmp.y = pixels.y;

        gGameEngine.stage.addChild(this.bmp);

    }

    update() {

        if (!this.alive) {
            //this.fade();
            return;
        }
        if (gGameEngine.menu.visible) {
            return;
        }
        var position = { x: this.bmp.x, y: this.bmp.y };
        var direction;
        var dirX = 0;
        var dirY = 0;
        if (gInputEngine.actions[this.controls.up]) {
            direction = 'up';
            this.animate('up');
            position.y -= this.velocity;
            dirY = -1;
        } else if (gInputEngine.actions[this.controls.down]) {
            this.animate('down');
            direction = 'down';
            position.y += this.velocity;
            dirY = 1;
        } else if (gInputEngine.actions[this.controls.left]) {
            this.animate('left');
            direction = 'left';
            position.x -= this.velocity;
            dirX = -1;
        } else if (gInputEngine.actions[this.controls.right]) {
            this.animate('right');
            direction = 'right';
            position.x += this.velocity;
            dirX = 1;
        } else {
            direction = 'idle';
            this.animate('idle');
        }

        if (position.x != this.bmp.x || position.y != this.bmp.y) {
            if (this.detectWallCollision(position)) {
                // If we are on the corner, move to the aisle
                var cornerFix = this.getCornerFix(dirX, dirY);
                if (cornerFix) {
                    var fixX = 0;
                    var fixY = 0;
                    if (dirX) {
                        fixY = (cornerFix.y - this.bmp.y) > 0 ? 1 : -1;
                    } else {
                        fixX = (cornerFix.x - this.bmp.x) > 0 ? 1 : -1;
                    }
                    this.bmp.x += fixX * this.velocity;
                    this.bmp.y += fixY * this.velocity;
                    this.updatePosition();
                }
            } else {
                this.bmp.x = position.x;
                this.bmp.y = position.y;
                this.updatePosition();
            }

        }

        if (this.detectEnemyCollision()) {
            this.die();
        }
        if (this.wood < 5) {
            this.handleWoodCollision();
        }
        if (this.didWin(position, this.wood)) {
            gGameEngine.gameOver('win');
        }

        multiplayer.sendCurrentPosition(position, direction);

    }

    updateOpponent(bmp, direction) {

        if (gGameEngine.menu.visible) {
            return;
        }

        var position = { x: bmp.x, y: bmp.y };

        var dirX = 0;
        var dirY = 0;

        if (direction === 'up') {
            this.animate('up');
            position.y -= this.velocity;
            dirY = -1;
        } else if (direction === 'down') {
            this.animate('down');
            position.y += this.velocity;
            dirY = 1;
        } else if (direction === 'left') {
            this.animate('left');
            position.x -= this.velocity;
            dirX = -1;
        } else if (direction === 'right') {
            this.animate('right');
            position.x += this.velocity;
            dirX = 1;
        } else {
            this.animate('idle');
        }

        this.bmp.x = position.x;
        this.bmp.y = position.y;
        this.updatePosition();

        if (this.wood < 5) {
            this.handleWoodCollision(Utils.convertToEntityPosition(position));
        }

    }

    /**
     * Checks whether we are on corner to target position.
     * Returns position where we should move before we can go to target.
     */
    getCornerFix(dirX, dirY) {
        var edgeSize = 30;

        // fix position to where we should go first
        var position = {};

        // possible fix position we are going to choose from
        var pos1 = { x: this.position.x + dirY, y: this.position.y + dirX };
        var bmp1 = Utils.convertToBitmapPosition(pos1);

        var pos2 = { x: this.position.x - dirY, y: this.position.y - dirX };
        var bmp2 = Utils.convertToBitmapPosition(pos2);

        // in front of current position
        if (gGameEngine.getTileMaterial({ x: this.position.x + dirX, y: this.position.y + dirY }) == 'grass') {
            position = this.position;
        }
        // right bottom
        // left top
        else if (gGameEngine.getTileMaterial(pos1) == 'grass'
            && Math.abs(this.bmp.y - bmp1.y) < edgeSize && Math.abs(this.bmp.x - bmp1.x) < edgeSize) {
            if (gGameEngine.getTileMaterial({ x: pos1.x + dirX, y: pos1.y + dirY }) == 'grass') {
                position = pos1;
            }
        }
        // right top
        // left bottom
        else if (gGameEngine.getTileMaterial(pos2) == 'grass'
            && Math.abs(this.bmp.y - bmp2.y) < edgeSize && Math.abs(this.bmp.x - bmp2.x) < edgeSize) {
            if (gGameEngine.getTileMaterial({ x: pos2.x + dirX, y: pos2.y + dirY }) == 'grass') {
                position = pos2;
            }
        }

        if (position.x && gGameEngine.getTileMaterial(position) == 'grass') {
            return Utils.convertToBitmapPosition(position);
        }
    }

    /**
     * Calculates and updates entity position according to its actual bitmap position
     */
    updatePosition() {
        this.position = Utils.convertToEntityPosition(this.bmp);
    }


    /**
     * Returns true when collision is detected and we should not move to target position.
     */
    detectWallCollision(position) {
        var player = {};
        player.left = position.x;
        player.top = position.y;
        player.right = player.left + this.size.w;
        player.bottom = player.top + this.size.h;

        // Check possible collision with all wall and wood tiles
        var tiles = gGameEngine.tiles;
        for (var i = 0; i < tiles.length; i++) {
            var tilePosition = tiles[i].position;

            var tile = {};
            tile.left = tilePosition.x * gGameEngine.tileSize + 25;
            tile.top = tilePosition.y * gGameEngine.tileSize + 20;
            tile.right = tile.left + gGameEngine.tileSize - 30;
            tile.bottom = tile.top + gGameEngine.tileSize - 30;

            if (gGameEngine.intersectRect(player, tile)) {
                return true;
            }
        }
        return false;
    }

    didWin(position, woodCount) {
        var player = {};
        player.left = position.x;
        player.top = position.y;
        player.right = player.left + this.size.w;
        player.bottom = player.top + this.size.h;

        // Check possible collision with all wall and wood tiles
        var tiles = gGameEngine.towerEdgeTiles;
        for (var i = 0; i < tiles.length; i++) {
            var tilePosition = tiles[i].position;

            var tile = {};
            tile.left = tilePosition.x * gGameEngine.tileSize + 25;
            tile.top = tilePosition.y * gGameEngine.tileSize + 20;
            tile.right = tile.left + gGameEngine.tileSize - 30;
            tile.bottom = tile.top + gGameEngine.tileSize - 30;

            if (gGameEngine.intersectRect(player, tile) && woodCount === 5) {
                return true;
            }
        }
        return false;
    }

    detectEnemyCollision(pos = null) {
        const position = pos || this.position;
        if (pos) {
            console.log('position');
            console.log(position);
        }

        var enemies = gGameEngine.enemies;
        for (var i = 0; i < enemies.length; i++) {
            var enemy = enemies[i];
            if (pos) {
                console.log(enemy.position);

            }

            var collision = enemy.position.x == position.x && enemy.position.y == position.y;
            if (collision) {
                return true;
            }
        }
        return false;
    }

    /**
     * Checks whether we have got bonus and applies it.
     */
    handleWoodCollision(pos = null) {
        const position = pos || this.position;
        for (var i = 0; i < gGameEngine.woods.length; i++) {
            var wood = gGameEngine.woods[i];
            if (Utils.comparePositions(wood.position, position)) {
                this.wood += 1;
                wood.destroy();
            }
        }
    }

    /**
     * Changes animation if requested animation is not already current.
     */
    animate(animation) {
        if (!this.bmp.currentAnimation || this.bmp.currentAnimation.indexOf(animation) === -1) {
            this.bmp.gotoAndPlay(animation);
        }
    }

    die(server) {
        this.alive = false;
        if (!server) multiplayer.playerDied();
        if (gGameEngine.countPlayersAlive() == 0) {
            gGameEngine.gameOver('Game Over');
        }

        this.bmp.gotoAndPlay('dead');
        this.fade();

    }

    fade() {
        var timer = 0;
        var bmp = this.bmp;
        var fade = setInterval(function () {
            timer++;

            if (timer > 30) {
                bmp.alpha -= 0.05;
            }
            if (bmp.alpha <= 0) {
                clearInterval(fade);
            }

        }, 30);
    }
}