import gGameEngine from './GameEngine.js';
var name='dummy';


window.init = () => {
    gGameEngine.load();
}

if('serviceWorker' in navigator ){
    // navigator.serviceWorker.register('./service-worker.js');
}

var setName=()=>{
    name=document.getElementById('pnameInp').value;
    document.getElementById('pname').style.display='block';
    document.getElementById('pname').innerHTML=name;
    document.getElementById('pnameInp').style.display='none';
    document.getElementById('pnameBtn').innerText='Change';
    document.getElementById('pnameBtn').onclick=window.changeName;
    
}

window.changeName=()=>{
    document.getElementById('pname').style.display='none';
    document.getElementById('pnameInp').style.display='block';
    document.getElementById('pnameInp').value=name;
    document.getElementById('pnameBtn').innerText='Set';
    document.getElementById('pnameBtn').onclick=setName;
}