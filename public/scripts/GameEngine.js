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
        this.playersCount = 1;
        this.woodDistributionRatio = 12;
        this.over=false;

        // player
        this.id=null;

        // Asset Objects
        this.playerBoyImg = null;
        this.princessImg = null;
        this.enemyImg = null;
        this.woodImg = null;
        this.tilesImgs = {};

        // Environment Arrays
        this.players = [];
        this.roomPlayers=[];
        this.enemies = [];        
        this.woods = [];
        this.tiles = [];
        this.grassTiles = [];
        this.towerEdgeTiles = [];

        // Sound Manipulation Parameters
        this.playing = false;
        this.soundtrackLoaded = false;
        this.soundtrackPlaying = false;
        this.soundtrack = null;

    }

    reinit(){
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
                this.playersCount = 1;
                this.woodDistributionRatio = 12;
                this.over=false;
        
                // player
                this.id=null;
        
                // Asset Objects
                this.playerBoyImg = null;
                this.princessImg = null;
                this.enemyImg = null;
                this.woodImg = null;
                this.tilesImgs = {};
        
                // Environment Arrays
                this.players = [];
                this.roomPlayers=[];
                this.enemies = [];        
                this.woods = [];
                this.tiles = [];
                this.grassTiles = [];
                this.towerEdgeTiles = [];
        
                // Sound Manipulation Parameters
                this.playing = false;
                this.soundtrackLoaded = false;
                this.soundtrackPlaying = false;
                this.soundtrack = null;
    }

    load(roomPlayers,server_maze,id,socket) {
        // Init canvas
        this.stage = new createjs.Stage("game");

        // Load assets
        const queue = new createjs.LoadQueue();
        const that = this;
        queue.addEventListener('complete', () => {
            that.player1 = queue.getResult('player1');
            that.player2 = queue.getResult('player2');
            that.player3 = queue.getResult('player3');
            that.player4 = queue.getResult('player4');
            that.princessImg = queue.getResult('princess');
            that.enemyImg = queue.getResult('enemy');
            that.woodImg = queue.getResult('wood');
            that.tilesImgs.grass = queue.getResult('tile_grass');
            that.tilesImgs.wall = queue.getResult('tile_wall');
            that.setup(roomPlayers,server_maze,id,socket);
        });
        queue.loadManifest([
            { id: 'player1', src: 'img/george1.png' },
            { id: 'player2', src: 'img/george2.png' },
            { id: 'player3', src: 'img/george3.png' },
            { id: 'player4', src: 'img/george4.png' },
            { id: 'princess', src: 'img/betty.png' },
            { id: 'enemy', src: 'img/dino.png' },
            { id: 'wood', src: 'img/wood.png' },
            { id: 'tile_grass', src: 'img/tile_grass.png' },
            { id: 'tile_wall', src: 'img/tile_wall.png' }
        ]);

        createjs.Sound.addEventListener('fileload', this.onSoundLoaded);
        createjs.Sound.registerSound('sounds/game.mp3', 'game');
        createjs.Sound.registerSound('sounds/gogo.mp3', 'lose');
    }

    setup(roomPlayers,server_maze,id,socket) {
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
        this.drawTiles(server_maze);

        // Add wood logs on the map
        this.drawWoods(server_maze,socket);

        // Spawn yourself
        this.spawnPlayers(roomPlayers,id,socket);
        this.id=id;
        //Release the kraken!
        // not yet
        socket.on('releaseKrakens',()=>{
            this.spawnEnemies(server_maze);
        })

        // Lock the princess in the tower >:(
        new Princess({ x: this.tilesX + 1, y: Math.floor(this.tilesY / 2) });

        // Toggle sound
        gInputEngine.addListener('mute', this.toggleSound);

        // DJ, turn it up
        if (gGameEngine.playersCount > 0) {
            if (this.soundtrackLoaded) {
                this.playSoundtrack();
            }
        }

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
        for (let i = 0; i < gGameEngine.enemies.length; i++) {
            const enemy = gGameEngine.enemies[i];
            enemy.update();
        }

        // Stage
        gGameEngine.stage.update();
    }

    onSoundLoaded(sound) {
        if (sound.id === 'game') {
            gGameEngine.soundtrackLoaded = true;
            if (gGameEngine.playersCount > 0) {
                gGameEngine.playSoundtrack();
            }
        }
    }

    playSoundtrack() {
        if (!gGameEngine.soundtrackPlaying) {
            gGameEngine.soundtrack = createjs.Sound.play('game', 'none', 0, 0, -1);
            gGameEngine.soundtrack.setVolume(1);
            gGameEngine.soundtrackPlaying = true;
        }
    }

    toggleSound() {
        if (!gGameEngine.soundtrack.paused) {
            gGameEngine.soundtrack.paused = true;
        } else {
            gGameEngine.soundtrack.paused = false;
        }
    }
    
    drawTiles(server_maze) {
        const maze = server_maze.maze;
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
                    const tile = new Tile('wall', { x: j, y: i });
                    this.stage.addChild(tile.bmp);
                    this.tiles.push(tile);
                } else if (
                    j % 2 === 1 && i % 2 === 1 && j != this.tilesX - 1 && i != this.tilesY - 1
                ) {
                    const tile = new Tile('grass', { x: j, y: i });
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
                    const tile = new Tile('wall', { x: this.tilesX - 1 + j, y: verticalTowerEdge + i });
                    if (j === 0) {
                        this.towerEdgeTiles.push(tile);
                    } else {
                        this.stage.addChild(tile.bmp);
                    }
                } else {
                    const tile = new Tile('grass', { x: this.tilesX - 1 + j, y: verticalTowerEdge + i });
                    this.stage.addChild(tile.bmp);
                }
            }
        }

        // Fill the void with grass, make the world pretty
        for (let i = 0; i < this.tilesY; i++) {
            for (let j = 0; j < 4; j++) {
                if (i < verticalTowerEdge || i > verticalTowerEdge + 5) {
                    const tile = new Tile('grass', { x: this.tilesX + j, y: i });
                    this.stage.addChild(tile.bmp);
                }
            }
        }

        for (let i = 0; i < maze.length; i++) {
            for (let j = 0; j < maze[0].length; j++) {
                if (maze[i][j][1] === 0) {
                    const tile = new Tile('wall', {x: ((2 * j) + 2), y: ((2 * i) + 1)});
                    this.stage.addChild(tile.bmp);
                    this.tiles.push(tile);
                } else {
                    const tile = new Tile('grass', {x: ((2 * j) + 2), y: ((2 * i) + 1)});
                    this.stage.addChild(tile.bmp);
                    this.grassTiles.push(tile);
                }
                if (maze[i][j][2] === 0) {
                    const tile = new Tile('wall', {x: ((2 * j) + 1), y: ((2 * i) + 2)});
                    this.stage.addChild(tile.bmp);
                    this.tiles.push(tile);
                } else {
                    const tile = new Tile('grass', {x: ((2 * j) + 1), y: ((2 * i) + 2)});
                    this.stage.addChild(tile.bmp);
                    this.grassTiles.push(tile);
                }
            }
        }
    }

    drawWoods(server_maze,socket) {
        const available = [];
        const added = [];
        const randomish=server_maze.randomish;
        let i=0;
        for (let i = 0; i < this.grassTiles.length; i++) {
            available.push(this.grassTiles[i]);
        }
        available.sort((elem) => {
            let a=randomish[i];
            i++;
            return a;
        });
        for (let i = 0; i < 4; i++) {
            let placedCount = 0;
            for (let j = 0; j < available.length; j++) {
                if ((i < 2) && (placedCount > this.woodDistributionRatio / 4) ||
                    ((i >= 2) && (placedCount > this.woodDistributionRatio / 4 - 1))) {
                        break;
                    }
                const tile = available[j];
                let badTile = false;
                for (let addedTile of added) {
                    if (Math.abs(addedTile.position.x - tile.position.x) < 5 &&
                        Math.abs(addedTile.position.y - tile.position.y) < 5) {
                            badTile = true;
                            break;
                    }
                }

                if (!badTile && (
                    (i === 0 &&
                        tile.position.x < this.tilesX / 2 &&
                        tile.position.y < this.tilesY / 2) ||
                    (i === 1 &&
                        tile.position.x < this.tilesX / 2 &&
                        tile.position.y > this.tilesY / 2) ||
                    (i === 2 &&
                        tile.position.x > this.tilesX / 2 &&
                        tile.position.y < this.tilesY / 2) ||
                    (i === 3 &&
                        tile.position.x > this.tilesX / 2 &&
                        tile.position.y > this.tilesY / 2)    
                )) {
                    const wood = new Wood(tile.position);
                    this.woods.push(wood);
                    added.push(tile);
                    placedCount++;
                }
            }
        }
        socket.emit('ok',"i'm ok");
        // Distribute bonuses to quarters of map more or less fair
    }

    spawnPlayers(roomPlayers,id,socket) {
        this.players= [];
        var count=1;
        roomPlayers.forEach(player => {
            var p;
            switch(count){
                case 1:{

                    p=new Player({x: 1, y: 1},player.id==id,player,socket,count);
                    break;
                }
                case 2:{

                    p=new Player({x: 1, y: 19},player.id==id,player,socket,count);
                    break;
                }
                case 3:{
                    
                    p=new Player({x: 39, y: 19},player.id==id,player,socket,count);
                    break;
                }
                case 4:{
                    
                    p=new Player({x: 39, y: 1},player.id==id,player,socket,count);
                    break;
                }
                default:{
                    break;
                }
            }
            count++;
            this.players.push(p);
        });
    }

    spawnEnemies(server_maze) {
        this.enemies = [];
        const availablePathwayStart = [];

        this.grassTiles.sort((a, b) => {
            if (a.position.y === b.position.y) return a.position.x - b.position.x
            return a.position.y - b.position.y
        });

        for (let i = 0; i < this.grassTiles.length - 5; i++) {
            if (
                (this.grassTiles[i].position.y === this.grassTiles[i+1].position.y &&
                this.grassTiles[i].position.y === this.grassTiles[i+2].position.y &&
                this.grassTiles[i].position.y === this.grassTiles[i+3].position.y &&
                this.grassTiles[i].position.y === this.grassTiles[i+4].position.y) &&

                (this.grassTiles[i + 4].position.x - this.grassTiles[i + 3].position.x === 1 &&
                this.grassTiles[i + 3].position.x - this.grassTiles[i + 2].position.x === 1 &&
                this.grassTiles[i + 2].position.x - this.grassTiles[i + 1].position.x === 1 &&
                this.grassTiles[i + 1].position.x - this.grassTiles[i].position.x === 1)
            ) {
                availablePathwayStart.push(i+4);
                i += 5;
            }
        }
        let randomish=server_maze.randomish;
        let i=10000;

        availablePathwayStart.sort(() => {
            let a=randomish[i];
            i--;
            return a;
        });

        for (let i = 0; i < 5; i++) {
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

    gameOver(status,winner_id=null,name=null) {
        if (status === 'win') {
            document.getElementById("end__splash").style.height='672px';
            if(winner_id==this.id){
                document.getElementById("game__status").innerHTML="You won!";
                document.getElementById("game__status").style.color="black";
            }else{
                document.getElementById("game__status").innerHTML="You lost!";
                document.getElementById("game__status").style.color="red";
            }
            document.getElementById("winner").innerHTML=name;
            document.getElementById("winner").style.color="#50da50";
            this.over=true;
        } else if(status==='lose' && winner_id==this.id){
            
            document.getElementById("end__splash").style.height='672px';
            document.getElementById("game__status").innerHTML="You lost!";
            document.getElementById("other__win").style.display='none';
            document.getElementById("winner").innerHTML="Princess needs you..";
            document.getElementById("winner").style.color="brown";
            this.over=true;

        }else if(status==='lose_all'){
            document.getElementById("end__splash").style.height='672px';
            document.getElementById("game__status").innerHTML="Weak!";
            document.getElementById("winner").innerHTML='fiipractic';
            document.getElementById("winner").style.color="#50da50";
            this.over=true;
        }
        createjs.Sound.play('lose');
    }

    countPlayersAlive() {
        let playersAlive = 0;
        for (let i = 0; i < gGameEngine.players.length; i++) {
            if (gGameEngine.players[i].alive) {
                playersAlive++;
            }
        }
        return playersAlive;
    }

    unload(){
        this.stage.removeAllChildren();
        this.stage.update();
    }
}

const gGameEngine = new GameEngine();
export default gGameEngine;