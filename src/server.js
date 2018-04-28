const express = require('express');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const chalk = require('chalk');
const log = console.log;

const port = process.env.PORT || 8888;

app.use(express.static('public'));

server.listen(port, null, null, () => {
    log(chalk.green(`Server running on http://localhost:${port}`));
});


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

const GameEngine = require('./GameEngine');
const gameEngine = new GameEngine();

// number of tiles
const x = 20;
const y = 10;

// Map with rooms
const rooms = new Map();

/**
 * Returns Room ID
 */
const getRoomId = () => '_' + Math.random().toString(36).substr(2, 9);

/**
 * Returns Player Object
 * @param {Object} socket 
 * 
 */
const newPlayer = (playerSocket) => ({
    playerSocket,
});

/**
 * Returns Room Object
 * @param {Array} maze  
 * @param {Object} socket
 * 
 */
const newRoom = (maze = [], enemies = [], woods = [], playerSocket = null) => ({
    roomId: getRoomId(),
    players: playerSocket ? [newPlayer(playerSocket)] : [],
    maze,
    enemies,
    woods,
});

/**
 * Add new room to rooms
 * @param {Object} room
 */
const setRoom = room => rooms.set(room.roomId, room);

/**
 * Remove room from rooms
 * @param {Object} room
 */
const removeRoom = ({ roomId }) => rooms.delete(roomId);

io.on('connection', socket => {
    socket.emit('connected', { connected: true });

});


