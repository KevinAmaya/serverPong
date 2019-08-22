const express = require('express');
const Http = require("http").Server(express);
const app = express();

const maxHeight = 600;
const maxWidth = 800;
let score_p1 = 0;
let score_p2 = 0;
let last_time_update = Date.now();
let FPS = 60;
let players_online=0;
let run_program = false; 

const resetEverything = function(){
    score_p1 = 0;
    score_p2 = 0;
    last_time_update = Date.now();
    FPS = 60;
    run_program = false; 
    players = [Player(20,20,1),Player(760,10,2)]
    ball = Ball(maxWidth/2, maxHeight/2);
}

const rectcollided = function(rect1,rect2){
    if (rect1.getX() < rect2.getX() + rect2.getWidth() &&
        rect1.getX() + rect1.getWidth() > rect2.getX() &&
        rect1.getY() < rect2.getY() + rect2.getHeigth() &&
        rect1.getHeigth() + rect1.getY() > rect2.getY()){       
        return true;
    }
    else{
        return false;
    }
}

const Player = (nPosX, nPosY,nNumber) => {
    const number = nNumber;  
    let posX = nPosX;
    let posY = nPosY;
    const type = 1;
    const width = 10;
    const heigth = 80;

    return{
        move : function(type){
            if((posY+(type*velocity_player))<0){
                posY=0;
            }
            else if((posY+heigth+(type*velocity_player))>maxHeight){
                posY = maxHeight-heigth;
            }
            else{
                posY+=type*velocity_player;
            }
        },
        getX: function(){
            return posX;
        },
        getY: function(){
            return posY;
        },
        getWidth: function(){
            return width;
        },
        getHeigth: function(){
            return heigth;
        },
        getType: function(){
            return type;
        }
    }  
}

let players = [Player(20,20,1),Player(760,10,2)]

const Ball = (nPosX, nPosY) => {
    let posX = nPosX;
    let posY = nPosY;
    let vel_y = -8;
    let vel_x = 8;
    const width = 10;
    const heigth = 10;
    const type = 1;

    return{
        moveBall: function(){
            let ball = Ball(posX,posY)
            let collided = false;
            let playerScored =0 ;
            let cpy_ball = Ball(posX+(vel_x-1),posY+(vel_y-1));

            for (let player of players){
                
                if(rectcollided(cpy_ball,player)){
                    collided = true;
                }
            }
            if((posY+heigth+vel_y)>maxHeight || (posY+vel_y)<0){
                vel_y = -vel_y;
            }
            if(collided){
                vel_x = -vel_x;
            }
            if((posX+width+vel_x)>maxWidth || (posX+vel_x)<0){
                if ((posX+width+vel_x)>maxWidth){
                    score_p1++;
                }
                else{
                    score_p2++;
                }
                posX = maxWidth/2;
                posY = maxHeight/2;
                vel_x = -vel_x;
            }
            posX += vel_x;
            posY += vel_y;
            return playerScored;
        },
        getX: function(){
            return posX;
        },
        getY: function(){
            return posY;
        },
        setX: function(nPosX){
            posX = nPosX;
        },
        setY: function(nPosY){
            posY = nPosY;
        },
        getWidth: function(){
            return width;
        },
        getHeigth: function(){
            return heigth;
        },
        getType: function(){
            return type;
        }
    }
}

const server = app.listen(3000, function() {
    console.log('server running on port :3000');
});

let ball = Ball(0,400);
const velocity_player = 15;
const io = require('socket.io')(server);

io.on('connection', function(socket) {
    socket.on("update", data => {
        if(run_program){
            if(data!=null){
                if(data[0]==1){
                    players[0].move(data[1]);
                }
                else{
                    players[1].move(data[1]);
                }    
            }
            if((Date.now() - last_time_update)>(1000/FPS)){
                
                ball.moveBall()
        
                io.emit('update', [players[0].getY(),players[1].getY(),
                ball.getX(),ball.getY(),score_p1,score_p2]);    
                last_time_update = Date.now();
            }
        }
    });

    
});

io.on('connect', function (socket) { 
    players_online++; 
    run_program = (players_online>1);
    socket.on('disconnect', function () {
        if(players_online>0)
            players_online--;
        if(!run_program){
            resetEverything()
        }
        run_program = (players_online>1);
    });
});



