const express = require('express');
const app = express();
const server = require('http').Server(app);
const chalk = require('chalk');
var roomdata = require('./roomdata');
const port = 8888;

app.use(express.static('public'));

server.listen(port, null, null, () => {
    console.log(chalk.green(`Server running on http://localhost:${port}`));
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


const io = require('socket.io')(server);

this._rooms=[];

var generateMaze=(x, y)=>{
    // Init
    const totalCells = x * y;
    const cells = new Array();
    const unvisited = new Array();
    for (let i = 0; i < y; i++) {
        cells[i] = new Array();
        unvisited[i] = new Array();
        for (let j = 0; j < x; j++) {
            cells[i][j] = [0,0,0,0];
            unvisited[i][j] = true;
        }
    }

    let currentCell = [Math.floor(Math.random() * y), Math.floor(Math.random() * x)]
    const path = [currentCell];
    unvisited[currentCell[0]][currentCell[1]] = false;
    let visited = 1;

    while(visited < totalCells) {
        const pot = [
            [currentCell[0] - 1, currentCell[1], 0, 2],
            [currentCell[0], currentCell[1] + 1, 1, 3],
            [currentCell[0] + 1, currentCell[1], 2, 0],
            [currentCell[0], currentCell[1] - 1, 3, 1]
        ]
        const neighbours = new Array();

        for (let k = 0; k < 4; k++) {
            if(
                pot[k][0] > -1 &&
                pot[k][0] < y &&
                pot[k][1] > -1 &&
                pot[k][1] < x &&
                unvisited[pot[k][0]][pot[k][1]]
            ) {
                neighbours.push(pot[k])
            }
        }

        if (neighbours.length) {
            const next = neighbours[Math.floor(Math.random() * neighbours.length)];

            cells[currentCell[0]][currentCell[1]][next[2]] = 1;
            cells[next[0]][next[1]][next[3]] = 1;

            unvisited[next[0]][next[1]] = false;
            visited++;
            currentCell = [next[0], next[1]];
            path.push(currentCell);
        } else {
            currentCell = path.pop();
        }
    }
    return cells;
}

io.on('connection', (socket) => {
    socket.curRoom=null;
    socket.name=null;
    var leaveRoom=(room)=>{
        
        var data=roomdata.get(socket, "players");
        data.splice(data.findIndex(x => x.id==socket.id),1);
        roomdata.set(socket, "players", data);
        socket.broadcast.to(socket.curRoom.name).emit('player_left',{id:socket.id,name:socket.name});
        roomdata.leaveRoom(socket);
        var index=this._rooms.findIndex(x => x.name==room.name);
        if(index>-1){
            this._rooms[index].connPlayers--;
            socket.curRoom=null;
            if(this._rooms[index].connPlayers==0){
                this._rooms.splice(index,1);
                io.emit('deleteRoom',room);
            }
        }
    }
    socket.emit('rooms',{rooms:this._rooms,id:socket.id});
    socket.on('newRoom',(obj)=>{
        room=obj.room;
        socket.name=obj.name;
        roomdata.joinRoom(socket, room.name);
        roomdata.set(socket, "players", [{id:socket.id, name:socket.name}]);
        socket.curRoom=room;
        room.connPlayers++;
        this._rooms.push(room);
        io.emit('newRoom',room);
    })

    socket.on('connRoom',(obj)=>{
        room=obj.room;
        socket.name=obj.name;
        if(socket.curRoom){
            leaveRoom(socket.curRoom);
        }
        
        roomdata.joinRoom(socket, room.name);
        var data=roomdata.get(socket, "players");
        data.push({id:socket.id, name:socket.name});
        roomdata.set(socket, "players", data);
        socket.curRoom=room;
        var index=this._rooms.findIndex(x => x.name==room.name);
        this._rooms[index].connPlayers++;
        if(this._rooms[index].connPlayers==this._rooms[index].players){
            this._rooms.splice(this._rooms.indexOf(room),1);
            io.emit('deleteRoom',room);
            io.in(socket.curRoom.name).emit('gameWillBegin',generateMaze(20,10));
            setTimeout(() => {
                
            }, 3000);
        }
        socket.emit('getPlayers', roomdata.get(socket, "players"));
        socket.broadcast.to(socket.curRoom.name).emit('player_conn',{id:socket.id,name:socket.name});
    })

    socket.on('leaveRoom',(room)=>{
        leaveRoom(room);
    })

    // coantrols
    socket.on('up',()=>{
        socket.broadcast.to(socket.curRoom.name).emit('up',socket.id);
    })
    
    socket.on('right',()=>{
        socket.broadcast.to(socket.curRoom.name).emit('right',socket.id);
    })
    
    socket.on('down',()=>{
        socket.broadcast.to(socket.curRoom.name).emit('down',socket.id);
    })
    
    socket.on('left',()=>{
        socket.broadcast.to(socket.curRoom.name).emit('left',socket.id);
    })
    
    socket.on('idle',()=>{
        socket.broadcast.to(socket.curRoom.name).emit('idle',socket.id);
    })

    socket.on('disconnect', (from) => {
        if(socket.curRoom){
            leaveRoom(socket.curRoom);
        }
            
    });
});