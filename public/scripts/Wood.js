import gGameEngine from './GameEngine.js';
import Utils from './Utils.js';
import { multiplayer } from './Multiplayer.js';

export default class Wood {

    constructor(position) {
        this.position = position;
        this.bmp = new createjs.Bitmap(gGameEngine.woodImg);
        var pixels = Utils.convertToBitmapPosition(position);
        this.bmp.x = pixels.x;
        this.bmp.y = pixels.y;
        this.bmp.sourceRect = new createjs.Rectangle(0, 0, 32, 32);
        gGameEngine.stage.addChild(this.bmp);
    }

    destroy() {
        gGameEngine.stage.removeChild(this.bmp);
        Utils.removeFromArray(gGameEngine.woods, this);
    }
}