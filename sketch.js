var circles = new Array(0);
var currEn = new Array(0);
var counter = 500;
var colR = 0;
var colG = 0;
var colB = 0;
var canCreate = false;
var drawMode = 1;
var yourScore = 0;
var otherScore = 0;
var player = 0;
var gameEnd = false;
var disconnect = false;
var textCol = "#fff";

function Ball(x, y, d, mx, my, id) {
    this.x = x;
    this.y = y;
    this.mx = mx;
    this.my = my;
    this.d = d;
    this.isActive = true;
    this.curSpd = 6;
    this.id = id;
    this.score = 0;
    
    this.display = function(){
        if(this.isActive){
        fill(255-colR, 255-colG, 255-colB);
        }
        else {
            fill(255, 255-colR, 255-colR);
        }
        ellipse(this.x, this.y, this.d, this.d);
    }
    
    this.update = function() {
        if(this.isActive){
            if(gameEnd) {
                this.isActive = false;
            }
        this.x += this.mx;
        this.y += this.my;
        if ((this.x+this.mx)>=(1200-(this.d/2)) || ((this.x+this.mx)<=(this.d/2))) {
            this.mx *= -1;
        }
        if ((this.y)>=(900) || ((this.y)<=0)) {
            this.isActive = false;
            this.score++;
            socket.emit('score', this.id);
        }
    }
        if(this.score == 2){
            if(this.y <= 0) {
                yourScore += parseInt(this.d);
            }
            else{
                otherScore += parseInt(this.d);
            }
            this.score = 0;
        }
    }
    this.poke = function() {
        if(dist(this.x, this.y, mouseX, mouseY) <= d/2 && mouseY >= 550 && this.isActive) {
            this.curSpd += .5;
            var spdM = this.curSpd/(Math.abs(mouseX - this.x) + Math.abs(mouseY - this.y));
            this.mx = (this.x - mouseX)*spdM;
            this.my = -1*Math.abs(mouseY - this.y)*spdM;
            this.score = 0;
            socket.emit('ballPoke',{
                        'x': this.x, 'y': this.y, 'mx': this.mx, 'my': this.my, 'id': this.id
                        });
        }
    }
}

function Energy(x, y) {
    this.x = x;
    this.y = y;
    this.d = 0;
    this.lmx = mouseX;
    this.lmy = mouseY;
    this.active = true;
    
    this.display = function(){
        if(this.active){
        fill(255-colR, 255-colG, 255-colB);
        ellipse(this.x, this.y, this.d, this.d);
        }
    }
    
    this.update = function(){
        if(this.active && counter%3 == 0){
            this.d += dist(this.lmx, this.lmy, mouseX, mouseY)/20;
            if(this.d >= 200) {
                this.d = 200;
            }
            if(gameEnd) {
                this.active = false;
            }
            if(!mouseIsPressed) {
                if(this.d >=30){
                    var id = random(65535);
                    var spdM =6/(Math.abs(mouseX - this.x) + Math.abs(mouseY - this.y));
                    circles.push(new Ball(this.x, this.y, this.d, (mouseX - this.x)*spdM, -1*Math.abs(mouseY - this.y)*spdM, id));
                    socket.emit('createBall',{
                                'x': this.x,
                                'y': this.y,
                                'd': this.d,
                                'mx': (mouseX - this.x)*spdM,
                                'my': -1*Math.abs(mouseY - this.y)*spdM,
                                'id': id
                                });
                }
                this.active = false;
            }
            this.lmx = mouseX;
            this.lmy = mouseY;
        }
    }
}

function setup() {
    createCanvas(1200, 900);
    noStroke();
    textSize(40);
    cursor(CROSS);
}

function draw() {
    if(counter%100 == 0){
        do{
        colR = random(255);
        colG = random(255);
        colB = random(255);
        }
        while((Math.abs(colR-128)<25)&&(Math.abs(colG-128)<25)&&(Math.abs(colB-128)<25));
    }
    switch(drawMode){
        case 1:
            background(colR, colG, colB, 20);
            break;
        case 0:
        if(counter%100 == 0) {
            background(colR, colG, colB);
        }
            break;
        case 2:
            background(colR, colG, colB);
    }
    stroke(255-colR, 255-colG, 255-colB);
    strokeWeight(5);
    line(0, 550, 1200, 550);
    line(0, 350, 1200, 350);
    strokeWeight(10);
    noFill();
    rect(0,0,1200,900);
    noStroke();
    for(var i=0; i<circles.length; i++){
        circles[i].update();
        circles[i].display();
    }
    for(var i=0; i<currEn.length; i++){
        currEn[i].update();
        currEn[i].display();
    }
    fill(textCol);
    if(player == 0) {
        textAlign(CENTER);
        text("waiting for player", 600, 200);
    }
    textAlign(LEFT);
    switch(drawMode){
        case 1:
            text("fade", 10, 40);
            break;
        case 0:
            text("solid", 10, 40);
            break;
        case 2:
            text("simple", 10, 40);
            break;
    }
    if(counter < 500) {
        textAlign(CENTER);
        text("click, hold, and spin to create a ball", 600, 600);
        text("click on a ball to deflect it away", 600, 650);
        text("you can only do stuff on this side of the field", 600, 700);
        text("get balls off the other side to score", 600, 750);
        text("bigger balls mean bigger points", 600, 800);
        
        
    }
    textAlign(RIGHT);
    text("you: " + yourScore, 1175, 880);
    text("opponent: " + otherScore, 1175, 40);
counter++;
    
    if(yourScore >= 2500){
        textAlign(CENTER);
        canCreate = false;
        gameEnd = true;
        text("you win", 600, 450);
    }
    if(otherScore >= 2500){
        textAlign(CENTER);
        canCreate = false;
        gameEnd = true;
        text("you lose", 600, 450);
    }
    
    if(((colR+colG+colB)/3)<160){
        textCol = "#fff";
    }
    else {
        textCol = "#000";
    }
    if(disconnect){
        background(0,0,0);
        fill(255,255,255);
        textAlign(CENTER);
        text("other client disconnected, please refresh", 600, 450);
    }
}
function mousePressed() {
    for(var i=0; i<circles.length; i++){
        circles[i].poke();
    }
    if(dist(mouseX, mouseY, 50, 30)< 50) {
        drawMode++;
        if(drawMode > 2) {
            drawMode = 0;
            counter += 98-(counter%100);
        }
    }
    if(canCreate && mouseY >= 550){
    currEn.push(new Energy(mouseX, mouseY));
    }
}

function ballCreated(data) {
    circles.push(new Ball(1200-data.x, 900-data.y, data.d, -1*data.mx, -1*data.my, data.id));
}

function ballPoked(data){
    var circ = findID(data.id);
    circles[circ].x = 1200-data.x;
    circles[circ].y = 900-data.y;
    circles[circ].mx = -1*data.mx;
    circles[circ].my = -1*data.my;
    circles[circ].curSpd += .5;
    circles[circ].isActive = true;
    circles[circ].score = 0;
}

function start(playNum) {
    player = playNum;
    canCreate = true;
    counter = 0;
}
function findID(id) {
    for(var i=0; i<circles.length; i++){
        if(circles[i].id==id){
            return i;
        }
    }
}
function scoreReg(id) {
    circles[findID(id)].score++;
}
        
function disconnected() {
    disconnect = true;
}