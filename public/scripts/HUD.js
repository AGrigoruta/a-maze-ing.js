export default class HUD{
    generateRandomColor(count,health){
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        if(count>5){
            if(health<25){
                return '#f44141';
            }
            if(health<50){
                return '#f4bb41';
            }
            if(health<75){
                return '#d3f441';
            };
            return '#42f448';
        }
        return color;
    }

    updateHealth(health){
        document.getElementById('health__current').style.width = `${health}%`;
        var count=0;
        const flash = setInterval(()=>{
            document.getElementById('health__current').style.background=this.generateRandomColor(count,health);
            if(count>5){
                clearInterval(flash);
                
            }
            count++;
        },50)
    }
}