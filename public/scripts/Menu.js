import gGameEngine from './GameEngine.js';
import { multiplayer, socket } from './Multiplayer.js';

export default class Menu {

    constructor() {
        this.visible = true;
        this.views = [];
        gGameEngine.playersCount = 0;
        this.showLoader();
    }

    show(text) {
        this.visible = true;
        this.draw(text);
    }

    hide() {
        this.visible = false;
        for (let i = 0; i < this.views.length; i++) {
            gGameEngine.stage.removeChild(this.views[i]);
        }
        this.views = [];
    }

    update() {
        if (this.visible) {
            for (let i = 0; i < this.views.length; i++) {
                gGameEngine.moveToFront(this.views[i]);
            }
        }
    }

    setHandCursor(btn) {
        btn.addEventListener('mouseover', function () {
            document.body.style.cursor = 'pointer';
        });
        btn.addEventListener('mouseout', function () {
            document.body.style.cursor = 'auto';
        });
    }

    setMode(mode, res) {
        this.hide();
        if (mode == 'single') {
            gGameEngine.playersCount = 1;
        } else {
            gGameEngine.playersCount = 2;
        }

        gGameEngine.playing = true;
        gGameEngine.restart(res);
    }

    draw(text) {
        const that = this;

        // semi-transparent black background
        const bgGraphics = new createjs.Graphics().beginFill("rgba(0, 0, 0, 0.5)").drawRect(0, 0, gGameEngine.size.w, gGameEngine.size.h);
        const bg = new createjs.Shape(bgGraphics);
        gGameEngine.stage.addChild(bg);
        this.views.push(bg);

        // game title
        text = text || [{ text: 'A-Maze-ing.', color: '#ffffff' }, { text: 'js', color: '#ff4444' }];

        const title1 = new createjs.Text(text[0].text, "bold 35px Helvetica", text[0].color);
        const title2 = new createjs.Text(text[1].text, "bold 35px Helvetica", text[1].color);

        const titleWidth = title1.getMeasuredWidth() + title2.getMeasuredWidth();

        title1.x = gGameEngine.size.w / 2 - titleWidth / 2;
        title1.y = gGameEngine.size.h / 2 - title1.getMeasuredHeight() / 2 - 80;
        gGameEngine.stage.addChild(title1);
        this.views.push(title1);

        title2.x = title1.x + title1.getMeasuredWidth();
        title2.y = gGameEngine.size.h / 2 - title1.getMeasuredHeight() / 2 - 80;
        gGameEngine.stage.addChild(title2);
        this.views.push(title2);

        // modes buttons
        const modeSize = 110;
        const modesDistance = 20;
        const modesY = title1.y + title1.getMeasuredHeight() + 40;

        // singleplayer button
        const singleX = gGameEngine.size.w / 2 - modeSize - modesDistance;
        const singleBgGraphics = new createjs.Graphics().beginFill("rgba(0, 0, 0, 0.5)").drawRect(singleX, modesY, modeSize, modeSize);
        const singleBg = new createjs.Shape(singleBgGraphics);
        gGameEngine.stage.addChild(singleBg);
        this.views.push(singleBg);
        this.setHandCursor(singleBg);
        singleBg.addEventListener('click', function () {
            that.setMode('single');

        });

        const singleTitle1 = new createjs.Text("single", "16px Helvetica", "#ff4444");
        const singleTitle2 = new createjs.Text("player", "16px Helvetica", "#ffffff");
        const singleTitleWidth = singleTitle1.getMeasuredWidth() + singleTitle2.getMeasuredWidth();
        const modeTitlesY = modesY + modeSize - singleTitle1.getMeasuredHeight() - 20;

        singleTitle1.x = singleX + (modeSize - singleTitleWidth) / 2;
        singleTitle1.y = modeTitlesY;
        gGameEngine.stage.addChild(singleTitle1);
        this.views.push(singleTitle1)

        singleTitle2.x = singleTitle1.x + singleTitle1.getMeasuredWidth();
        singleTitle2.y = modeTitlesY;
        gGameEngine.stage.addChild(singleTitle2);
        this.views.push(singleTitle2)

        const iconsY = modesY + 13;
        const singleIcon = new createjs.Bitmap("img/george.png");
        singleIcon.sourceRect = new createjs.Rectangle(0, 0, 48, 48);
        singleIcon.x = singleX + (modeSize - 48) / 2;
        singleIcon.y = iconsY;
        gGameEngine.stage.addChild(singleIcon);
        this.views.push(singleIcon);

        // multiplayer button
        const multiX = gGameEngine.size.w / 2 + modesDistance;
        const multiBgGraphics = new createjs.Graphics().beginFill("rgba(0, 0, 0, 0.5)").drawRect(multiX, modesY, modeSize, modeSize);
        const multiBg = new createjs.Shape(multiBgGraphics);
        gGameEngine.stage.addChild(multiBg);
        this.views.push(multiBg);
        this.setHandCursor(multiBg);
        multiBg.addEventListener('click', function () {
            // Quando e feito request para multiplayer

        });

        const multiTitle1 = new createjs.Text("multi", "16px Helvetica", "#99cc00");
        const multiTitle2 = new createjs.Text("player", "16px Helvetica", "#ffffff");
        const multiTitleWidth = multiTitle1.getMeasuredWidth() + multiTitle2.getMeasuredWidth();

        multiTitle1.x = multiX + (modeSize - multiTitleWidth) / 2;
        multiTitle1.y = modeTitlesY;
        gGameEngine.stage.addChild(multiTitle1);
        this.views.push(multiTitle1)

        multiTitle2.x = multiTitle1.x + multiTitle1.getMeasuredWidth();
        multiTitle2.y = modeTitlesY;
        gGameEngine.stage.addChild(multiTitle2);
        this.views.push(multiTitle2)

        const multiIconGirl = new createjs.Bitmap("img/george.png");
        multiIconGirl.sourceRect = new createjs.Rectangle(0, 0, 48, 48);
        multiIconGirl.x = multiX + (modeSize - 48) / 2 - 48 / 2 + 8;
        multiIconGirl.y = iconsY;
        gGameEngine.stage.addChild(multiIconGirl);
        this.views.push(multiIconGirl);

        const multiIconBoy = new createjs.Bitmap("img/george.png");
        multiIconBoy.sourceRect = new createjs.Rectangle(0, 0, 48, 48);
        multiIconBoy.x = multiX + (modeSize - 48) / 2 + 48 / 2 - 8;
        multiIconBoy.y = iconsY;
        gGameEngine.stage.addChild(multiIconBoy);
        this.views.push(multiIconBoy);
    }

    showLoader() {
        const bgGraphics = new createjs.Graphics().beginFill("#000000").drawRect(0, 0, gGameEngine.size.w, gGameEngine.size.h);
        const bg = new createjs.Shape(bgGraphics);
        gGameEngine.stage.addChild(bg);

        const loadingText = new createjs.Text("Loading...", "20px Helvetica", "#FFFFFF");
        loadingText.x = gGameEngine.size.w / 2 - loadingText.getMeasuredWidth() / 2;
        loadingText.y = gGameEngine.size.h / 2 - loadingText.getMeasuredHeight() / 2;
        gGameEngine.stage.addChild(loadingText);
        gGameEngine.stage.update();
    }

}