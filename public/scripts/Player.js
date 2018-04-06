import gGameEngine from './GameEngine.js';
import gInputEngine from './InputEngine.js';
import Utils from './Utils.js';
import Wood from './Wood.js';

export default class Player {

    constructor(position, controls, id) {
        this.id = 0;
        this.velocity = 2;
        this.woodNr = 0;
        this.open = false;
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
            frames: {
                width: this.size.w,
                height: this.size.h,
                regX: 10,
                regY: 12
            },
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
            gGameEngine.removePlayerScore();
            return;
        }
        const position = {
            x: this.bmp.x,
            y: this.bmp.y
        };

        let dirX = 0;
        let dirY = 0;
        if (gInputEngine.actions[this.controls.up]) {
            this.animate('up');
            position.y -= this.velocity;
            dirY = -1;
        } else if (gInputEngine.actions[this.controls.down]) {
            this.animate('down');
            position.y += this.velocity;
            dirY = 1;
        } else if (gInputEngine.actions[this.controls.left]) {
            this.animate('left');
            position.x -= this.velocity;
            dirX = -1;
        } else if (gInputEngine.actions[this.controls.right]) {
            this.animate('right');
            position.x += this.velocity;
            dirX = 1;
        } else {
            this.animate('idle');
        }

        if (position.x != this.bmp.x || position.y != this.bmp.y) {
            if (this.detectWallCollision(position)) {
                // If we are on the corner, move to the aisle
                let cornerFix = this.getCornerFix(dirX, dirY);
                if (cornerFix) {
                    let fixX = 0;
                    let fixY = 0;
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
            // Wood collision
            this.detectWoodCollision(position);

            if (this.open) {
                this.detectEndPosition();
                this.detectWin();
            } else {
                gGameEngine.playerScore(this.woodNr);
                gGameEngine.stage.getChildByName("score");
            }
        }
    }


    // Checks whether we are on corner to target position. Returns position where we should move before we can go to target.
    getCornerFix(dirX, dirY) {
        const edgeSize = 30;

        // fix position to where we should go first
        let position = {};

        // possible fix position we are going to choose from
        const pos1 = {
            x: this.position.x + dirY,
            y: this.position.y + dirX
        };
        const bmp1 = Utils.convertToBitmapPosition(pos1);

        const pos2 = {
            x: this.position.x - dirY,
            y: this.position.y - dirX
        };
        const bmp2 = Utils.convertToBitmapPosition(pos2);

        // in front of current position
        if (gGameEngine.getTileMaterial({
                x: this.position.x + dirX,
                y: this.position.y + dirY
            }) == 'grass') {
            position = this.position;
        }
        // right bottom
        // left top
        else if (gGameEngine.getTileMaterial(pos1) == 'grass' &&
            Math.abs(this.bmp.y - bmp1.y) < edgeSize && Math.abs(this.bmp.x - bmp1.x) < edgeSize) {
            if (gGameEngine.getTileMaterial({
                    x: pos1.x + dirX,
                    y: pos1.y + dirY
                }) == 'grass') {
                position = pos1;
            }
        }
        // right top
        // left bottom
        else if (gGameEngine.getTileMaterial(pos2) == 'grass' &&
            Math.abs(this.bmp.y - bmp2.y) < edgeSize && Math.abs(this.bmp.x - bmp2.x) < edgeSize) {
            if (gGameEngine.getTileMaterial({
                    x: pos2.x + dirX,
                    y: pos2.y + dirY
                }) == 'grass') {
                position = pos2;
            }
        }

        if (position.x && gGameEngine.getTileMaterial(position) == 'grass') {
            return Utils.convertToBitmapPosition(position);
        }
    }


    // Calculates and updates entity position according to its actual bitmap position
    updatePosition() {
        this.position = Utils.convertToEntityPosition(this.bmp);
    }


    // Returns true when collision is detected and we should not move to target position

    detectWallCollision(position) {
        const player = {};
        player.left = position.x;
        player.top = position.y;
        player.right = player.left + this.size.w;
        player.bottom = player.top + this.size.h;

        // Check possible collision with all wall and wood tiles
        const tiles = gGameEngine.tiles;
        for (let i = 0; i < tiles.length; i++) {
            const tilePosition = tiles[i].position;

            const tile = {};
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

    // =============== My code ========================
    // ============== Collect wood ====================

    // Detect wood collision
    detectWoodCollision(position) {
        const player = {};
        player.left = position.x;
        player.top = position.y;
        player.right = player.left + this.size.w;
        player.bottom = player.top + this.size.h;

        const woods = gGameEngine.woods;
        for (let i = 0; i < woods.length; i++) {
            const woodPosition = woods[i].position;

            const wood = {};
            wood.left = woodPosition.x * gGameEngine.tileSize + 25;
            wood.top = woodPosition.y * gGameEngine.tileSize + 20;
            wood.right = wood.left + gGameEngine.tileSize - 30;
            wood.bottom = wood.top + gGameEngine.tileSize - 30;

            if (gGameEngine.intersectRect(player, wood)) {
                this.woodNr++;
                gGameEngine.stage.removeChild(gGameEngine.woods[i].bmp);
                gGameEngine.woods.splice(i, 1);
                if (this.woodNr > 2 && !this.open) {
                    this.open = true;
                    gGameEngine.getKey();
                }
            }
        }
    }

    detectEndPosition() {
        if (this.position.x === gGameEngine.tilesX - 2 && this.position.y === 10) {
            
            gGameEngine.openTower(this);
        }
    }

    detectWin() {
        if (this.position.x === gGameEngine.tilesX - 1 && this.position.y === 10) {
            gGameEngine.win();
        }
    }

    // Changes animation if requested animation is not already current
    animate(animation) {
        if (!this.bmp.currentAnimation || this.bmp.currentAnimation.indexOf(animation) === -1) {
            this.bmp.gotoAndPlay(animation);
        }
    }
}
