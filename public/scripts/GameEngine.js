import gInputEngine from './InputEngine.js';
import Tile from './Tile.js';
import Princess from './Princess.js';

class GameEngine {
    constructor() {
        // Canvas
        this.stage = null;

        // Environment Parameters
        this.fps = 60;
        this.tileSize = 32;
        this.tilesX = 41;
        this.tilesY = 21;
        this.princess = null;
        this.size = {
            w: this.tileSize * (this.tilesX + 4),
            h: this.tileSize * this.tilesY
        };

        // Asset Objects
        this.tilesImgs = {};

        // Environment Arrays
        this.tiles = [];
        this.grassTiles = [];
        this.towerEdgeTiles = [];
        this.maze = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ];

    }

    load() {
        // Init canvas
        this.stage = new createjs.Stage("game");

        // Load assets
        const queue = new createjs.LoadQueue();
        const that = this;
        queue.addEventListener('complete', () => {
            that.princessImg = queue.getResult('princess');
            that.tilesImgs.grass = queue.getResult('tile_grass');
            that.tilesImgs.wall = queue.getResult('tile_wall');
            that.setup();
        });
        queue.loadManifest([
            {
                id: 'princess',
                src: 'img/betty.png'
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
        this.tiles = [];
        this.grassTiles = [];
        this.towerEdgeTiles = [];

        // Draw tiles
        this.drawTiles();

        // Lock the princess in the tower >:(
        this.princess = new Princess({
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
        if (gInputEngine.actions['up']) {
            if (gGameEngine.isValidMove(gGameEngine.princess.position, 'up')) {
                gGameEngine.princess.move.y--;
            }
        } else if (gInputEngine.actions['down']) {
            if (gGameEngine.isValidMove(gGameEngine.princess.position, 'down')) {
                gGameEngine.princess.move.y++;
            }
        } else if (gInputEngine.actions['left']) {
            if (gGameEngine.isValidMove(gGameEngine.princess.position, 'left')) {
                gGameEngine.princess.move.x--;
            }
        } else if (gInputEngine.actions['right']) {
            if (gGameEngine.isValidMove(gGameEngine.princess.position, 'right')) {
                gGameEngine.princess.move.x++;
            }
        }
        gGameEngine.princess.movePrincess(gGameEngine.princess.position, gGameEngine.princess.move);

        // Stage
        gGameEngine.stage.update();
    }

    drawTiles() {
        // Draw Maze from hardcoded Array
        for (let i = 0; i < this.tilesY; i++) {
            for (let j = 0; j < this.tilesX; j++) {
                if (this.maze[i][j] === 1) {
                    // Wall tiles
                    const tile = new Tile('wall', {
                        x: j,
                        y: i
                    });
                    this.stage.addChild(tile.bmp);
                    this.tiles.push(tile);
                } else {
                    // Grass tiles
                    const tile = new Tile('grass', {
                        x: j,
                        y: i
                    });
                    this.stage.addChild(tile.bmp);
                    this.grassTiles.push(tile);
                }
            }
        }

        // Starting point for tower
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
    }

    isValidMove(position, dir) {
        // Starting point for tower
        const verticalTowerEdge = (Math.floor(this.tilesY / 2)) - 2;
        
        switch (dir) {
            case 'up': return position.y > verticalTowerEdge;
            case 'down': return position.y < verticalTowerEdge + 3;
            case 'left': return position.x >= this.tilesX;
            case 'right': return position.x < this.tilesX + 1;
            default: window.alert('ERROR');
        }

    }
}

const gGameEngine = new GameEngine();
export default gGameEngine;
