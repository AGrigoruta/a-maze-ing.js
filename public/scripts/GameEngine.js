class GameEngine {
    constructor() {
        this.fps = 60;
        this.textRectangle = null;
        this.title1 = null;
        this.title2 = null;
        this.stage = null;
    }

    load() {
        // Init canvas
        this.stage = new createjs.Stage("game");

        var bounds = new createjs.Shape();
        bounds.graphics.beginFill("#3f3f3f").drawRect(0,0,this.stage.canvas.width, this.stage.canvas.height);
        this.stage.addChild(bounds);

        this.textRectangle = new createjs.Shape();
        this.textRectangle.graphics.beginFill("rgba(66, 185, 244, 0.7)").drawRect(0, 0, 600, 100);
        this.textRectangle.x = 100;
        this.textRectangle.y = (this.stage.canvas.height - 100) / 2;
        this.stage.addChild(this.textRectangle);

        this.title1 = new createjs.Text("This is", "50px Helvetica", "#ff4444");
        this.title2 = new createjs.Text("the game!", "50px Helvetica", "#ffffff");

        this.title1.x = this.textRectangle.x + 100;
        this.title1.y = this.textRectangle.y + 25;
        this.stage.addChild(this.title1);

        this.title2.x = this.title1.x + this.title1.getMeasuredWidth() + 10;
        this.title2.y = this.title1.y;
        this.stage.addChild(this.title2);

        this.setup();
    }

    setup() {
        // Start loop
        if (!createjs.Ticker.hasEventListener('tick')) {
            createjs.Ticker.addEventListener('tick', gGameEngine.update);
            createjs.Ticker.setFPS(this.fps);
        }
    }

    update() {
        createjs.Tween.get(gGameEngine.textRectangle, { loop: true })
            .to({ x: 700 }, 2000, createjs.Ease.getPowInOut(4))
            .to({ x: 100 }, 2000, createjs.Ease.getPowInOut(4));
        createjs.Tween.get(gGameEngine.title1, { loop: true })
            .to({ x: gGameEngine.title1.x + 600 }, 2000, createjs.Ease.getPowInOut(4))
            .to({ x: gGameEngine.title1.x }, 2000, createjs.Ease.getPowInOut(4));
        createjs.Tween.get(gGameEngine.title2, { loop: true })
            .to({ x: gGameEngine.title2.x + 600 }, 2000, createjs.Ease.getPowInOut(4))
            .to({ x: gGameEngine.title2.x }, 2000, createjs.Ease.getPowInOut(4));
        gGameEngine.stage.update();
    }
}

const gGameEngine = new GameEngine();
export default gGameEngine;