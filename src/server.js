const express = require('express');
const app = express();
const server = require('http').Server(app);
const chalk = require('chalk');

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

io.on('connection', (socket) => {
    socket.curRoom=null;
    socket.name=null;
    var leaveRoom=(room)=>{
        socket.leave(socket.room);
        var index=this._rooms.findIndex(x => x.name==room.name);
        this._rooms[index].connPlayers--;
        socket.curRoom=null;
        if(this._rooms[index].connPlayers==0){
            this._rooms.splice(index,1);
            io.emit('deleteRoom',room);
        }
    }
    socket.emit('rooms',{rooms:this._rooms,id:socket.id});
    socket.on('newRoom',(obj)=>{
        room=obj.room;
        socket.name=obj.name;
        socket.join(room.name);
        socket.rooms.players=[];
        socket.rooms.players.push({id:socket.id, name:socket.name});
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
        socket.join(room.name);
        socket.rooms.players.push({id:socket.id, name:socket.name});
        console.log(socket.rooms)
        socket.curRoom=room;
        var index=this._rooms.findIndex(x => x.name==room.name)
        this._rooms[index].connPlayers++;
        io.to(socket.curRoom.name).emit('player_conn',{id:socket.id,name:socket.name});
    })

    socket.on('leaveRoom',(room)=>{
        leaveRoom(room);
    })

    socket.on('disconnect', (from) => {
        if(socket.curRoom){
            console.log(socket.curRoom)
            leaveRoom(socket.curRoom);
        }
            
    });
});