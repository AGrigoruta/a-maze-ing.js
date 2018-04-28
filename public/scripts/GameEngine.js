/* Taken from
* https://github.com/MattSkala/html5-bombergirl/tree/master/js
*/
import gInputEngine from './InputEngine.js';
import Menu from './Menu.js';
import Tile from './Tile.js';
import Player from './Player.js';
import Enemy from './Enemy.js';
import Wood from './Wood.js';
import Princess from './Princess.js';
import { multiplayer } from './Multiplayer.js';

class GameEngine {
  constructor() {
    this.tileSize = 32;
    this.tilesX = 41;
    this.tilesY = 21;
    this.fps = 50;
    this.playersCount = 1;
    this.woodDistributionRatio = 12;

    this.playerId = null;

    this.stage = null;
    this.menu = null;
    this.players = [];
    this.enemies = [];
    this.tiles = [];
    this.grassTiles = [];
    this.towerEdgeTiles = [];
    this.woods = [];

    this.playerBoyImg = null;
    this.princessImg = null;
    this.tilesImgs = {};
    this.woodImg = null;
    this.enemyImg = null;

    // this.playing = false;
    // this.mute = false;
    // this.soundtrackLoaded = false;
    // this.soundtrackPlaying = false;
    // this.soundtrack = null;
    this.size = {
      w: this.tileSize * (this.tilesX + 4),
      h: this.tileSize * this.tilesY
    };

  }

  load() {
    // Init canvas
    this.stage = new createjs.Stage("game");

    // Load assets
    var queue = new createjs.LoadQueue();
    var that = this;
    queue.addEventListener('complete', function () {
      that.playerBoyImg = queue.getResult('playerBoy');
      that.princessImg = queue.getResult('princess');
      that.woodImg = queue.getResult('wood');
      that.enemyImg = queue.getResult('enemy');
      that.tilesImgs.grass = queue.getResult('tile_grass');
      that.tilesImgs.wall = queue.getResult('tile_wall');
      that.setup();
    });
    queue.loadManifest([
      { id: 'playerBoy', src: 'img/george.png' },
      { id: 'princess', src: 'img/betty.png' },
      { id: 'wood', src: 'img/wood.png' },
      { id: 'enemy', src: 'img/dino.png' },
      { id: 'tile_grass', src: 'img/tile_grass.png' },
      { id: 'tile_wall', src: 'img/tile_wall.png' },
    ]);

    // createjs.Sound.addEventListener('fileload', this.onSoundLoaded);
    // createjs.Sound.alternateExtensions = ['mp3'];
    // createjs.Sound.registerSound('sound/bomb.ogg', 'bomb');
    // createjs.Sound.registerSound('sound/game.ogg', 'game');

    // Create menu
    this.menu = new Menu();
  }

  setup(res) {
    if (!gInputEngine.bindings.length) {
      gInputEngine.setup();
    }

    this.tiles = [];
    this.grassTiles = [];
    this.towerEdgeTiles = [];
    this.woods = [];
    this.enemies = [];

    // Draw stuff 
    res ? this.drawTiles(res.maze) : this.drawTiles();
    res ? this.drawWoods(res.woods) : this.drawWoods();
    res ? this.spawnEnemies(res.enemies) : this.spawnEnemies();
    this.spawnPlayers();

    var princess = new Princess({ x: this.tilesX + 1, y: Math.floor(this.tilesY / 2) });

    // Toggle sound
    // gInputEngine.addListener('mute', this.toggleSound);

    // Restart listener
    // Timeout because when you press enter in address bar too long, it would not show menu
    setTimeout(function () {
      gInputEngine.addListener('restart', function () {
        if (gGameEngine.playersCount == 0) {
          gGameEngine.menu.setMode('single');
        } else {
          gGameEngine.menu.hide();
          gGameEngine.restart();
        }
      });
    }, 200);

    // Escape listener
    gInputEngine.addListener('escape', function () {
      if (!gGameEngine.menu.visible) {
        gGameEngine.menu.show();
      }
    });

    // Start loop
    if (!createjs.Ticker.hasEventListener('tick')) {
      createjs.Ticker.addEventListener('tick', gGameEngine.update);
      createjs.Ticker.setFPS(this.fps);
    }

    // if (gGameEngine.playersCount > 0) {
    //   if (this.soundtrackLoaded) {
    //     this.playSoundtrack();
    //   }
    // }

    if (!this.playing) {
      this.menu.show();
    }
  }

  // onSoundLoaded(sound) {
  //   if (sound.id == 'game') {
  //     gGameEngine.soundtrackLoaded = true;
  //     if (gGameEngine.playersCount > 0) {
  //       gGameEngine.playSoundtrack();
  //     }
  //   }
  // }

  // playSoundtrack() {
  //   if (!gGameEngine.soundtrackPlaying) {
  //     gGameEngine.soundtrack = createjs.Sound.play('game', 'none', 0, 0, -1);
  //     gGameEngine.soundtrack.setVolume(1);
  //     gGameEngine.soundtrackPlaying = true;
  //   }
  // }

  update() {
    // Player
    if (gGameEngine.playerId !== null) {
      gGameEngine.players[gGameEngine.playerId].update();
    } else {
      for (var i = 0; i < gGameEngine.players.length; i++) {
        var player = gGameEngine.players[i];
        player.update(gGameEngine.playerId);
      }
    }


    // Enemies
    for (var i = 0; i < gGameEngine.enemies.length; i++) {
      var enemy = gGameEngine.enemies[i];
      enemy.update();
    }

    // Menu
    gGameEngine.menu.update();

    // Stage
    gGameEngine.stage.update();
  }

  generateMaze(x, y) {

    // Establish variables and starting grid
    var totalCells = x * y;
    var cells = new Array();
    var unvis = new Array();
    for (var i = 0; i < y; i++) {
      cells[i] = new Array();
      unvis[i] = new Array();
      for (var j = 0; j < x; j++) {
        cells[i][j] = [0, 0, 0, 0];
        unvis[i][j] = true;
      }
    }

    // Set a random position to start from
    var currentCell = [Math.floor(Math.random() * y), Math.floor(Math.random() * x)];
    var path = [currentCell];
    unvis[currentCell[0]][currentCell[1]] = false;
    var visited = 1;

    // Loop through all available cell positions
    while (visited < totalCells) {
      // Determine neighboring cells

      var pot = [[currentCell[0] - 1, currentCell[1], 0, 2],
      [currentCell[0], currentCell[1] + 1, 1, 3],
      [currentCell[0] + 1, currentCell[1], 2, 0],
      [currentCell[0], currentCell[1] - 1, 3, 1]];
      var neighbors = new Array();

      // Determine if each neighboring cell is in game grid, and whether it has already been checked
      for (var l = 0; l < 4; l++) {
        if (pot[l][0] > -1 && pot[l][0] < y && pot[l][1] > -1 && pot[l][1] < x && unvis[pot[l][0]][pot[l][1]]) { neighbors.push(pot[l]); }
      }

      // If at least one active neighboring cell has been found
      if (neighbors.length) {
        // Choose one of the neighbors at random
        var next = neighbors[Math.floor(Math.random() * neighbors.length)];

        // Remove the wall between the current cell and the chosen neighboring cell
        cells[currentCell[0]][currentCell[1]][next[2]] = 1;
        cells[next[0]][next[1]][next[3]] = 1;

        // Mark the neighbor as visited, and set it as the current cell
        unvis[next[0]][next[1]] = false;
        visited++;
        currentCell = [next[0], next[1]];
        path.push(currentCell);
      }
      // Otherwise go back up a step and keep going
      else {
        currentCell = path.pop();
      }
    }
    return cells;
  }

  drawTiles(maze = null) {

    var mazeCells = maze || this.generateMaze(20, 10);

    for (var i = 0; i < this.tilesY; i++) {
      for (var j = 0; j < this.tilesX; j++) {
        if (
          i == 0 ||
          j == 0 ||
          i == this.tilesY - 1 ||
          j == this.tilesX - 1 ||
          (j % 2 == 0 && i % 2 == 0)
        ) {
          // Wall tiles
          var tile = new Tile('wall', { x: j, y: i });
          this.stage.addChild(tile.bmp);
          this.tiles.push(tile);
        } else if (j % 2 == 1 && i % 2 == 1 && j !== this.tilesX - 1 && i !== this.tilesY - 1) {
          // Grass tiles
          var tile = new Tile('grass', { x: j, y: i });
          this.stage.addChild(tile.bmp);
          this.grassTiles.push(tile);
        }
      }
    }

    var verticalTowerEdge = (Math.floor(this.tilesY / 2)) - 2;

    for (var i = 0; i < 6; i++) {
      for (var j = 0; j < 4; j++) {
        if (
          i === 0 ||
          j === 0 ||
          i >= 4 ||
          j === 3
        ) {
          var tile = new Tile('wall', { x: this.tilesX - 1 + j, y: verticalTowerEdge + i });
          if (j === 0) {
            this.towerEdgeTiles.push(tile);
          } else {
            this.stage.addChild(tile.bmp);
          }
        } else {
          var tile = new Tile('grass', { x: this.tilesX - 1 + j, y: verticalTowerEdge + i });
          this.stage.addChild(tile.bmp);
        }
      }
    }

    console.log(this.towerEdgeTiles);

    for (var i = 0; i < this.tilesY; i++) {
      for (var j = 0; j < 4; j++) {
        if (i < verticalTowerEdge || i > verticalTowerEdge + 5) {
          var tile = new Tile('grass', { x: this.tilesX + j, y: i });
          this.stage.addChild(tile.bmp);
        }
      }
    }

    for (var i = 0; i < mazeCells.length; i++) {
      for (var j = 0; j < mazeCells[0].length; j++) {
        if (mazeCells[i][j][1] === 0) {
          // Wall tiles
          var tile = new Tile('wall', { x: ((2 * j) + 2), y: ((2 * i) + 1) });
          this.stage.addChild(tile.bmp);
          this.tiles.push(tile);
        } else {
          // Grass tiles
          var tile = new Tile('grass', { x: ((2 * j) + 2), y: ((2 * i) + 1) });
          this.stage.addChild(tile.bmp);
          this.grassTiles.push(tile);
        }
        if (mazeCells[i][j][2] === 0) {
          // Wall tiles
          var tile = new Tile('wall', { x: ((2 * j) + 1), y: ((2 * i) + 2) });
          this.stage.addChild(tile.bmp);
          this.tiles.push(tile);
        } else {
          // Grass tiles
          var tile = new Tile('grass', { x: ((2 * j) + 1), y: ((2 * i) + 2) });
          this.stage.addChild(tile.bmp);
          this.grassTiles.push(tile);
        }
      }
    }
  }

  drawWoods(io_woods) {
    if (io_woods) {
      for (let i = 0; i < io_woods.length; i++) {
        const wood = new Wood({ x: io_woods[i].x, y: io_woods[i].y });
        this.woods.push(wood);
      }
    } else {
      // Cache woods tiles
      var available = [];
      for (var i = 0; i < this.grassTiles.length; i++) {
        var tile = this.grassTiles[i];
        available.push(tile);
      }

      // Sort tiles randomly
      available.sort(function () {
        return 0.5 - Math.random();
      });

      // Distribute bonuses to quarters of map precisely fairly
      for (var j = 0; j < 4; j++) {
        var placedCount = 0;
        for (var i = 0; i < available.length; i++) {
          if ((j < 2 && (placedCount > this.woodDistributionRatio / 4 - 1)) ||
            ((j === 2 || j === 3) && (placedCount > this.woodDistributionRatio / 4))) {
            break;
          }

          var tile = available[i];
          if (
            (j == 0 &&
              tile.position.x < this.tilesX / 2 &&
              tile.position.y < this.tilesY / 2) ||
            (j == 1 &&
              tile.position.x < this.tilesX / 2 &&
              tile.position.y > this.tilesY / 2) ||
            (j == 2 &&
              tile.position.x > this.tilesX / 2 &&
              tile.position.y < this.tilesX / 2) ||
            (j == 3 &&
              tile.position.x > this.tilesX / 2 &&
              tile.position.y > this.tilesX / 2)
          ) {
            var wood = new Wood(tile.position);
            this.woods.push(wood);

            placedCount++;

          }
        }
      }
    }
  }

  spawnPlayers() {
    this.players = [];

    if (this.playersCount >= 1) {
      var player = new Player({ x: 1, y: 1 }, null, 0);
      this.players.push(player);
    }

    if (this.playersCount >= 2) {
      var controls = {
        up: 'up',
        left: 'left',
        down: 'down',
        right: 'right',
      };

      var player2 = new Player(
        { x: 1, y: gGameEngine.tilesY - 2 },
        controls,
        1
      );

      gGameEngine.players.push(player2);
    }

  }

  spawnEnemies(io_enemies) {
    this.enemies = [];

    if (io_enemies) {
      for (let i = 0; i < io_enemies.length; i++) {
        const enemy = new Enemy({ x: io_enemies[i].x, y: io_enemies[i].y });
        this.enemies.push(enemy);
      }
    } else {
      const availablePathwaysStart = [];

      this.grassTiles.sort(function (a, b) {
        if (a.position.y == b.position.y) return a.position.x - b.position.x;
        return a.position.y - b.position.y;
      });

      //get pathways with 5 available tiles
      for (var i = 0; i < this.grassTiles.length - 5; i++) {
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
          availablePathwaysStart.push(i + 4);
          i += 5;
        }
      }

      // Sort tiles randomly
      availablePathwaysStart.sort(function () {
        return 0.5 - Math.random();
      });

      for (var i = 0; i < 3; i++) {
        var startingPosition = this.grassTiles[availablePathwaysStart[i]].position;
        var enemy = new Enemy(startingPosition);
        this.enemies.push(enemy);
      }
    }
  }

  /**
   * Checks whether two rectangles intersect.
   */
  intersectRect(a, b) {
    return (
      a.left <= b.right &&
      b.left <= a.right &&
      a.top <= b.bottom &&
      b.top <= a.bottom
    );
  }

  /**
   * Returns tile at given position.
   */
  getTile(position) {
    for (var i = 0; i < this.tiles.length; i++) {
      var tile = this.tiles[i];
      if (tile.position.x == position.x && tile.position.y == position.y) {
        return tile;
      }
    }
  }

  /**
   * Returns tile material at given position.
   */
  getTileMaterial(position) {
    var tile = this.getTile(position);
    return tile ? tile.material : 'grass';
  }

  gameOver(status) {
    if (gGameEngine.menu.visible) {
      return;
    }

    if (status == 'win') {
      multiplayer.playerWon();
      var winText = 'You won!';
      // if (gGameEngine.playersCount > 1) {
      //   var winner = gGameEngine.getWinner();
      //   winText = winner == 0 ? 'Player 1 won!' : 'Player 2 won!';
      // }
      this.menu.show([
        { text: winText, color: '#669900' },
        { text: ' ;D', color: '#99CC00' }
      ]);
    } else if (status == 'lost') {
      this.menu.show([
        { text: 'You lost!', color: '#669900' },
        { text: ' :(', color: '#99CC00' }
      ]);
    } else {
      this.menu.show([
        { text: 'Game Over', color: '#CC0000' },
        { text: ' :(', color: '#FF4444' }
      ]);
    }
  }

  getWinner() {
    for (var i = 0; i < gGameEngine.players.length; i++) {
      var player = gGameEngine.players[i];
      if (player.alive) {
        return i;
      }
    }
  }

  restart(res) {
    gInputEngine.removeAllListeners();
    gGameEngine.stage.removeAllChildren();
    gGameEngine.setup(res);
  }

  /**
   * Moves specified child to the front.
   */
  moveToFront(child) {
    var children = gGameEngine.stage.getNumChildren();
    gGameEngine.stage.setChildIndex(child, children - 1);
  }

  // toggleSound() {
  //   if (gGameEngine.mute) {
  //     gGameEngine.mute = false;
  //     gGameEngine.soundtrack.resume();
  //   } else {
  //     gGameEngine.mute = true;
  //     gGameEngine.soundtrack.pause();
  //   }
  // }

  countPlayersAlive() {
    var playersAlive = 0;
    for (var i = 0; i < gGameEngine.players.length; i++) {
      if (gGameEngine.players[i].alive) {
        playersAlive++;
      }
    }
    return playersAlive;
  }
}

const gGameEngine = new GameEngine();
export default gGameEngine;