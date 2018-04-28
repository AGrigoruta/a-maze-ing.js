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
// window.init = () => {
//     gGameEngine.load();
// }

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
    document.getElementById('pnameInp').focus();
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
    addPlayer(me);
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
    while (document.getElementById("playerDispCont").lastChild) {
        if(document.getElementById("playerDispCont").lastChild.id=='playerTempl')
            break;
        document.getElementById("playerDispCont").removeChild(document.getElementById("playerDispCont").lastChild);
    }
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

var addPlayer=(player)=>{
    var template = document.getElementById("playerTempl").cloneNode(true);
    template.id=player.id;
    template.classList.remove("template");
    template.firstElementChild.innerHTML=player.name;
    document.getElementById("playerDispCont").appendChild(template);
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
    client_rooms.splice(client_rooms.indexOf(room),1);
    document.getElementById(room.name).remove();
});

socket.on('player_conn',(player)=>{
    roomPlayers.push(player);
    addPlayer(player);
})

socket.on('getPlayers',(players)=>{
    roomPlayers=players;
    roomPlayers.forEach(player => {
        addPlayer(player);
    });
})

socket.on('player_left',(player)=>{
    roomPlayers.splice(roomPlayers.indexOf(player),1);
    document.getElementById(player.id).remove();
})

// end

socket.on('gameWillBegin',(maze)=>{
    var count=3;
    const timer=setInterval(()=>{
        count--;
        document.getElementById("status").innerHTML=`Game starts in ${count}..`
        if(count==0){
            gGameEngine.load(roomPlayers,maze,me.id,socket);
            clearInterval(timer);
            document.getElementById("game__health").style.opacity=1;
            document.getElementById("game__wood").style.opacity=1;
            document.getElementById("game__gui").style.height=0;
        }
    },1000)
})

document.getElementById("backtolobby").addEventListener('click',()=>{
    document.getElementById("end__splash").style.height=0;
    window.leaveRoom();
    document.getElementById("game__gui").style.height='672px';
    document.getElementById("status").innerHTML='Waiting for players to join...';
    document.getElementById("game__health").style.opacity=0;
    document.getElementById('health__current').style.width = `100%`;
    document.getElementById('health__current').style.background='#42f448';
    document.getElementById("game__wood").style.opacity=0;
    document.getElementById('pname').style.color='white';
    setTimeout(() => {
        gGameEngine.unload();
        gGameEngine.reinit();
    }, 3000);
    
})