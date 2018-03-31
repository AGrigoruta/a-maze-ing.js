import gInputEngine from './InputEngine.js';
import Tile from './Tile.js';
import Princess from './Princess.js';
import Player from './Player.js';
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

        // Environment Arrays
        this.players = [];
        this.enemies = [];
        this.woods = [];
        this.tiles = [];
        this.grassTiles = [];
        this.towerEdgeTiles = [];
        this.maze = [];

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
            { id: 'player', src: 'img/george.png' },
            { id: 'princess', src: 'img/betty.png' },
            { id: 'enemy', src: 'img/dino.png' },
            { id: 'wood', src: 'img/wood.png' },
            { id: 'tile_grass', src: 'img/tile_grass.png' },
            { id: 'tile_wall', src: 'img/tile_wall.png' }
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

        // Draw tiles
        this.drawTiles();

        // Add wood logs on the map
        this.drawWoods();

        // Spawn yourself
        this.spawnPlayers();

        //Release the kraken!
        this.spawnEnemies();

        // Lock the princess in the tower >:(
        new Princess({ x: this.tilesX + 1, y: Math.floor(this.tilesY / 2) });

        // Start loop
        if (!createjs.Ticker.hasEventListener('tick')) {
            createjs.Ticker.addEventListener('tick', gGameEngine.update);
            createjs.Ticker.setFPS(this.fps);
        }
    }

    update() {
        // Player
        for (let i = 0; i < gGameEngine.players.length; i++) {
            const player = gGameEngine.players[i];
            player.update();
        }

        // Enemies

        // Stage
        gGameEngine.stage.update();
    }

    generateMaze(x, y) {
        // Get yourself lost
        const totalCells = x* y;
        const cells = new Array();
        const unvisited = new Array();
        for (let i =0 ; i<y ; i++){
          cells[i] = new Array();
          unvisited[i] = new Array();
          for (let j=0; j <x; j++){
            cells[i][j] = [0,0,0,0]
            unvisited[i][j]= true;
          }
        }
        let currentCell = [Math.floor(Math.random() & y), Math.floor(Math.random() & x)]
        const path = [currentCell];
        unvisited[currentCell[0]][currentCell[1]] = false;
        let visited = 1 ;
        while(visited< totalCells){
          const pot= [
            [currentCell[0] - 1, currentCell[1], 0,2],
            [currentCell[0], currentCell[1] + 1, 1, 3],
            [currentCell[0] + 1, currentCell[1], 2, 0],
            [currentCell[0], currentCell[1]- 1, 3, 1]
           ]
           const neighbours  = new Array();
           for (let k = 0; k<4; k++){
             if(
               pot[k][0]> -1 &&
               pot{k}[0]< y &&
               pot[k][1]>-1 &&
               pot[k][0] < x &&
               unvisited[pot[k][0]pot[k][1]]
             ){
               neighbours.push(pot[k])
             }
           }
           if(neighbours.length){
             const next = neighbours[Math.floor(Math.random()*neighbours.length)];

             cells[currentCell[0]][currentCell[1]][next[2]] = 1
             cells[next[0]][next[1]][next[3]] = 1;

             unvisited[next[0]][next[1]] = false;


           }
        }
    }

    drawTiles() {
      console.log(this.generateMaze(20,10));
      for (var i = 0; i < this.tilesY; i++) {
        for (var j = 0; j < this.tilesX; j++) {
          if(
            i === 0 ||
            j === 0 ||
            i === this.tilesY - 1 ||
            j === this.tilesX - 1 ||
            (j % 2 === 0 && i % 2 === 0)
          )
        }
      }
        // Draw Maze from hardcoded Array
        // for (let i = 0; i < this.tilesY; i++) {
        //     for (let j = 0; j < this.tilesX; j++) {
        //         if (this.maze[i][j] === 1) {
        //             // Wall tiles
        //             const tile = new Tile('wall', { x: j, y: i });
        //             this.stage.addChild(tile.bmp);
        //             this.tiles.push(tile);
        //         } else {
        //             // Grass tiles
        //             const tile = new Tile('grass', { x: j, y: i });
        //             this.stage.addChild(tile.bmp);
        //             this.grassTiles.push(tile);
        //         }
        //     }
        // }
        //
        //
        // // Starting point for tower
        // const verticalTowerEdge = (Math.floor(this.tilesY / 2)) - 2;
        //
        // // Draw princess tower
        // for (let i = 0; i < 6; i++) {
        //     for (let j = 0; j < 4; j++) {
        //         if (
        //             i === 0 ||
        //             j === 0 ||
        //             i >= 4 ||
        //             j === 3
        //         ) {
        //             const tile = new Tile('wall', { x: this.tilesX - 1 + j, y: verticalTowerEdge + i });
        //             if (j === 0) {
        //                 this.towerEdgeTiles.push(tile);
        //             } else {
        //                 this.stage.addChild(tile.bmp);
        //             }
        //         } else {
        //             const tile = new Tile('grass', { x: this.tilesX - 1 + j, y: verticalTowerEdge + i });
        //             this.stage.addChild(tile.bmp);
        //         }
        //     }
        // }
        //
        // // Fill the void with grass, make the world pretty
        // for (let i = 0; i < this.tilesY; i++) {
        //     for (let j = 0; j < 4; j++) {
        //         if (i < verticalTowerEdge || i > verticalTowerEdge + 5) {
        //             const tile = new Tile('grass', { x: this.tilesX + j, y: i });
        //             this.stage.addChild(tile.bmp);
        //         }
        //     }
        // }
    }

    drawWoods() {
        const available = [];

        for (let i = 0; i < this.grassTiles.length; i++) {
            available.push(this.grassTiles[i]);
        }

        available.sort(() => {
            return 0.5 - Math.random();
        });

        for(let i = 0; i < 5; i ++) {
            const tile = available[i];
            const wood = new Wood(tile.position);
            this.woods.push(wood);
        }
    }

    spawnPlayers() {
        this.players= [];

        const player = new Player({x: 1, y: 1});
        this.players.push(player);
    }

    spawnEnemies() {
        // Ruuuuun
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
}

const gGameEngine = new GameEngine();
export default gGameEngine;
