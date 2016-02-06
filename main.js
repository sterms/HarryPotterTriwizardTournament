var AM = new AssetManager();
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
AM.queueDownload("./assets/dementor.png");
AM.queueDownload("./assets/hedge.jpg");
AM.queueDownload("./assets/northern.jpg");
AM.queueDownload("./assets/wandhand.png");
AM.queueDownload("./assets/wandhand1.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");
    
    //Function to make the splash screen disappear when it is clicked
    function clicked() {
        document.getElementById("splashscreen").style.display = "none"; //splash screen disappear
        document.getElementById("gamescreen").style.display = "block"; //game screen appear
    }
        
    //Listen for click event to make splash screen go away
    document.getElementById("splashscreen").addEventListener("click", clicked, false);

	var gameEngine = new GameEngine();
	gameEngine.init(ctx);
	gameEngine.start();
    var raycaster = new RayCasterEngine();
    raycaster.run();
    
    console.log("All Done!");
});