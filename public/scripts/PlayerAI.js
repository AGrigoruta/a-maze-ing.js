import gGameEngine from './GameEngine.js';
import gInputEngine from './InputEngine.js';
import Utils from './Utils.js';
import Wood from './Wood.js';

export default class PlayerAI {

    constructor(position) {
        this.velocity = 2;
        this.woodNr = 0;
        this.open = false;
        this.size = {
            w: 48,
            h: 48
        };
        this.move = {
            x: 0,
            y: 0
        };
        this.alive = true;

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

        this.direction = 'idle';
        this.maze = [];
        this.unvisited = [];
        this.savePath = [];
        this.options = ['up', 'right', 'down', 'left'];
        this.foundWood = false;
        this.foundEnd = false;
        this.towerMove = ['idle', 'right', 'right'];
        this.count = 0;
        this.searchDepth = 4;

        gGameEngine.stage.addChild(this.bmp);
    }

    update() {
        if (!this.alive) {
            gGameEngine.removePlayerAIScore();
            return;
        }
        this.moveAI();
    }

    moveAI() {
        if (this.isStrictPosition()) {
            this.pickWood(this.position);
            this.direction = this.nextMoveAI(this.position);
            if (this.open) {
                if (this.detectEndPosition()) {
                    this.direction = 'right';
                }
                this.detectWin();
            } else {
                gGameEngine.playerScoreAI(this.woodNr);
                gGameEngine.stage.getChildByName("scoreAI");
            }
        }
        // Move AI
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
            case 'idle':
                break;
        }

        const pixels = Utils.convertToBitmapPosition(this.position);
        this.bmp.x = pixels.x + this.move.x;
        this.bmp.y = pixels.y + this.move.y;

        this.animate(this.direction);

        this.updatePosition();
    }

    // update position after move
    updatePosition() {
        this.position.x = Math.floor(this.bmp.x / gGameEngine.tileSize);
        this.position.y = Math.floor(this.bmp.y / gGameEngine.tileSize);
        this.move.x = this.bmp.x % gGameEngine.tileSize;
        this.move.y = this.bmp.y % gGameEngine.tileSize;
    }

    // detect if move={0, 0}
    isStrictPosition() {
        return !this.move.x && !this.move.y;
    }

    // detect tower entrance
    detectEndPosition() {
        if (this.position.x === gGameEngine.tilesX - 2 && this.position.y === 10) {
            gGameEngine.openTower(this);
            return true;
        }
        return false;
    }

    // detect win condition (release the princess)
    detectWin() {
        if (this.position.x === gGameEngine.tilesX - 1 && this.position.y === 10) {
            gGameEngine.win('CPU');
        }
    }

    // Generate Maze graph
    copyMaze() {
        for (let j = 0; j < gGameEngine.tilesY; j++) {
            this.maze[j] = [];
            this.unvisited[j] = [];
            for (let k = 0; k < gGameEngine.tilesX; k++) {
                this.unvisited[j][k] = true;
                if (j === 0 || j === gGameEngine.tilesY - 1 || k === 0 || k === gGameEngine.tilesX - 1) {
                    this.maze[j][k] = false;
                } else {
                    this.maze[j][k] = true;
                }
            }
        }
        for (let j = 0; j < gGameEngine.tiles.length; j++) {
            const tile = gGameEngine.tiles[j];
            this.maze[tile.position.y][tile.position.x] = false;
        }
        for (let j = 0; j < gGameEngine.enemies.length; j++) {
            const enemy = gGameEngine.enemies[j];
            // if enemy in vecinity(distance < X) block position (false)  
            if (Math.sqrt(Math.pow(Math.abs(enemy.position.x - this.position.x), 2) + Math.pow(Math.abs(enemy.position.y - this.position.y), 2)) < this.searchDepth) {
                this.maze[enemy.position.y][enemy.position.x] = false;
            }
        }
    }

    // Get next move for every wood on map
    nextMoveAI(pos) {
        let result;
        this.copyMaze();
        // detect enemy danger
        const danger = this.detectEnemyDanger(this.position);
        if (danger) {
            return danger;
        }

        do {
            this.foundWood = false;
            this.foundEnd = false;
            if (this.open) {
                for (let option of this.options) {
                    if (this.detectEnd(pos, option)) {
                        this.foundEnd = true;
                        return option;
                    }
                }
            } else {
                // if wood in vecinity return direction to move
                for (let option of this.options) {
                    if (this.detectWoodVecinity(pos, option)) {
                        this.foundWood = true;
                        return option;
                    }
                }
            }

            // setup for new search
            result = '';
            let path = [];
            this.savePath = [];
            let endPoint = [];
            let depth = 0;
            let position = {};
            path[0] = [];
            path[0].push([0, {
                x: pos.x,
                y: pos.y
        }, 'idle']);
            this.unvisited[pos.y][pos.x] = false;

            if (this.open) {
                // Search for END path
                while (!this.foundEnd) {
                    path[depth + 1] = [];
                    for (let i = 0; i < path[depth].length; i++) {
                        position = {
                            x: path[depth][i][1].x,
                            y: path[depth][i][1].y
                        };
                        for (let option of this.options) {
                            // detect END position in vecinity
                            if (this.detectEnd(position, option)) {
                                let newPos = this.getNewPos(position, option);
                                this.foundEnd = true;
                                endPoint = [depth, i];
                                this.savePath.push([i, newPos, 'idle']);
                                break;
                            }
                        }
                        if (this.foundEnd) {
                            break;
                        } else {
                            for (let option of this.options) {
                                if (this.isValidMove(position, option)) {
                                    let newPos = this.getNewPos(position, option);
                                    path[depth + 1].push([i, newPos, option]);
                                    this.unvisited[newPos.y][newPos.x] = false;
                                }
                            }
                        }
                    }
                    depth++;
                    if (!path[depth].length && !this.foundEnd) {
                        return 'idle';
                    }
                }
            } else {
                // search for nearest wood
                while (!this.foundWood) {
                    path[depth + 1] = [];
                    for (let i = 0; i < path[depth].length; i++) {
                        position = {
                            x: path[depth][i][1].x,
                            y: path[depth][i][1].y
                        };
                        for (let option of this.options) {
                            // detect wood in vecinity
                            if (this.detectWoodVecinity(position, option)) {
                                let newPos = this.getNewPos(position, option);
                                this.foundWood = true;
                                endPoint = [depth, i];
                                this.savePath.push([i, newPos, 'idle']);
                                break;
                            }
                        }
                        if (this.foundWood) {
                            break;
                        } else {
                            for (let option of this.options) {
                                if (this.isValidMove(position, option)) {
                                    let newPos = this.getNewPos(position, option);
                                    path[depth + 1].push([i, newPos, option]);
                                    this.unvisited[newPos.y][newPos.x] = false;
                                }
                            }
                        }
                    }
                    depth++;
                    if (!path[depth].length && !this.foundWood) {
                        return 'idle';
                    }
                }
            }

            // if finds the target, saves the path to it
            if (endPoint.length) {
                depth = endPoint[0];
                let index = endPoint[1];
                for (let i = depth; i >= 0; i--) {
                    this.savePath.push(path[i][index]);
                    index = path[i][index][0];
                }
                this.savePath.reverse();
            }

            // Return next move direction from savePath
            if (this.savePath.length > 0) {
                result = this.savePath[1][2];
            } else return 'idle';
        } while (this.isDanger());
        return result;
    }

    // detect enemy danger deep 2
    detectEnemyDanger(pos) {
        let danger = [];
        let newPos, option;

        // looking for danger in the immediate vicinity
        for (option of this.options) {
            if (this.detectEnemy(pos, option)) {
                danger.push(option);
            }
        }
        if (danger.length) {
            return this.getSafeMove(danger, pos);
        }

        // looking for danger at a distance of 2
        for (option of this.options) {
            newPos = this.getNewPos(pos, option);
            if (this.isValidDirection(pos, option)) {
                for (let option2 of this.options) {
                    if (this.detectEnemy(newPos, option2)) {
                        danger.push(option);
                    }
                }
            }
        }
        if (danger.length) {
            return this.getSafeMove(danger, pos);
        }
        return '';
    }

    //Check if is danger to collision with monster next 2 moves from savePath
    isDanger() {
        for (let enemy of gGameEngine.enemies) {
            if (this.savePath.length > 1) {
                if (enemy.dirX) {
                    if (((enemy.position.x === this.savePath[1][1].x) &&
                            (enemy.position.y === this.savePath[1][1].y)) ||
                        ((enemy.position.x === this.savePath[2][1].x) &&
                            (enemy.position.y === this.savePath[2][1].y)) ||
                        ((enemy.position.x + enemy.dirX === this.savePath[1][1].x) &&
                            (enemy.position.y === this.savePath[1][1].y)) ||
                        ((enemy.position.x + 2 * enemy.dirX === this.savePath[1][1].x) &&
                            (enemy.position.y === this.savePath[1][1].y)) ||
                        ((enemy.position.x + enemy.dirX === this.savePath[2][1].x) &&
                            (enemy.position.y === this.savePath[2][1].y)) ||
                        ((enemy.position.x + 2 * enemy.dirX === this.savePath[2][1].x) &&
                            (enemy.position.y === this.savePath[2][1].y))) {
                        this.maze[this.savePath[1][1].y][this.savePath[1][1].x] = false;
                        return true;
                    }
                } else if (((enemy.position.y + enemy.dirY === this.savePath[1][1].y) &&
                        (enemy.position.x === this.savePath[1][1].x)) ||
                    ((enemy.position.y + 2 * enemy.dirY === this.savePath[1][1].y) &&
                        (enemy.position.x === this.savePath[1][1].x)) ||
                    ((enemy.position.y + enemy.dirY === this.savePath[2][1].y) &&
                        (enemy.position.x === this.savePath[2][1].x)) ||
                    ((enemy.position.y + 2 * enemy.dirY === this.savePath[2][1].y) &&
                        (enemy.position.x === this.savePath[2][1].x))) {
                    this.maze[this.savePath[1][1].y][this.savePath[1][1].x] = false;
                    return true;
                }
            } else if (this.savePath.length === 1) {
                if (enemy.dirX) {
                    if (((enemy.position.x === this.savePath[1][1].x) &&
                            (enemy.position.y === this.savePath[1][1].y)) ||
                        ((enemy.position.x + enemy.dirX === this.savePath[1][1].x) &&
                            (enemy.position.y === this.savePath[1][1].y)) ||
                        ((enemy.position.x + 2 * enemy.dirX === this.savePath[1][1].x) &&
                            (enemy.position.y === this.savePath[1][1].y))) {
                        this.maze[this.savePath[1][1].y][this.savePath[1][1].x] = false;
                        return true;
                    }
                } else if (((enemy.position.y + enemy.dirY === this.savePath[1][1].y) &&
                        (enemy.position.x === this.savePath[1][1].x)) ||
                    ((enemy.position.y + 2 * enemy.dirY === this.savePath[1][1].y) &&
                        (enemy.position.x === this.savePath[1][1].x))) {
                    this.maze[this.savePath[1][1].y][this.savePath[1][1].x] = false;
                    return true;
                }
            } else return false;
        }
    }

    // detect if wood is in the vicinity for search path
    detectWoodVecinity(position, dir) {
        for (let wood of gGameEngine.woods) {
            switch (dir) {
                case 'up':
                    if ((position.x === wood.position.x) && (position.y - 1 === wood.position.y)) return true;
                    break;
                case 'down':
                    if ((position.x === wood.position.x) && (position.y + 1 === wood.position.y)) return true;
                    break;
                case 'left':
                    if ((position.x - 1 === wood.position.x) && (position.y === wood.position.y)) return true;
                    break;
                case 'right':
                    if ((position.x + 1 === wood.position.x) && (position.y === wood.position.y)) return true;
                    break;
            }
        }
        return false;
    }

    // detect enemy
    detectEnemy(position, dir) {
        for (let enemy of gGameEngine.enemies) {
            switch (dir) {
                case 'up':
                    if ((position.x === enemy.position.x) && (position.y - 1 === enemy.position.y)) return true;
                    break;
                case 'down':
                    if ((position.x === enemy.position.x) && (position.y + 1 === enemy.position.y)) return true;
                    break;
                case 'left':
                    if ((position.x - 1 === enemy.position.x) && (position.y === enemy.position.y)) return true;
                    break;
                case 'right':
                    if ((position.x + 1 === enemy.position.x) && (position.y === enemy.position.y)) return true;
                    break;
            }
        }
        return false;
    }

    // detect end position in vecinity for search path
    detectEnd(position, dir) {
        switch (dir) {
            case 'up':
                if ((position.x === gGameEngine.tilesX - 2) && (position.y - 1 === 10)) return true;
                break;
            case 'down':
                if ((position.x === gGameEngine.tilesX - 2) && (position.y + 1 === 10)) return true;
                break;
            case 'left':
                if ((position.x - 1 === gGameEngine.tilesX - 2) && (position.y === 10)) return true;
                break;
            case 'right':
                if ((position.x + 1 === gGameEngine.tilesX - 2) && (position.y === 10)) return true;
                break;
        }
        return false;
    }

    // detect valid position 
    isValidMove(position, dir) {
        switch (dir) {
            case 'up':
                return this.maze[position.y - 1][position.x] && this.unvisited[position.y - 1][position.x];
            case 'down':
                return this.maze[position.y + 1][position.x] && this.unvisited[position.y + 1][position.x];
            case 'left':
                return this.maze[position.y][position.x - 1] && this.unvisited[position.y][position.x - 1];
            case 'right':
                return this.maze[position.y][position.x + 1] && this.unvisited[position.y][position.x + 1];
        }
    }

    // detect valid direction whitout unvisited
    isValidDirection(position, dir) {
        switch (dir) {
            case 'up':
                return this.maze[position.y - 1][position.x];
            case 'down':
                return this.maze[position.y + 1][position.x];
            case 'left':
                return this.maze[position.y][position.x - 1];
            case 'right':
                return this.maze[position.y][position.x + 1];
        }
    }

    // return random safe move direction
    getSafeMove(danger, position) {
        let move = [];
        for (let option of this.options) {
            if (!danger.includes(option) && this.isValidDirection(position, option)) {
                move.push(option);
            }
        }
        return (move.length) ? move[Math.floor(Math.random() * move.length)] : '';
    }

    //get new position
    getNewPos(pos, dir) {
        let newPos = {
            x: pos.x,
            y: pos.y
        };
        switch (dir) {
            case 'up':
                newPos.y--;
                break;
            case 'down':
                newPos.y++;
                break;
            case 'left':
                newPos.x--;
                break;
            case 'right':
                newPos.x++;
                break;
        }
        return newPos;
    }

    // pick wood if collision
    pickWood(pos) {
        for (let i = 0; i < gGameEngine.woods.length; i++) {
            const wood = gGameEngine.woods[i];
            if ((wood.position.x === pos.x) &&
                (wood.position.y === pos.y)) {
                this.woodNr++;
                gGameEngine.stage.removeChild(gGameEngine.woods[i].bmp);
                gGameEngine.woods.splice(i, 1);
                if (this.woodNr === 3) {
                    this.open = true;
                    gGameEngine.getKeyAI();
                }
            }
        }
    }

    // Changes animation if requested animation is not already current
    animate(animation) {
        if (!this.bmp.currentAnimation || this.bmp.currentAnimation.indexOf(animation) === -1) {
            this.bmp.gotoAndPlay(animation);
        }
    }
}
