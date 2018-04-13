import gInputEngine from './InputEngine.js';
import Tile from './Tile.js';
import Princess from './Princess.js';
import Player from './Player.js';
import PlayerAI from './PlayerAI.js';
import Wood from './Wood.js';
import Enemy from './Enemy.js';

class GameEngine {
    constructor() {
        // Canvas
        this.stage = null;

        // Environment Parameters
        this.fps = 60;
        this.tileSize = 32;
        this.tilesX = 41;
        this.tilesY = 21;
        this.size = {
            w: this.tileSize * (this.tilesX + 4),
            h: this.tileSize * this.tilesY
        };

        // Asset Objects
        this.playerBoyImg = null;
        this.princessImg = null;
        this.enemyImg = null;
        this.woodImg = null;
        this.tilesImgs = {};
        this.enemyNumber = 0;

        // Environment Arrays
        this.players = [];
        this.enemies = [];
        this.woods = [];
        this.tiles = [];
        this.grassTiles = [];
        this.towerEdgeTiles = [];
        this.playerAI = null;
        this.end = false;
    }

    load() {
        // Init canvas
        this.stage = new createjs.Stage("game");

        // Load assets
        const queue = new createjs.LoadQueue();
        const that = this;
        queue.addEventListener('complete', () => {
            that.playerBoyImg = queue.getResult('player');
            that.princessImg = queue.getResult('princess');
            that.enemyImg = queue.getResult('enemy');
            that.woodImg = queue.getResult('wood');
            that.tilesImgs.grass = queue.getResult('tile_grass');
            that.tilesImgs.wall = queue.getResult('tile_wall');
            that.setup();
        });
        queue.loadManifest([
            {
                id: 'player',
                src: 'img/george.png'
            },
            {
                id: 'princess',
                src: 'img/betty.png'
            },
            {
                id: 'enemy',
                src: 'img/dino.png'
            },
            {
                id: 'wood',
                src: 'img/wood.png'
            },
            {
                id: 'tile_grass',
                src: 'img/tile_grass.png'
            },
            {
                id: 'tile_wall',
                src: 'img/tile_wall.png'
            }
        ]);
    }

    setup() {
        // Init input engine
        if (!gInputEngine.bindings.length) {
            gInputEngine.setup();
        }

        // Reset environment states
        this.players = [];
        this.enemies = [];
        this.woods = [];
        this.tiles = [];
        this.grassTiles = [];
        this.towerEdgeTiles = [];
        this.emptyAI = false;

        // Draw tiles
        this.drawTiles();

        // Draw easy path
        this.easyPath();

        // Add wood logs on the map
        this.drawWoods();

        // Spawn yourself
        this.spawnPlayers();
        this.score();

        // Spawn player AI
        this.playerAI = new PlayerAI({
            x: 1,
            y: gGameEngine.tilesY - 2
        });
        this.scoreAI();

        //Release the kraken!
        this.spawnEnemies();

        // Lock the princess in the tower >:(
        new Princess({
            x: this.tilesX + 1,
            y: Math.floor(this.tilesY / 2)
        });

        // Start loop
        if (!createjs.Ticker.hasEventListener('tick')) {
            createjs.Ticker.addEventListener('tick', gGameEngine.update);
            createjs.Ticker.setFPS(this.fps);
        }
    }

    update() {
        // Player
        if (!gGameEngine.end) {
            if (gGameEngine.players.length) {
                for (let i = 0; i < gGameEngine.players.length; i++) {
                    const player = gGameEngine.players[i];
                    if (!player.alive) {
                        gGameEngine.players.splice(i, 1);
                    }
                    player.update();
                }
            }

            // Enemies
            for (let i = 0; i < gGameEngine.enemies.length; i++) {
                const enemy = gGameEngine.enemies[i];
                enemy.update();
            }

            // player AI
            if (!gGameEngine.players.length && !gGameEngine.playerAI.alive) {
                gGameEngine.endGame();
                gGameEngine.end = true;
            }
            if (!gGameEngine.emptyAI) {
                if (gGameEngine.playerAI.alive) {
                    gGameEngine.playerAI.update();
                } else {
                    gGameEngine.removePlayerAIScore();
                    gGameEngine.emptyAI = true;
                }
            }

            // Stage
            gGameEngine.stage.update();
        }
    }

    generateMaze(x, y) {
        // Init
        const totalCells = x * y;
        const cells = new Array();
        const unvisited = new Array();
        for (let i = 0; i < y; i++) {
            cells[i] = new Array();
            unvisited[i] = new Array();
            for (let j = 0; j < x; j++) {
                cells[i][j] = [0, 0, 0, 0];
                unvisited[i][j] = true;
            }
        }

        let currentCell = [Math.floor(Math.random() * y), Math.floor(Math.random() * x)];
        const path = [currentCell];
        unvisited[currentCell[0]][currentCell[1]] = false;
        let visited = 1;

        while (visited < totalCells) {
            const pot = [
                [currentCell[0] - 1, currentCell[1], 0, 2],
                [currentCell[0], currentCell[1] + 1, 1, 3],
                [currentCell[0] + 1, currentCell[1], 2, 0],
                [currentCell[0], currentCell[1] - 1, 3, 1]
            ]
            const neighbours = new Array();

            for (let k = 0; k < 4; k++) {
                if (
                    pot[k][0] > -1 &&
                    pot[k][0] < y &&
                    pot[k][1] > -1 &&
                    pot[k][1] < x &&
                    unvisited[pot[k][0]][pot[k][1]]
                ) {
                    neighbours.push(pot[k])
                }
            }

            if (neighbours.length) {
                const next = neighbours[Math.floor(Math.random() * neighbours.length)];

                cells[currentCell[0]][currentCell[1]][next[2]] = 1;
                cells[next[0]][next[1]][next[3]] = 1;

                unvisited[next[0]][next[1]] = false;
                visited++;
                currentCell = [next[0], next[1]];
                path.push(currentCell);
            } else {
                currentCell = path.pop();
            }
        }
        return cells;
    }

    drawTiles() {
        const maze = this.generateMaze(20, 10);
        for (let i = 0; i < this.tilesY; i++) {
            for (let j = 0; j < this.tilesX; j++) {
                if (
                    i === 0 ||
                    j === 0 ||
                    i === this.tilesY - 1 ||
                    j === this.tilesX - 1 ||
                    (j % 2 === 0 && i % 2 === 0)
                ) {
                    // Walls
                    const tile = new Tile('wall', {
                        x: j,
                        y: i
                    });
                    this.stage.addChild(tile.bmp);
                    this.tiles.push(tile);
                } else if (
                    j % 2 === 1 && i % 2 === 1 && j != this.tilesX - 1 && i != this.tilesY - 1
                ) {
                    const tile = new Tile('grass', {
                        x: j,
                        y: i
                    });
                    this.stage.addChild(tile.bmp);
                    this.grassTiles.push(tile);
                }
            }
        }

        const verticalTowerEdge = (Math.floor(this.tilesY / 2)) - 2;

        // Draw princess tower
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 4; j++) {
                if (
                    i === 0 ||
                    j === 0 ||
                    i >= 4 ||
                    j === 3
                ) {
                    const tile = new Tile('wall', {
                        x: this.tilesX - 1 + j,
                        y: verticalTowerEdge + i
                    });
                    if (j === 0) {
                        this.towerEdgeTiles.push(tile);
                    } else {
                        this.stage.addChild(tile.bmp);
                    }
                } else {
                    const tile = new Tile('grass', {
                        x: this.tilesX - 1 + j,
                        y: verticalTowerEdge + i
                    });
                    this.stage.addChild(tile.bmp);
                }
            }
        }

        // Fill the void with grass, make the world pretty
        for (let i = 0; i < this.tilesY; i++) {
            for (let j = 0; j < 4; j++) {
                if (i < verticalTowerEdge || i > verticalTowerEdge + 5) {
                    const tile = new Tile('grass', {
                        x: this.tilesX + j,
                        y: i
                    });
                    this.stage.addChild(tile.bmp);
                }
            }
        }

        for (let i = 0; i < maze.length; i++) {
            for (let j = 0; j < maze[0].length; j++) {
                if (maze[i][j][1] === 0) {
                    const tile = new Tile('wall', {
                        x: ((2 * j) + 2),
                        y: ((2 * i) + 1)
                    });
                    this.stage.addChild(tile.bmp);
                    this.tiles.push(tile);
                } else {
                    const tile = new Tile('grass', {
                        x: ((2 * j) + 2),
                        y: ((2 * i) + 1)
                    });
                    this.stage.addChild(tile.bmp);
                    this.grassTiles.push(tile);
                }
                if (maze[i][j][2] === 0) {
                    const tile = new Tile('wall', {
                        x: ((2 * j) + 1),
                        y: ((2 * i) + 2)
                    });
                    this.stage.addChild(tile.bmp);
                    this.tiles.push(tile);
                } else {
                    const tile = new Tile('grass', {
                        x: ((2 * j) + 1),
                        y: ((2 * i) + 2)
                    });
                    this.stage.addChild(tile.bmp);
                    this.grassTiles.push(tile);
                }
            }
        }
    }



    drawWoods() {
        const available = [];

        for (let i = 0; i < this.grassTiles.length; i++) {
            available.push(this.grassTiles[i]);
        }

        available.sort(() => {
            return 0.5 - Math.random();
        });

        for (let i = 0; i < 6; i++) {
            const tile = available[i];
            const wood = new Wood(tile.position);
            this.woods.push(wood);
        }
    }

    spawnPlayers() {
        this.players = [];

        const player = new Player({
            x: 1,
            y: 1
        });
        this.players.push(player);

    }

    spawnEnemies() {
        this.enemies = [];
        const availablePathwayStart = [];

        this.grassTiles.sort((a, b) => {
            if (a.position.y === b.position.y) return a.position.x - b.position.x
            return a.position.y - b.position.y
        });

        for (let i = 0; i < this.grassTiles.length - 5; i++) {
            if (
                (this.grassTiles[i].position.y === this.grassTiles[i + 1].position.y &&
                    this.grassTiles[i].position.y === this.grassTiles[i + 2].position.y &&
                    this.grassTiles[i].position.y === this.grassTiles[i + 3].position.y &&
                    this.grassTiles[i].position.y === this.grassTiles[i + 4].position.y) &&

                (this.grassTiles[i + 4].position.x - this.grassTiles[i + 3].position.x === 1 &&
                    this.grassTiles[i + 3].position.x - this.grassTiles[i + 2].position.x === 1 &&
                    this.grassTiles[i + 2].position.x - this.grassTiles[i + 1].position.x === 1 &&
                    this.grassTiles[i + 1].position.x - this.grassTiles[i].position.x === 1)
            ) {
                availablePathwayStart.push(i + 4);
                i += 5;
            }
        }

        availablePathwayStart.sort(() => {
            return 0.5 - Math.random();
        });

        for (let i = 0; i < this.enemyNumber; i++) {
            const startingPosition = this.grassTiles[availablePathwayStart[i]].position;
            const enemy = new Enemy(startingPosition);
            this.enemies.push(enemy);
        }
    }


    // Checks whether two rectangles intersect.
    intersectRect(a, b) {
        return (
            a.left <= b.right &&
            b.left <= a.right &&
            a.top <= b.bottom &&
            b.top <= a.bottom
        );
    }


    // Returns tile at given position.
    getTile(position) {
        for (let i = 0; i < this.tiles.length; i++) {
            const tile = this.tiles[i];
            if (tile.position.x == position.x && tile.position.y == position.y) {
                return tile;
            }
        }
    }

    // Returns tile material at given position.
    getTileMaterial(position) {
        const tile = this.getTile(position);
        return tile ? tile.material : 'grass';
    }

    // ====================== My code ===============================
    // ===================== Draw easy path =========================
    easyPath() {
        let availablePath = [];

        this.tiles.sort((a, b) => {
            if (a.position.y === b.position.y) return a.position.x - b.position.x
            return a.position.y - b.position.y
        });

        for (let i = 0; i < this.tiles.length - 5; i++) {
            if (this.tiles[i].position.x != 0 &&
                this.tiles[i].position.x != this.tilesX - 1 &&
                this.tiles[i].position.y != 0 &&
                this.tiles[i].position.y != this.tilesY - 1) {
                if (
                    (this.tiles[i].position.y === this.tiles[i + 1].position.y &&
                        this.tiles[i].position.y === this.tiles[i + 2].position.y &&
                        this.tiles[i].position.y === this.tiles[i + 3].position.y &&
                        this.tiles[i].position.y === this.tiles[i + 4].position.y) &&

                    (this.tiles[i + 4].position.x - this.tiles[i + 3].position.x === 1 &&
                        this.tiles[i + 3].position.x - this.tiles[i + 2].position.x === 1 &&
                        this.tiles[i + 2].position.x - this.tiles[i + 1].position.x === 1 &&
                        this.tiles[i + 1].position.x - this.tiles[i].position.x === 1)
                ) {
                    availablePath.push(i + 2);
                    i += 5;
                }
            }
        }

        availablePath.sort(() => {
            return 0.5 - Math.random();
        });

        // ======= Replace wall tiles with grass if no wall up & down, remove wall tiles from array, push grass in array

        let nrTiles = 0,
            saveTiles = [];
        for (let i = 1; i < availablePath.length; i++) {

            const tilePosition = this.tiles[availablePath[i]].position;
            if (this.getTileMaterial({
                    x: tilePosition.x,
                    y: tilePosition.y - 1
                }) === 'grass' &&
                this.getTileMaterial({
                    x: tilePosition.x,
                    y: tilePosition.y + 1
                }) === 'grass' &&
                nrTiles < 17) {
                nrTiles++;
                saveTiles.push(availablePath[i]);
                const tile = new Tile('grass', {
                    x: tilePosition.x,
                    y: tilePosition.y
                });
                this.stage.addChild(tile.bmp);
                this.grassTiles.push(tile);
            }
        }

        saveTiles.sort((a, b) => {
            return a - b;
        });
        for (let i = 0; i < saveTiles.length; i++) {
            this.tiles.splice(saveTiles[i], 1);
            for (let i = 0; i < saveTiles.length; i++) {
                saveTiles[i]--;
            }
        }

        // if exist, remove the wall from the entrance of the princess tower
        if (this.getTileMaterial({
                x: this.tilesX - 2,
                y: 10
            }) === "wall") {
            this.removeTile({
                x: this.tilesX - 2,
                y: 10
            });
            const tile = new Tile('grass', {
                x: this.tilesX - 2,
                y: 10
            });
            this.stage.addChild(tile.bmp);
            this.grassTiles.push(tile);
        }
    }

    // remove wall from tiles
    removeTile(position) {
        for (let i = 0; i < this.tiles.length; i++) {
            const tile = this.tiles[i];
            if (tile.position.x == position.x && tile.position.y == position.y) {
                this.tiles.splice(i, 1);
            }
        }
    }

    // Score text
    score() {

        this.text0 = new createjs.Text("Player", "bold 17px Arial", "black");
        this.text0.set({
            x: this.tilesX * this.tileSize + 3,
            y: 5
        });
        this.stage.addChild(this.text0);

        const playerImg = new Player({
            x: this.tilesX,
            y: 1
        });
        this.stage.addChild(playerImg.bmp);

        this.text1 = new createjs.Text("x", "bold 17px Arial", "black");
        this.text1.set({
            x: (this.tilesX + 1) * this.tileSize + 3,
            y: this.tileSize + 5
        });
        this.stage.addChild(this.text1);

        this.playerWood = new Wood({
            name: "wood",
            x: this.tilesX + 2,
            y: 1
        });
        this.stage.addChild(this.playerWood.bmp);
    }

    // Player wood text
    playerScore(woodNr) {
        if (this.stage.getChildByName("score")) {
            this.stage.removeChild(this.scoreP);
        }
        this.scoreP = new createjs.Text(woodNr, "bold 17px Arial", "black").set({
            name: "score",
            x: (this.tilesX + 1) * this.tileSize + 15,
            y: this.tileSize + 5
        });
        this.stage.addChild(this.scoreP);
    }

    // Player death text
    removePlayerScore() {
        this.stage.removeChild(this.text1);
        this.stage.removeChild(this.scoreP);
        this.stage.removeChild(this.playerWood.bmp);
        this.stage.removeChild(this.textKey);

        this.text2 = new createjs.Text("dead", "bold 16px Arial", "black");
        this.text2.set({
            x: (this.tilesX + 1) * this.tileSize + 3,
            y: this.tileSize + 5
        });
        this.stage.addChild(this.text2);
    }

    // Game over text
    endGame() {
        this.text3 = new createjs.Text("GAME OVER", "97px Arial", "red");
        this.text3.set({
            x: (this.tilesX / 2 - 8) * this.tileSize,
            y: this.tilesY / 2 * this.tileSize
        });
        this.stage.addChild(this.text3);
        document.getElementById('reset').textContent = 'Start';
    }

    // Player tower key text
    getKey() {
        this.stage.removeChild(this.text1);
        this.stage.removeChild(this.scoreP);
        this.stage.removeChild(this.playerWood.bmp);

        this.textKey = new createjs.Text("x 1 Key", "17px Arial", "black");
        this.textKey.set({
            x: (this.tilesX + 1) * this.tileSize + 3,
            y: this.tileSize + 5
        });
        this.stage.addChild(this.textKey);
    }

    // replace wall with grass at princess tower
    openTower(player) {
        this.removeTile({
            x: this.tilesX - 1,
            y: 10
        });
        const tile = new Tile('grass', {
            x: this.tilesX - 1,
            y: 10
        });
        this.stage.addChild(tile.bmp);
        this.grassTiles.push(tile);
        this.stage.removeChild(player.bmp);
        this.stage.addChild(player.bmp);
    }

    // Win the game message
    win(player) {
        this.text3 = new createjs.Text(`The winner is ${player}`, "bold 77px Arial", "#00FF33");
        this.text3.set({
            x: 10 * this.tileSize,
            y: this.tilesY / 2 * this.tileSize
        });
        this.stage.addChild(this.text3);
        document.getElementById('reset').textContent = 'Start';
        this.end = true;
    }

    // ====================== player AI ===========================

    // PlayerAI wood text
    playerScoreAI(woodNr) {
        if (this.stage.getChildByName("scoreAI")) {
            this.stage.removeChild(this.scorePlayerAI);
        }
        this.scorePlayerAI = new createjs.Text(woodNr, "bold 17px Arial", "black").set({
            name: "scoreAI",
            x: (this.tilesX + 1) * this.tileSize + 15,
            y: 15 * this.tileSize + 7
        });
        this.stage.addChild(this.scorePlayerAI);
    }

    // Score player AI text
    scoreAI() {

        this.text10 = new createjs.Text("CPU", "bold 17px Arial", "black");
        this.text10.set({
            x: this.tilesX * this.tileSize + 3,
            y: 14 * this.tileSize + 5
        });
        this.stage.addChild(this.text10);

        const playerImg = new PlayerAI({
            x: this.tilesX,
            y: 15
        });
        this.stage.addChild(playerImg.bmp);

        this.text11 = new createjs.Text("x", "bold 17px Arial", "black");
        this.text11.set({
            name: "txt11",
            x: (this.tilesX + 1) * this.tileSize + 3,
            y: 15 * this.tileSize + 7
        });
        this.stage.addChild(this.text11);

        this.playerAIWood = new Wood({
            name: "woodAI",
            x: this.tilesX + 2,
            y: 15
        });
        this.stage.addChild(this.playerAIWood.bmp);
    }

    // Player AI tower key text
    getKeyAI() {
        this.stage.removeChild(this.text11);
        this.stage.removeChild(this.scorePlayerAI);
        this.stage.removeChild(this.playerAIWood.bmp);

        this.textKeyAI = new createjs.Text("x 1 Key", "bold 17px Arial", "black");
        this.textKeyAI.set({
            name: "KeyAI",
            x: (this.tilesX + 1) * this.tileSize + 3,
            y: 15 * this.tileSize
        });
        this.stage.addChild(this.textKeyAI);
    }

    // Player AI death text
    removePlayerAIScore() {
        this.stage.removeChild(this.text11);
        this.stage.removeChild(this.scorePlayerAI);
        this.stage.removeChild(this.playerAIWood.bmp);
        this.stage.removeChild(this.textKeyAI);

        this.text12 = new createjs.Text("dead", "bold 16px Arial", "black");
        this.text12.set({
            x: (this.tilesX + 1) * this.tileSize + 3,
            y: 15 * this.tileSize
        });
        this.stage.addChild(this.text12);
    }
}

const gGameEngine = new GameEngine();
export default gGameEngine;
