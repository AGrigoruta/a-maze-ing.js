import gGameEngine from './GameEngine.js';

window.init = () => {

    document.getElementById('easy').addEventListener('click', () => {
        startGame(5);
    });
    document.getElementById('normal').addEventListener('click', () => {
        startGame(10);
    });
    document.getElementById('hard').addEventListener('click', () => {
        startGame(15);
    });
    document.getElementById('insane').addEventListener('click', () => {
        startGame(20);
    });    

    function startGame(enemyNr) {
        gGameEngine.enemyNumber = enemyNr;
        document.getElementById("big-container").removeChild(document.getElementById('level'));

        let html = `<div class="container">
        <canvas id="game" width="1408" height="672"></canvas>        
        <div id="reset" class="button">Reset</div>
        </div>`;
        window.document.getElementById('big-container').insertAdjacentHTML('beforeend', html);
        
        document.getElementById('reset').addEventListener('click', () => {
        location.reload();
    });

        gGameEngine.load();
    }
}
