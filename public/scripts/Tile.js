import gGameEngine from './GameEngine.js';
import Utils from './Utils.js';
export default class Tile {

    constructor(material, position) {
        // Bitmap dimensions
        this.size = {
            w: 32,
            h: 32
        };
        // Bitmap animation
        this.bmp = null;
        this.material = material;
        this.position = position;
        let img;
        if (material == 'grass') {
            img = gGameEngine.tilesImgs.grass;
        } else if (material == 'wall') {
            img = gGameEngine.tilesImgs.wall;
        } else if (material == 'wood') {
            img = gGameEngine.tilesImgs.wood;
        }
        this.bmp = new createjs.Bitmap(img);
        const pixels = Utils.convertToBitmapPosition(position);
        this.bmp.x = pixels.x;
        this.bmp.y = pixels.y;
    }

    remove() {
        gGameEngine.stage.removeChild(this.bmp);
        Utils.removeFromArray(gGameEngine.tiles, this);
    }
}