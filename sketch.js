var circles = new Array(0);
var currEn = new Array(0);
var counter = 500;
var colR = 0;
var colG = 0;
var colB = 0;
var canCreate = false;
var smoove = true;
var yourScore = 0;
var otherScore = 0;
var player = 0;
var gameEnd = false;

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
}

function draw() {
    if(counter%80 == 0){
        colR = random(255);
        colG = random(255);
        colB = random(255);
    }
    if(smoove){
        background(colR, colG, colB, 20);
    }
    else {
        if(counter%80 == 0) {
            background(colR, colG, colB);
        }
    }
    stroke(255-colR, 255-colG, 255-colB);
    strokeWeight(5);
    line(0, 550, 1200, 550);
    noStroke();
    for(var i=0; i<circles.length; i++){
        circles[i].update();
        circles[i].display();
    }
    for(var i=0; i<currEn.length; i++){
        currEn[i].update();
        currEn[i].display();
    }
    fill(255, 255, 255);
    if(player == 0) {
         text("waiting for player", 450, 200);
    }
    if(smoove) {
        text("fade", 10, 40);
    }
    else{
        text("solid", 10, 40);
    }
    if(counter <= 300) {
        text("click, hold, and spin to create a ball", 270, 700);
        text("click on a ball to deflect it away", 300, 750);
        text("bigger balls mean bigger points", 295, 800);
        
    }
    text(yourScore, 1100, 870);
    text(otherScore, 1100, 50);
counter++;
    
    if(yourScore >= 2500){
        canCreate = false;
        gameEnd = true;
        text("you win", 525, 450);
    }
    if(otherScore >= 2500){
        canCreate = false;
        gameEnd = true;
        text("you lose", 525, 450);
    }
    
}
function mousePressed() {
    for(var i=0; i<circles.length; i++){
        circles[i].poke();
    }
    if(dist(mouseX, mouseY, 50, 30)< 50) {
        smoove = !smoove;
        if(!smoove) {
            counter += 78-(counter%80);
        }
    }
    if(canCreate){
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
        