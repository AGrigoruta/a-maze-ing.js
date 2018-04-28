import Player from './Player.js';
import gGameEngine from './GameEngine.js';
import Wood from './Wood.js';

export const socket = io();
export const multiplayer = {
	request() {
		socket.emit('multiplayer-requested')
	},

};

socket.on('connected', (res) => {
	console.log(res);
});
