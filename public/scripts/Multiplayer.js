import Player from './Player.js';
import gGameEngine from './GameEngine.js';
import Wood from './Wood.js';

export const socket = io();
export let multiplayer = {
	request() {
		socket.emit('multiplayer-requested')
	},

	waitingOponent() {
		socket.emit('waiting-oponent')
	},

	sendCurrentPosition(bmp, direction) {
		socket.emit('update-position', { bmp, direction });
	},

	playerDied() {
		socket.emit('player-died', gGameEngine.playerId);
	},

	playerWon() {
		socket.emit('player-won');
	},

};


socket.on('connected', (res) => {
	console.log(res);
});


socket.on('waiting-opponent', res => {
	console.log('Waiting Opponent');
	gGameEngine.playerId = 0;
});

socket.on('reset-game', () => {
	gGameEngine.restart();
});

socket.on('opponent-position', ({ bmp, direction }) => {
	const playerId = gGameEngine.playerId === 0 ? 1 : 0;
	gGameEngine.players[playerId].updateOpponent(bmp, direction);
});


socket.on('start-game', () => {
	console.log('Start Game');
	if (gGameEngine.playerId === null) gGameEngine.playerId = 1;
	//gGameEngine.restart();
});

socket.on('kill-player', playerId => {
	gGameEngine.players[playerId].die(true);
});

socket.on('won-player', () => {
	gGameEngine.gameOver('lost');
});