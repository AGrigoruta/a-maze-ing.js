import gGameEngine from './GameEngine.js';
// import io from './socket.io.js';
var me={
    id:null,
    name:'dummy'
}
var socket=io.connect();
var client_rooms=[];
var curRoom;
var roomPlayers=[];
window.init = () => {
    gGameEngine.load();
}

if('serviceWorker' in navigator ){
    // navigator.serviceWorker.register('./service-worker.js');
}

var setName=()=>{
    me.name=document.getElementById('pnameInp').value;
    document.getElementById('pname').style.display='block';
    document.getElementById('pname').innerHTML=me.name;
    document.getElementById('pnameInp').style.display='none';
    document.getElementById('pnameBtn').innerText='Change';
    document.getElementById('pnameBtn').onclick=window.changeName;
    
}

window.changeName=()=>{
    document.getElementById('pname').style.display='none';
    document.getElementById('pnameInp').style.display='block';
    document.getElementById('pnameInp').value=me.name;
    document.getElementById('pnameBtn').innerText='Set';
    document.getElementById('pnameBtn').onclick=setName;
}

document.getElementById("submit").onclick=()=>{
    let room={
        players:document.getElementById("roomPNumber").value,
        ai:document.getElementById("aicheck").checked,
        connPlayers:0
    }
    room.name=`Room #${Math.floor((Math.random()*10000)+1)}`;
    socket.emit('newRoom', {room:room,name:me.name});
    curRoom=room;
    roomPlayers.push(me);
    document.getElementById("join").style.width=0;
    document.getElementById("create").style.width=0;
    document.getElementById("current").style.width='400px';
    document.getElementById("pnameBtn").style.display='none';
}

var joinRoom=(room)=>{
    curRoom=room;
    socket.emit('connRoom',{room:room,name:me.name});
    document.getElementById("join").style.width=0;
    document.getElementById("create").style.width=0;
    document.getElementById("current").style.width='400px';
    document.getElementById("pnameBtn").style.display='none';
}

window.leaveRoom=()=>{
    socket.emit('leaveRoom',curRoom);
    document.getElementById("join").style.width='400px';
    document.getElementById("create").style.width='400px';
    document.getElementById("current").style.width=0;
    document.getElementById("pnameBtn").style.display='block';
    curRoom=null;
}


var addRoom=(room)=>{
    var template = document.getElementById("roomTempl").cloneNode(true);
    template.id=room.name;
    template.classList.remove("template");
    template.firstElementChild.innerHTML=room.name;
    template.lastElementChild.onclick=()=>{
        joinRoom(room);
    }
    document.getElementById("roomDispCont").appendChild(template);
}

socket.on('connect',(id)=>{
    
});

// get rooms and my id from server

socket.on('rooms',(obj)=>{
    client_rooms=obj.rooms;
    me.id=obj.id;
    client_rooms.forEach(room => {
        addRoom(room);
    });
});

// mantain server-client data accuracy
// start
socket.on('newRoom',(room)=>{
    client_rooms.push(room);
    addRoom(room);
});

socket.on('deleteRoom',(room)=>{
    var index=client_rooms.findIndex(x => x.name==room.name);
    client_rooms.splice(index,1);
    document.getElementById(room.name).remove();
});

// end

socket.on('player_conn',(player)=>{
    roomPlayers.push(player);
    console.log(roomPlayers)
})