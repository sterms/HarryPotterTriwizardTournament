var AM = new AssetManager();
var selectedCharacter = null;
/*
function Animation(spriteSheet, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) this.elapsedTime = 0;
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    if (frame > 13) {
        frame = 26 - frame;
    }
    xindex = frame % 5;
    yindex = Math.floor(frame / 5);

    console.log(frame + " " + xindex + " " + yindex);

    ctx.drawImage(this.spriteSheet,
                 xindex * this.frameWidth, yindex * this.frameHeight,  // source from sheet
                 this.frameWidth, this.frameHeight,
                 x, y,
                 this.frameWidth,
                 this.frameHeight);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}
Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}
*/


AM.queueDownload("./assets/IntroScreen.png");
AM.queueDownload("./assets/pickcharacter.png");
AM.queueDownload("./assets/hedwigstheme.m4a");
AM.queueDownload("./assets/Tutorial.png");
AM.queueDownload("./assets/dementor.png");
AM.queueDownload("./assets/hedge.jpg");
AM.queueDownload("./assets/northern.jpg");
AM.queueDownload("./assets/wandhand.png");
AM.queueDownload("./assets/wandhand1.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");
    
    var theme = new Audio("assets/hedwigstheme.m4a");
    theme.play();
    var selectedCharacter;
    
    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();
    
    var raycaster = new RayCasterEngine();
    
    document.getElementById("splashscreen").onclick = function() {
        document.getElementById("splashscreen").style.display = "none";
        document.getElementById("pickcharacter").style.display = "block"; 
    };
    
    /*
    document.getElementById("pickcharacter").onclick = function() {
        document.getElementById("pickcharacter").style.display = "none";
        document.getElementById("tutorial").style.display = "block";    
    };*/
    document.getElementById("harry").onclick = function() {
        raycaster.character = 'harry';
        console.log("Selected Harry");
        document.getElementById("pickcharacter").style.display = "none";
        document.getElementById("tutorial").style.display = "block"; 
    };
    
    document.getElementById("hermione").onclick = function() {
        raycaster.character = 'hermione';
        console.log("Selected Hermione");
        document.getElementById("pickcharacter").style.display = "none";
        document.getElementById("tutorial").style.display = "block"; 
    };
    
    document.getElementById("ron").onclick = function() {
        raycaster.character = 'ron';
        console.log("Selected Ron");
        document.getElementById("pickcharacter").style.display = "none";
        document.getElementById("tutorial").style.display = "block"; 
    };
    
    document.getElementById("tutorial").onclick = function() {
        document.getElementById("tutorial").style.display = "none";
        document.getElementById("gamescreen").style.display = "block";
        theme.pause();
        raycaster.run();
    };
});