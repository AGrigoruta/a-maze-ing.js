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
            io.in(socket.curRoom.name).emit('gameWillBegin',true);
            setTimeout(() => {
                
            }, 3000);
        }
        socket.emit('getPlayers', roomdata.get(socket, "players"));
        socket.broadcast.to(socket.curRoom.name).emit('player_conn',{id:socket.id,name:socket.name});
    })

    socket.on('leaveRoom',(room)=>{
        leaveRoom(room);
    })

    socket.on('disconnect', (from) => {
        if(socket.curRoom){
            leaveRoom(socket.curRoom);
        }
            
    });
});