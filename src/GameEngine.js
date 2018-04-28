class GameEngine {

  getMaze(x, y) {
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

      // Check this lines
      var pot = [[currentCell[0] - 1, currentCell[1], 0, 2],
      [currentCell[0], currentCell[1] + 1, 1, 3],
      [currentCell[0] + 1, currentCell[1], 2, 0],
      [currentCell[0], currentCell[1] - 1, 3, 1]];
      var neighbors = new Array();

      // Determine if each neighboring cell is in game grid, and whether it has already been checked
      for (var l = 0; l < 4; l++) {
        if (pot[l][0] > -1 && pot[l][0] < y && pot[l][1] > -1 && pot[l][1] < x &&
          unvis[pot[l][0]][pot[l][1]]) {
          neighbors.push(pot[l]);
        }
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

  spawnEnemies(mazeCells) {
    const enemies = [];
    const availablePathwayStart = [];
    const tilesX = 41;
    const tilesY = 21;
    const tiles = [];
    const grassTiles = [];

    for (let i = 0; i < tilesY; i++) {
      for (let j = 0; j < tilesX; j++) {
        if (
          i == 0 ||
          j == 0 ||
          i == tilesY - 1 ||
          j == tilesX - 1 ||
          (j % 2 == 0 && i % 2 == 0)
        ) {
          // Wall tiles
          const tile = { position: {x: j, y: i }};
          tiles.push(tile);
        } else if (j % 2 == 1 && i % 2 == 1 && j !== tilesX - 1 && i !== tilesY - 1) {
          // Grass tiles
          const tile = { position: {x: j, y: i }};
          grassTiles.push(tile);
        }
      }
    }

    for (let i = 0; i < mazeCells.length; i++) {
      for (let j = 0; j < mazeCells[0].length; j++) {
        if (mazeCells[i][j][1] === 0) {
          // Wall tiles
          const tile = { position: {x: ((2 * j) + 2), y: ((2 * i) + 1) }};
          tiles.push(tile);
        } else {
          // Grass tiles
          const tile = { position: {x: ((2 * j) + 2), y: ((2 * i) + 1) }};
          grassTiles.push(tile);
        }
        if (mazeCells[i][j][2] === 0) {
          // Wall tiles
          const tile = { position: {x: ((2 * j) + 1), y: ((2 * i) + 2) }};
          tiles.push(tile);
        } else {
          // Grass tiles
          const tile = { position: {x: ((2 * j) + 1), y: ((2 * i) + 2) }};
          grassTiles.push(tile);
        }
      }
    }

    grassTiles.sort((a, b) => {
      if (a.position.y === b.position.y) return a.position.x - b.position.x
      return a.position.y - b.position.y
    });

    for (let i = 0; i < grassTiles.length - 5; i++) {
      if (
        (grassTiles[i].position.y === grassTiles[i + 1].position.y &&
          grassTiles[i].position.y === grassTiles[i + 2].position.y &&
          grassTiles[i].position.y === grassTiles[i + 3].position.y &&
          grassTiles[i].position.y === grassTiles[i + 4].position.y) &&

        (grassTiles[i + 4].position.x - grassTiles[i + 3].position.x === 1 &&
          grassTiles[i + 3].position.x - grassTiles[i + 2].position.x === 1 &&
          grassTiles[i + 2].position.x - grassTiles[i + 1].position.x === 1 &&
          grassTiles[i + 1].position.x - grassTiles[i].position.x === 1)
      ) {
        availablePathwayStart.push(i + 4);
        i += 5;
      }
    }

    availablePathwayStart.sort(() => {
      return 0.5 - Math.random();
    });

    for (let i = 0; i < 5; i++) {
      const enemy = grassTiles[availablePathwayStart[i]].position;
      enemies.push(enemy);
    }

    return enemies;
  }

  spawnWoods(mazeCells) {
    const added = [];
    const woods = [];
    const tilesX = 41;
    const tilesY = 21;
    const tiles = [];
    const grassTiles = [];
    const woodDistributionRatio = 12;

    for (let i = 0; i < tilesY; i++) {
      for (let j = 0; j < tilesX; j++) {
        if (
          i == 0 ||
          j == 0 ||
          i == tilesY - 1 ||
          j == tilesX - 1 ||
          (j % 2 == 0 && i % 2 == 0)
        ) {
          // Wall tiles
          const tile = { position: { x: j, y: i } };
          tiles.push(tile);
        } else if (j % 2 == 1 && i % 2 == 1 && j !== tilesX - 1 && i !== tilesY - 1) {
          // Grass tiles
          const tile = { position: { x: j, y: i } };
          grassTiles.push(tile);
        }
      }
    }

    for (let i = 0; i < mazeCells.length; i++) {
      for (let j = 0; j < mazeCells[0].length; j++) {
        if (mazeCells[i][j][1] === 0) {
          // Wall tiles
          const tile = { position: { x: ((2 * j) + 2), y: ((2 * i) + 1) } };
          tiles.push(tile);
        } else {
          // Grass tiles
          const tile = { position: { x: ((2 * j) + 2), y: ((2 * i) + 1) } };
          grassTiles.push(tile);
        }
        if (mazeCells[i][j][2] === 0) {
          // Wall tiles
          const tile = { position: { x: ((2 * j) + 1), y: ((2 * i) + 2) } };
          tiles.push(tile);
        } else {
          // Grass tiles
          const tile = { position: { x: ((2 * j) + 1), y: ((2 * i) + 2) } };
          grassTiles.push(tile);
        }
      }
    }

    grassTiles.sort(() => {
      return 0.5 - Math.random();
    });

    for (let i = 0; i < 4; i++) {
      let placedCount = 0;
      for (let j = 0; j < grassTiles.length; j++) {
        if ((i < 2) && (placedCount > woodDistributionRatio / 4) ||
          ((i >= 2) && (placedCount > woodDistributionRatio / 4 - 1))) {
          break;
        }
        const tile = grassTiles[j];
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
            tile.position.x < tilesX / 2 &&
            tile.position.y < tilesY / 2) ||
          (i === 1 &&
            tile.position.x < tilesX / 2 &&
            tile.position.y > tilesY / 2) ||
          (i === 2 &&
            tile.position.x > tilesX / 2 &&
            tile.position.y < tilesY / 2) ||
          (i === 3 &&
            tile.position.x > tilesX / 2 &&
            tile.position.y > tilesY / 2)
        )) {
          woods.push(tile.position);
          added.push(tile);
          placedCount++;
        }
      }
    }
    return woods;
  }

}


module.exports = GameEngine;