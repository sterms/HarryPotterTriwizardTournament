function Wall(texture, height) {
	this.height = height;
	this.texture = texture;
};

function Object(animation, height, width, isDestructable, damageDealt) {
	this.active = 0;
	this.height = height;
	this.width = width;
	this.animation = animation;
	this.isDestructable = isDestructable;
	this.health = 100;
	this.damageDealt = damageDealt; //DPS, or Damage per update.
	this.distanceFromPlayer = -1;
};

Object.prototype.updateHealth = function(number) {
	if(this.isDestructable) {
		this.health += number;
	}
}

function Projectile(x, y, pageX, animation, map, weaponDamage) {
	this.x = x;
	this.y = y;
	this.pageX = pageX;
	this.angle = -1;
	this.animation = animation;
	this.map = map;
	this.speed = .5;
	this.line; //Unused
	this.distance = 0; // Unused
	this.scaleFactor = 1;
	this.weaponDamage = weaponDamage;
}

Projectile.prototype.getFrameOffset = function() {
	return this.animation.getFrameOffset(true);
}

Projectile.prototype.setAngle = function(angle, player) {
	if(this.angle == -1) {
		this.angle = angle + player.direction;
		//console.log("Angle: " + angle);
		this.line = {m: Math.tan(angle), b: this.y - this.x * Math.tan(angle)};
		//console.log("Slope: " + this.line.m);
	}
}

Projectile.prototype.update = function(player, map) {	
	if(this.angle != -1) {
		//console.log("inside projectile update");
		this.distance = map.getDistance({x: this.x, y: this.y}, {x: player.x, y: player.y});
		var sin = Math.sin(this.angle);
		var cos = Math.cos(this.angle);
		//console.log("Player DIR: " + player.direction);
		this.x += this.speed * cos;
		this.y += this.speed * sin;		
		
		if(map.getWall(Math.floor(this.x), Math.floor(this.y)).height > 0) {
			//console.log("Projectile hit wall! at " + Math.floor(this.x) + ", " + Math.floor(this.y));
			map.projectileGrid.splice(map.projectileGrid.indexOf(this), 1);
		}
		if(map.getObject(Math.floor(this.x), Math.floor(this.y)).height > 0) {
			//console.log("Projectile hit object! at "  + Math.floor(this.x) + ", " + Math.floor(this.y));
			map.projectileGrid.splice(map.projectileGrid.indexOf(this), 1);
			console.log("Damaged for: " + this.weaponDamage);
			map.getObject(Math.floor(this.x), Math.floor(this.y)).updateHealth(-1 * this.weaponDamage); //Projectile Damage, if we do multiple spells call object.damage or whatever.
			if(map.getObject(Math.floor(this.x), Math.floor(this.y)).health <= 0) {
				var rand = (Math.random() * 10);
				console.log("Rand: " + rand);
				if (rand > 7) {
					console.log("generating book");
					map.setObject(Math.floor(this.x), Math.floor(this.y), new Object(new Animation(new ImageFile('assets/book.png', 300, 300), 1, 1000), 0, 0, false, 0));
					map.getObject(Math.floor(this.x), Math.floor(this.y)).height = .4;
				}  else if (rand < 4 && !map.mapDropped) {
					console.log("generating map");
					map.mapDropped = true;
					map.setObject(Math.floor(this.x), Math.floor(this.y), new Object(new Animation(new ImageFile('assets/map.png', 300, 300), 1, 1000), 0, 0, false, 0));
					map.getObject(Math.floor(this.x), Math.floor(this.y)).height = .45;
				} else {
					map.getObject(Math.floor(this.x), Math.floor(this.y)).height = 0;
				}
				player.kills++;
			}
		} 
		this.scaleFactor *= .5;
		this.getFrameOffset(); //Advance frame.
	}
}


function Map(level) {	
	
        this.size;
        this.wallGrid = [];
		this.objectGrid = [];
		this.projectileGrid = [];
		this.victoryCell = {x: 0, y: 0};
		this.mapWon = false;
		this.mapDropped = false;
		this.playerSpawn = {x: 1.5, y: 1.5};
		this.defaultWallTexture;
		this.skybox;
        this.light;	
		this.weather; 
		this.defaultWeather;
                this.miniMap = new Image(400, 400);
		
		this.getLevelProperties(level);		
		this.initializeLevel();		
		this.buildLevel(level);

		//this.wallTextures.push(new ImageFile('assets/bricks.jpg', 2048, 2048));
      }
	  
	Map.prototype.initializeLevel = function() {
		for(var i = 0; i < this.size * this.size; i++) {
			this.wallGrid.splice(i, 1, new Wall(this.defaultWallTexture, 0));
			this.objectGrid.splice(i, 1, new Object(new Animation(new ImageFile('assets/dementorStrip.png', 2000, 270), 6, 317), 0, .1, true, 1));  //Modified with to work with new animation strip.
			//Removed 'Blank Texture'. Only 1 enemy type now though.
		}
	};  
	  
	  
	Map.prototype.getLevelProperties = function(level) {
		if(level == 1)  {
			//Include a default for no crashing...
			this.size = 21;
			this.victoryCell = {x: 4, y:20};
			this.defaultWallTexture = new ImageFile('assets/hedge.jpg', 1024, 1024);
			this.skybox = new ImageFile('assets/potterscape.jpg', 2000, 750);
			this.light = 0;	
			this.weather = 'RAIN'; 
			this.defaultWeather = 'RAIN'; 
			this.playerSpawn = {x: 1.5, y: 1.5};
                        this.miniMap.src = "assets/level1.jpg";
		} else if (level == 2) {	
			this.size = 21;
			this.victoryCell = {x: 20, y: 1};
			this.defaultWallTexture = new ImageFile('assets/icewall.jpg', 510, 512);
			this.skybox = new ImageFile('assets/northern.jpg', 2000, 750);
			this.light = 0;	
			this.weather = 'SNOW'; 
			this.defaultWeather = 'SNOW'; 	
			this.playerSpawn = {x: 1.5, y: 1.5};
                        this.miniMap.src = "assets/level2.jpg";
		} else if (level == 3) {
			this.size = 21;
			this.victoryCell = {x: 1, y: 20};
			this.defaultWallTexture = new ImageFile('assets/wood.jpg', 1022, 1024);
			this.skybox = new ImageFile('assets/summerscape.jpg', 2000, 750);
			this.light = 1;	
			this.weather = 'NONE'; 
			this.defaultWeather = 'NONE'; 
			this.playerSpawn = {x: 11.5, y: 1.5};
                        this.miniMap.src = "assets/level3.jpg";
		} else if (level == 4) {			
			this.size = 21;
			this.victoryCell = {x: 20, y: 19};
			this.defaultWallTexture = new ImageFile('assets/burntwood.jpg', 598, 407);
			this.skybox = new ImageFile('assets/hellscape.jpg', 2000, 750);
			this.light = 0;	
			this.weather = 'ACID'; //Acid rain?
			this.defaultWeather = 'ACID'; 
			this.playerSpawn = {x: 5.5, y: 1.5};
                        this.miniMap.src = "assets/level4.jpeg";
		} else { //Place holding, test level
			this.size = 16;
			this.victoryCell = {x: 4, y:20};
			this.defaultWallTexture = new ImageFile('assets/hedge.jpg', 2048, 2048);
			this.skybox = new ImageFile('assets/potterscape.jpg', 2000, 750);
			this.light = 0;	
			this.weather = 'RAIN'; 
		}
	}  
	
	Map.prototype.buildLevel = function(level) {
			//Build Walls all around, and be universally used.
				//North wall.
			for(var i = 0; i < this.size; i++) {
				this.wallGrid[0 * this.size + i].height = 1;
			}
				//South wall.
			for(var i = 0; i < this.size; i++) {
				this.wallGrid[(this.size-1) * this.size + i].height = 1;
			}
				//West wall.
			for(var i = 0; i < this.size; i++) {
				this.wallGrid[i * this.size + 0].height = 1;
			}
				//East wall.
			for(var i = 0; i < this.size; i++) {
				this.wallGrid[i * this.size + (this.size-1)].height = 1;
			}
			//End of border build.
		
		
		if(level == 1) { //'Hedge Maze'
			//this.buildIntroLevel();
			//Formula: this.wallGrid[y * this.size + x]
			
			//Build row by row on the Y axis...
			//Y1
			this.wallGrid[1 * this.size + 4].height = 1;
			//Y2
			this.wallGrid[2 * this.size + 2].height = 1; this.wallGrid[2 * this.size + 4].height = 1;
				for(var i = 6; i <= 18; i++) {
					this.wallGrid[2 * this.size + i].height = 1;
				}
			//Y3
			this.wallGrid[3 * this.size + 2].height = 1; this.wallGrid[3 * this.size + 4].height = 1; this.wallGrid[3 * this.size + 6].height = 1; this.wallGrid[2 * this.size + 8].height = 1;
			//Y4
			this.wallGrid[4 * this.size + 2].height = 1; this.wallGrid[4 * this.size + 4].height = 1; this.wallGrid[4 * this.size + 6].height = 1; this.wallGrid[4 * this.size + 8].height = 1;
				for(var i = 10; i <= 14; i++) {
					this.wallGrid[4 * this.size + i].height = 1;
				}
				this.wallGrid[4 * this.size + 16].height = 1; this.wallGrid[4 * this.size + 18].height = 1; 
			//Y5
			this.wallGrid[5 * this.size + 2].height = 1; this.wallGrid[5 * this.size + 6].height = 1; this.wallGrid[5 * this.size + 8].height = 1; this.wallGrid[5 * this.size + 10].height = 1; 
				this.wallGrid[5 * this.size + 14].height = 1; this.wallGrid[5 * this.size + 16].height = 1; this.wallGrid[5 * this.size + 18].height = 1; 
			//Y6
			for(var i = 2; i <= 6; i++) {
				this.wallGrid[6 * this.size + i].height = 1; 
			}
				this.wallGrid[6 * this.size + 8].height = 1; 
				for(var i = 10; i <= 12; i++) {
					this.wallGrid[6 * this.size + i].height = 1; 
				}
				this.wallGrid[6 * this.size + 14].height = 1; 
				for(var i = 16; i <= 18; i++) {
					this.wallGrid[6 * this.size + i].height = 1; 
				}
			//Y7
			this.wallGrid[7 * this.size + 2].height = 1; this.wallGrid[7 * this.size + 8].height = 1; this.wallGrid[7 * this.size + 12].height = 1; this.wallGrid[7 * this.size + 14].height = 1; this.wallGrid[7 * this.size + 18].height = 1; 
			//Y8
			for(var i = 2; i <= 4; i++) {
				this.wallGrid[8 * this.size + i].height = 1; 
			}
				this.wallGrid[8 * this.size + 6].height = 1; 
				for(var i = 8; i <= 10; i++) {
					this.wallGrid[8 * this.size + i].height = 1; 
				}
				this.wallGrid[8 * this.size + 12].height = 1; 
				for(var i = 14; i <= 16; i++) {
					this.wallGrid[8 * this.size + i].height = 1; 
				}
				this.wallGrid[8 * this.size + 18].height = 1; 
			//Y9
			this.wallGrid[9 * this.size + 4].height = 1; this.wallGrid[9 * this.size + 6].height = 1; this.wallGrid[9 * this.size + 12].height = 1; this.wallGrid[9 * this.size + 14].height = 1; this.wallGrid[9 * this.size + 18].height = 1; 
			//Y10
			this.wallGrid[10 * this.size + 1].height = 1; this.wallGrid[10 * this.size + 2].height = 1; this.wallGrid[10 * this.size + 4].height = 1;
				for(var i = 6; i <= 12; i++) {
					this.wallGrid[10 * this.size + i].height = 1;
				}
				this.wallGrid[10 * this.size + 14].height = 1;
				for(var i = 16; i <= 18; i++) {
					this.wallGrid[10 * this.size + i].height = 1;
				}
			//Y11
			this.wallGrid[11 * this.size + 4].height = 1; this.wallGrid[11 * this.size + 6].height = 1; this.wallGrid[11 * this.size + 14].height = 1; this.wallGrid[11 * this.size + 16].height = 1;
			//Y12
			for(var i = 2; i <= 14; i++) {
				if(i != 5 && i != 9) this.wallGrid[12 * this.size + i].height = 1;
			}
				this.wallGrid[12 * this.size + 16].height = 1; this.wallGrid[12 * this.size + 18].height = 1;
			//Y13
			this.wallGrid[13 * this.size + 2].height = 1; this.wallGrid[13 * this.size + 10].height = 1; this.wallGrid[13 * this.size + 16].height = 1; this.wallGrid[13 * this.size + 18].height = 1;
			//Y14
			this.wallGrid[14 * this.size + 2].height = 1;
			for(var i = 4; i <= 10; i++) {
				this.wallGrid[14 * this.size + i].height = 1;
			}
				for(var i = 12; i <= 14; i++) {
					this.wallGrid[14 * this.size + i].height = 1;
				}
				this.wallGrid[14 * this.size + 16].height = 1; this.wallGrid[14 * this.size + 18].height = 1; this.wallGrid[14 * this.size + 19].height = 1;
			//Y15
			this.wallGrid[15 * this.size + 2].height = 1; this.wallGrid[15 * this.size + 4].height = 1;
			for(var i = 6; i <= 8; i++) {
				this.wallGrid[15 * this.size + i].height = 1;
			}
				this.wallGrid[15 * this.size + 10].height = 1; this.wallGrid[15 * this.size + 14].height = 1; this.wallGrid[15 * this.size + 16].height = 1;
			//Y16
			for(var i = 2; i <= 4; i++) {
				this.wallGrid[16 * this.size + i].height = 1;
			}
				for(var i = 6; i <= 8; i++) {
					this.wallGrid[16 * this.size + i].height = 1;
				}
				this.wallGrid[16 * this.size + 10].height = 1; this.wallGrid[16 * this.size + 12].height = 1;
				for(var i = 14; i <= 18; i++) {
					this.wallGrid[16 * this.size + i].height = 1;
				}
			//Y17
			this.wallGrid[17 * this.size + 6].height = 1; this.wallGrid[17 * this.size + 10].height = 1; this.wallGrid[17 * this.size + 12].height = 1; this.wallGrid[17 * this.size + 16].height = 1;
			//Y18
			for(var i = 1; i <= 6; i++) {
				this.wallGrid[18 * this.size + i].height = 1;
			}
				for(var i = 8; i <= 14; i++) {
					this.wallGrid[18 * this.size + i].height = 1;
				}
				this.wallGrid[18 * this.size + 16].height = 1; this.wallGrid[18 * this.size + 18].height = 1; this.wallGrid[18 * this.size + 19].height = 1;
			//Y19
			this.wallGrid[19 * this.size + 16].height = 1;

			//Y20 - Victory Cell in wall
			this.wallGrid[20 * this.size + 4].height = 0; 
			this.objectGrid[20 * this.size + 4] = new Object(new Animation(new ImageFile('assets/trophy.png', 1000, 800), 1, 1000), 0, 0, false, 0);
			this.objectGrid[20 * this.size + 4].height = .6;
			
			//Enemies:
			this.objectGrid[1 * this.size + 8].height = 1; this.objectGrid[5 * this.size + 7].height = 1; this.objectGrid[5 * this.size + 9].height = 1; this.objectGrid[5 * this.size + 19].height = 1; 
			this.objectGrid[9 * this.size + 13].height = 1; this.objectGrid[11 * this.size + 5].height = 1; this.objectGrid[11 * this.size + 15].height = 1; this.objectGrid[16 * this.size + 9].height = 1; this.objectGrid[16 * this.size + 11].height = 1; 
			this.objectGrid[17 * this.size + 3].height = 1; this.objectGrid[19 * this.size + 13].height = 1; 
		} else if (level == 2) { //'Ice World'
			//Formula: this.wallGrid[y * this.size + x]
			
			//Build row by row on the Y axis...
			//Y1
			this.wallGrid[1 * this.size + 4].height = 1; this.wallGrid[1 * this.size + 16].height = 1; this.wallGrid[1 * this.size + 18].height = 1; this.wallGrid[1 * this.size + 20].height = 0; //Victory Cell
			this.objectGrid[1 * this.size + 20] = new Object(new Animation(new ImageFile('assets/trophy.png', 1000, 800), 1, 1000), 0, 0, false, 0); this.objectGrid[1 * this.size + 20].height = .6;
			//Y2
			this.wallGrid[2 * this.size + 2].height = 1;
			for(var i = 4; i <= 6; i++) {
				this.wallGrid[2 * this.size + i].height = 1;
			}
				for(var i = 8; i <= 14; i++) {
					this.wallGrid[2 * this.size + i].height = 1;
				}
				this.wallGrid[2 * this.size + 16].height = 1; this.wallGrid[2 * this.size + 18].height = 1;
			//Y3
			this.wallGrid[3 * this.size + 2].height = 1; this.wallGrid[3 * this.size + 8].height = 1; this.wallGrid[3 * this.size + 12].height = 1; this.wallGrid[3 * this.size + 16].height = 1;
			//Y4
			for(var i = 2; i <= 8; i++) {
				this.wallGrid[4 * this.size + i].height = 1;
			}
				for(var i = 10; i <= 16; i++) {
					if(i != 13) this.wallGrid[4 * this.size + i].height = 1;
				}
				this.wallGrid[4 * this.size + 18].height = 1;
			//Y5
			this.wallGrid[5 * this.size + 2].height = 1; this.wallGrid[5 * this.size + 6].height = 1; this.wallGrid[5 * this.size + 8].height = 1; this.wallGrid[5 * this.size + 12].height = 1;
			this.wallGrid[5 * this.size + 16].height = 1; this.wallGrid[5 * this.size + 18].height = 1;
			//Y6
			this.wallGrid[6 * this.size + 2].height = 1;
			for(var i = 4; i <= 18; i++) {
				if(i != 7 && i != 11 && i != 15) this.wallGrid[6 * this.size + i].height = 1; console.log("Lvl 2, Y6, building wall at X: " + i);
			}
			//Y7
			this.wallGrid[7 * this.size + 2].height = 1; this.wallGrid[7 * this.size + 12].height = 1; this.wallGrid[7 * this.size + 14].height = 1; this.wallGrid[7 * this.size + 18].height = 1;
			//Y8
			for(var i = 2; i <= 16; i++) {
				if(i != 5 && i != 9 && i != 13) this.wallGrid[8 * this.size + 2].height = 1;
			}
				this.wallGrid[8 * this.size + 18].height = 1;
			//Y9
			this.wallGrid[9 * this.size + 4].height = 1; this.wallGrid[9 * this.size + 8].height = 1; this.wallGrid[9 * this.size + 10].height = 1; this.wallGrid[9 * this.size + 16].height = 1; this.wallGrid[9 * this.size + 18].height = 1;
			//Y10
			this.wallGrid[10 * this.size + 1].height = 1; this.wallGrid[10 * this.size + 2].height = 1;
			for(var i = 4; i <= 6; i++) {
				this.wallGrid[10 * this.size + i].height = 1;
			}
				this.wallGrid[10 * this.size + 8].height = 1; this.wallGrid[10 * this.size + 10].height = 1; this.wallGrid[10 * this.size + 12].height = 1;
				for(var i = 14; i <= 16; i++) {
					this.wallGrid[10 * this.size + i].height = 1;
				}	
				this.wallGrid[10 * this.size + 18].height = 1;
			//Y11
			this.wallGrid[11 * this.size + 4].height = 1; this.wallGrid[11 * this.size + 8].height = 1; this.wallGrid[11 * this.size + 12].height = 1; this.wallGrid[11 * this.size + 16].height = 1; this.wallGrid[11 * this.size + 18].height = 1;
			//Y12
			for(var i = 2; i <= 16; i++) {
				if(i != 5 && i != 15) this.wallGrid[12 * this.size + i].height = 1;
			}
				this.wallGrid[12 * this.size + 18].height = 1;
			//Y13
			this.wallGrid[13 * this.size + 4].height = 1; this.wallGrid[13 * this.size + 6].height = 1; this.wallGrid[13 * this.size + 10].height = 1; this.wallGrid[13 * this.size + 14].height = 1;
			this.wallGrid[13 * this.size + 16].height = 1; this.wallGrid[13 * this.size + 18].height = 1;
			//Y14
			this.wallGrid[14 * this.size + 1].height = 1; this.wallGrid[14 * this.size + 2].height = 1; 
			for(var i = 4; i <= 6; i++) {
				this.wallGrid[14 * this.size + i].height = 1;
			}
				this.wallGrid[14 * this.size + 8].height = 1; this.wallGrid[14 * this.size + 10].height = 1; this.wallGrid[14 * this.size + 12].height = 1; this.wallGrid[14 * this.size + 14].height = 1;
				this.wallGrid[14 * this.size + 16].height = 1; this.wallGrid[14 * this.size + 18].height = 1;
			//Y15
			this.wallGrid[15 * this.size + 4].height = 1; this.wallGrid[15 * this.size + 4].height = 1; this.wallGrid[15 * this.size + 8].height = 1; this.wallGrid[15 * this.size + 12].height = 1; this.wallGrid[15 * this.size + 16].height = 1;
			//Y16
			for(var i = 2; i <= 18; i++) {
				if(i != 5 && i != 11 && i != 13) this.wallGrid[16 * this.size + i].height = 1;
			}
			//Y17
			this.wallGrid[17 * this.size + 2].height = 1; this.wallGrid[17 * this.size + 6].height = 1; this.wallGrid[17 * this.size + 10].height = 1; this.wallGrid[17 * this.size + 12].height = 1;
			this.wallGrid[17 * this.size + 14].height = 1;
			//Y18
			this.wallGrid[18 * this.size + 2].height = 1;
			for(var i = 4; i <= 14; i++) {
				if(i != 7 && i != 9) this.wallGrid[18 * this.size + i].height = 1;
			}
				this.wallGrid[18 * this.size + 16].height = 1; this.wallGrid[18 * this.size + 18].height = 1; this.wallGrid[18 * this.size + 19].height = 1;
			//Y19			
			this.wallGrid[19 * this.size + 8].height = 1; this.wallGrid[19 * this.size + 16].height = 1;
			//Y20 
						
			//Enemies:	
			this.objectGrid[1 * this.size + 13].height = 1; this.objectGrid[3 * this.size + 5].height = 1; this.objectGrid[4 * this.size + 9].height = 1; this.objectGrid[5 * this.size + 1].height = 1; 
			this.objectGrid[8 * this.size + 19].height = 1; this.objectGrid[9 * this.size + 6].height = 1; this.objectGrid[9 * this.size + 9].height = 1; this.objectGrid[9 * this.size + 17].height = 1; 
			this.objectGrid[13 * this.size + 8].height = 1; this.objectGrid[14 * this.size + 3].height = 1; this.objectGrid[14 * this.size + 15].height = 1; this.objectGrid[19 * this.size + 6].height = 1; this.objectGrid[19 * this.size + 14].height = 1;  
			
			
		} else if (level == 3) { //'Campus'
			//Formula: this.wallGrid[y * this.size + x]
			
			//Build row by row on the Y axis...
			//Y1
			this.wallGrid[1 * this.size + 8].height = 1; this.wallGrid[1 * this.size + 10].height = 1; this.wallGrid[1 * this.size + 12].height = 1; this.wallGrid[1 * this.size + 18].height = 1;
			//Y2
			for(var i = 2; i <= 6; i++) {
				this.wallGrid[2 * this.size + i].height = 1;
			}
				this.wallGrid[2 * this.size + 8].height = 1; this.wallGrid[2 * this.size + 10].height = 1; this.wallGrid[2 * this.size + 12].height = 1; this.wallGrid[2 * this.size + 14].height = 1;
				this.wallGrid[2 * this.size + 16].height = 1; this.wallGrid[2 * this.size + 18].height = 1;
			//Y3
			this.wallGrid[3 * this.size + 4].height = 1; this.wallGrid[3 * this.size + 8].height = 1; this.wallGrid[3 * this.size + 10].height = 1; this.wallGrid[3 * this.size + 14].height = 1;
			this.wallGrid[3 * this.size + 16].height = 1; this.wallGrid[3 * this.size + 18].height = 1;
			//Y4
			this.wallGrid[4 * this.size + 1].height = 1; this.wallGrid[4 * this.size + 2].height = 1;
			for(var i = 4; i <= 6; i++) {
				this.wallGrid[4 * this.size + i].height = 1;
			}
				this.wallGrid[4 * this.size + 8].height = 1;
				for(var i = 10; i <= 18; i++) {
					if(i != 15) this.wallGrid[4 * this.size + i].height = 1;
				}
			//Y5
			this.wallGrid[5 * this.size + 4].height = 1; this.wallGrid[5 * this.size + 14].height = 1; this.wallGrid[5 * this.size + 16].height = 1;
			//Y6
			for(var i = 2; i <= 12; i++) {
				this.wallGrid[6 * this.size + i].height = 1;
			}
				this.wallGrid[6 * this.size + 14].height = 1; this.wallGrid[6 * this.size + 16].height = 1; this.wallGrid[6 * this.size + 18].height = 1; this.wallGrid[6 * this.size + 19].height = 1;
			//Y7
			this.wallGrid[7 * this.size + 2].height = 1; this.wallGrid[7 * this.size + 6].height = 1; this.wallGrid[7 * this.size + 12].height = 1; this.wallGrid[7 * this.size + 16].height = 1;
			//Y8
			this.wallGrid[8 * this.size + 2].height = 1; this.wallGrid[8 * this.size + 4].height = 1; this.wallGrid[8 * this.size + 6].height = 1;
			for(var i = 8; i <= 18; i++) {
				if(i != 11 && i != 13) this.wallGrid[8 * this.size + i].height = 1;
			}
			//Y9
			this.wallGrid[9 * this.size + 2].height = 1; this.wallGrid[9 * this.size + 4].height = 1; this.wallGrid[9 * this.size + 6].height = 1; this.wallGrid[9 * this.size + 8].height = 1;
			this.wallGrid[9 * this.size + 12].height = 1; this.wallGrid[9 * this.size + 18].height = 1;
			//Y10
			this.wallGrid[10 * this.size + 2].height = 1; this.wallGrid[10 * this.size + 4].height = 1; this.wallGrid[10 * this.size + 6].height = 1; this.wallGrid[10 * this.size + 8].height = 1;
			for(var i = 10; i <= 18; i++) {
				if(i != 13) this.wallGrid[10 * this.size + i].height = 1;
			}
			//Y11
			this.wallGrid[11 * this.size + 2].height = 1; this.wallGrid[11 * this.size + 4].height = 1; this.wallGrid[11 * this.size + 6].height = 1; this.wallGrid[11 * this.size + 8].height = 1;
			this.wallGrid[11 * this.size + 10].height = 1; this.wallGrid[11 * this.size + 14].height = 1; this.wallGrid[11 * this.size + 16].height = 1;
			//Y12
			this.wallGrid[12 * this.size + 2].height = 1; this.wallGrid[12 * this.size + 4].height = 1; this.wallGrid[12 * this.size + 6].height = 1;
			for(var i = 8; i <= 19; i++) {
				if(i != 11 && i != 15 && i != 17) this.wallGrid[12 * this.size + i].height = 1;
			}
			//Y13
			this.wallGrid[13 * this.size + 4].height = 1; this.wallGrid[13 * this.size + 6].height = 1; this.wallGrid[13 * this.size + 16].height = 1; this.wallGrid[13 * this.size + 18].height = 1;
			//Y14
			this.wallGrid[14 * this.size + 1].height = 1; this.wallGrid[14 * this.size + 2].height = 1; this.wallGrid[14 * this.size + 4].height = 1; 
			for(var i = 6; i <= 16; i++) {
				if(i != 11) this.wallGrid[14 * this.size + i].height = 1;
			}
				this.wallGrid[14 * this.size + 18].height = 1;
			//Y15
			this.wallGrid[15 * this.size + 4].height = 1; this.wallGrid[15 * this.size + 10].height = 1; this.wallGrid[15 * this.size + 12].height = 1; this.wallGrid[15 * this.size + 16].height = 1;
			//Y16
			this.wallGrid[16 * this.size + 2].height = 1;
			for(var i = 4; i <= 8; i++) {
				this.wallGrid[16 * this.size + i].height = 1;
			}
				this.wallGrid[16 * this.size + 10].height = 1; this.wallGrid[16 * this.size + 12].height = 1; this.wallGrid[16 * this.size + 14].height = 1;
				for(var i = 16; i <= 18; i++) {
					this.wallGrid[16 * this.size + i].height = 1;
				}
			//Y17
			this.wallGrid[17 * this.size + 2].height = 1; this.wallGrid[17 * this.size + 6].height = 1; this.wallGrid[17 * this.size + 10].height = 1; this.wallGrid[17 * this.size + 12].height = 1;
			this.wallGrid[17 * this.size + 14].height = 1; this.wallGrid[17 * this.size + 18].height = 1;
			//Y18
			for(var i = 2; i <= 16; i++) {
				if(i != 5 && i != 7 && i != 13) this.wallGrid[18 * this.size + i].height = 1;
			}
				this.wallGrid[18 * this.size + 18].height = 1;
			//Y19			
			this.wallGrid[19 * this.size + 2].height = 1; this.wallGrid[19 * this.size + 6].height = 1; this.wallGrid[19 * this.size + 16].height = 1;
			//Y20 
			this.wallGrid[20 * this.size + 1].height = 0;		 //Victory Cell	
			this.objectGrid[20 * this.size + 1] = new Object(new Animation(new ImageFile('assets/trophy.png', 1000, 800), 1, 1000), 0, 0, false, 0);
			this.objectGrid[20 * this.size + 1].height = .6;
			//Enemies:	
			this.objectGrid[1 * this.size + 4].height = 1; this.objectGrid[2 * this.size + 19].height = 1; this.objectGrid[4 * this.size + 15].height = 1; this.objectGrid[5 * this.size + 11].height = 1;
			this.objectGrid[7 * this.size + 9].height = 1; this.objectGrid[8 * this.size + 1].height = 1; this.objectGrid[12 * this.size + 17].height = 1; this.objectGrid[13 * this.size + 9].height = 1;
			this.objectGrid[14 * this.size + 5].height = 1; this.objectGrid[18 * this.size + 5].height = 1; this.objectGrid[19 * this.size + 12].height = 1;
					
		} else if (level == 4) { //'Hell'
			//Formula: this.wallGrid[y * this.size + x]
			
			//Build row by row on the Y axis...
			//Y1
			this.wallGrid[1 * this.size + 2].height = 1; this.wallGrid[1 * this.size + 6].height = 1; this.wallGrid[1 * this.size + 8].height = 1; this.wallGrid[1 * this.size + 16].height = 1;
			//Y2
			this.wallGrid[2 * this.size + 2].height = 1; this.wallGrid[2 * this.size + 4].height = 1; this.wallGrid[2 * this.size + 6].height = 1; this.wallGrid[2 * this.size + 8].height = 1; this.wallGrid[2 * this.size + 10].height = 1;
			for(var i = 12; i <= 18; i++) {
				if(i != 15) this.wallGrid[2 * this.size + i].height = 1;
			}
			//Y3
			this.wallGrid[3 * this.size + 4].height = 1; this.wallGrid[3 * this.size + 6].height = 1; this.wallGrid[3 * this.size + 10].height = 1; this.wallGrid[3 * this.size + 12].height = 1; this.wallGrid[3 * this.size + 14].height = 1;
			//Y4
			for(var i = 1; i <= 18; i++) {
				if(i != 5 && i != 11 & i != 13) this.wallGrid[4 * this.size + i].height = 1;
			}
			//Y5
			this.wallGrid[5 * this.size + 4].height = 1; this.wallGrid[5 * this.size + 12].height = 1; this.wallGrid[5 * this.size + 18].height = 1;
			//Y6
			this.wallGrid[6 * this.size + 2].height = 1;
			for(var i = 4; i <= 18; i++) {
				if(i != 13 && i != 15) this.wallGrid[6 * this.size + i].height = 1;
			}
			//Y7
			this.wallGrid[7 * this.size + 2].height = 1; this.wallGrid[7 * this.size + 4].height = 1; this.wallGrid[7 * this.size + 14].height = 1; this.wallGrid[7 * this.size + 16].height = 1;
			//Y8
			this.wallGrid[8 * this.size + 2].height = 1; this.wallGrid[8 * this.size + 4].height = 1;
			for(var i = 6; i <= 10; i++) {
				this.wallGrid[8 * this.size + i].height = 1;
			}
				this.wallGrid[8 * this.size + 12].height = 1; this.wallGrid[8 * this.size + 14].height = 1; this.wallGrid[8 * this.size + 16].height = 1; this.wallGrid[8 * this.size + 18].height = 1; this.wallGrid[8 * this.size + 19].height = 1;
			//Y9
			this.wallGrid[9 * this.size + 2].height = 1; this.wallGrid[9 * this.size + 6].height = 1; this.wallGrid[9 * this.size + 10].height = 1; this.wallGrid[9 * this.size + 12].height = 1;
			this.wallGrid[9 * this.size + 14].height = 1; this.wallGrid[9 * this.size + 18].height = 1;
			//Y10
			for(var i = 2; i <= 18; i++) {
				if(i != 9 && i != 11 & i != 13) this.wallGrid[10 * this.size + i].height = 1;
			}
			//Y11
			this.wallGrid[11 * this.size + 2].height = 1; this.wallGrid[11 * this.size + 10].height = 1; this.wallGrid[11 * this.size + 12].height = 1; this.wallGrid[11 * this.size + 16].height = 1;
			//Y12
			for(var i = 2; i <= 18; i++) {
				if(i != 7 && i != 9 && i != 11 && i != 15) this.wallGrid[12 * this.size + i].height = 1;
			}
			//Y13
			this.wallGrid[13 * this.size + 6].height = 1; this.wallGrid[13 * this.size + 8].height = 1; this.wallGrid[13 * this.size + 10].height = 1; this.wallGrid[13 * this.size + 14].height = 1; this.wallGrid[13 * this.size + 18].height = 1;
			//Y14
			for(var i = 1; i <= 18; i++) {
				if(i != 5 && i != 7 && i != 11 && i != 17) this.wallGrid[14 * this.size + i].height = 1;
			}
			//Y15
			this.wallGrid[15 * this.size + 4].height = 1; this.wallGrid[15 * this.size + 6].height = 1; this.wallGrid[15 * this.size + 12].height = 1; this.wallGrid[15 * this.size + 18].height = 1;
			//Y16
			this.wallGrid[16 * this.size + 2].height = 1; this.wallGrid[16 * this.size + 4].height = 1;
			for(var i = 6; i <= 18; i++) {
				if(i != 11 && i != 13) this.wallGrid[16 * this.size + i].height = 1;
			}
			//Y17
			this.wallGrid[17 * this.size + 2].height = 1; this.wallGrid[17 * this.size + 6].height = 1; this.wallGrid[17 * this.size + 10].height = 1; this.wallGrid[17 * this.size + 12].height = 1; this.wallGrid[17 * this.size + 18].height = 1;
			//Y18
			for(var i = 2; i <= 18; i++) {
				if(i != 7 && i != 9 && i != 17) this.wallGrid[18 * this.size + i].height = 1;
			}
			//Y19			
			this.wallGrid[19 * this.size + 8].height = 1; this.wallGrid[19 * this.size + 20].height = 0; //Victory Cell
			this.objectGrid[19 * this.size + 8] = new Object(new Animation(new ImageFile('assets/trophy.png', 1000, 800), 1, 1000), 0, 0, false, 0);
			this.objectGrid[19 * this.size + 8].height = .6;
			//Y20 
						
			//Enemies:	
			this.objectGrid[2 * this.size + 1].height = 1; this.objectGrid[2 * this.size + 7].height = 1; this.objectGrid[5 * this.size + 8].height = 1; this.objectGrid[5 * this.size + 19].height = 1;
			this.objectGrid[7 * this.size + 8].height = 1; this.objectGrid[8 * this.size + 1].height = 1; this.objectGrid[9 * this.size + 13].height = 1; this.objectGrid[13 * this.size + 19].height = 1;	
			this.objectGrid[15 * this.size + 5].height = 1; this.objectGrid[15 * this.size + 15].height = 1; this.objectGrid[19 * this.size + 4].height = 1; this.objectGrid[19 * this.size + 11].height = 1;
			
		} else {
			this.buildIntroLevel();				
		}
	};
	  
	Map.prototype.setWeather = function(weather) {
		this.weather = weather;
	};

	Map.prototype.updateProjectiles = function(point) {
		for(var i = 0; i < this.projectileGrid.length; i++) {
			this.projectileGrid[i].update(point, this);
		}
	}
	
	Map.prototype.updateObjects = function(player) {
		for(var i = 0; i < this.objectGrid.length; i++) {
			if(this.objectGrid[i].height >= 0) { //Must update EVEN 0 height frames because of weird rendering 
				//console.log("Updating object frame, currently is: " + this.objectGrid[i].animation.currentFrame);
				this.objectGrid[i].animation.getFrameOffset(true);
				//console.log("Now is: " + this.objectGrid[i].animation.currentFrame);
				//console.log("It's offset would be: " + this.objectGrid[i].animation.getFrameOffset());
				//console.log("Number of frames is: " + this.objectGrid[i].animation.frames);
			}
		}
	}
	  
	Map.prototype.getDistance = function(p1, p2) {
		return Math.sqrt(((p1.x - p2.x) * (p1.x - p2.x)) + ((p1.y - p2.y) *(p1.y - p2.y)));
	};
	  
	  Map.prototype.getSlopeAndIntercept = function(x1, y1, x2, y2) {
			this.slope = (y1 - y2)/(x1 - x2);
			this.intercept = y1 - (slope * x1);
		  return ({m: slope, b: intercept});		  
	  };
	  
	  Map.prototype.getIntersection = function(l1, l2) {		  
		  this.x = (l2.b - l1.b)/(l1.m - l2.m);
		  this.y = l1.m * this.x + l1.b;
		  
		  console.log(this.x + ", " + this.y);
		  return ({x: this.x, y: this.y});
	  };	  

	  
      Map.prototype.getWall = function(x, y) {
        x = Math.floor(x);
        y = Math.floor(y);
        if (x < 0 || x > this.size - 1 || y < 0 || y > this.size - 1) return -1;
        return this.wallGrid[y * this.size + x];
      };
	  
	  Map.prototype.getObject = function(x, y) {
        x = Math.floor(x);
        y = Math.floor(y);
        if (x < 0 || x > this.size - 1 || y < 0 || y > this.size - 1) return -1;
        return this.objectGrid[y * this.size + x];
      };
	  
	  Map.prototype.activate = function(x, y, value) {
		  x = Math.floor(x);
		  y = Math.floor(y);
		  if(x < this.size && y < this.size && this.objectGrid[y * this.size + x].active != value && this.objectGrid[y * this.size + x].height == 1) {
			console.log("enemy activated " + x + ", " + y);
			this.objectGrid[y * this.size + x].active = value;
		  }
	  };
	  
	  Map.prototype.setObject = function(x, y, object) {
		  x = Math.floor(x);
		  y = Math.floor(y);
		  this.objectGrid[y * this.size + x] = object;
	  };
	  
	  Map.prototype.buildIntroLevel = function() {
		  var totalSize = this.size * this.size;
		  for(var i = 0; i < totalSize; i++) {
			  //Fill top and bottoms
			  if(i >= 0 && i < this.size) {
				  this.wallGrid[i].height = 1;
			  }
			  if(i >= totalSize-this.size && i < totalSize) {
				  this.wallGrid[i].height = 1;  				  
			  }
			  //Fill edges.
			  if(i % this.size == 0) {
				  this.wallGrid[i].height = 1;
			  }
			  if(i % this.size == this.size-1) {
				  this.wallGrid[i].height = 1;
			  }
			  
			  
			  if(i >= 33 && i < 44) {
				  this.wallGrid[i].height = 1;
			  }
			  if(i >= 66 && i < 75) {
				  this.wallGrid[i].height = 1;
			  }
			  if(i >= 98 && i < 111) {
				  this.wallGrid[i].height = 1;
			  }
			  if(i == 114) {
				  this.wallGrid[i].height = 1;
			  }
			  
			  if(i == 130 || (i >= 132 && i <= 139)) {
				  this.wallGrid[i].height = 1;
			  }
			  if(i == 146 || (i >= 148 && i <= 152) || i == 155) {
				  this.wallGrid[i].height = 1;
			  }
			  
			  if(i == 162 || (i >= 164 && i <= 168) || i == 171) {
				  this.wallGrid[i].height = 1;
			  }
			  if(i == 178 || (i >= 180 && i <= 184) || i == 187) {
				  this.wallGrid[i].height = 1;
			  }
			  if(i == 194 || (i >= 196 && i <= 200) || i == 203) {
				  this.wallGrid[i].height = 1;
			  }
			  if(i == 210 || (i >= 212 && i <= 216) || i == 219) {
				  this.wallGrid[i].height = 1;
			  }
			  if(i == 235) {
				  this.wallGrid[i].height = 1;
			  }
		  }
			//this.objectGrid[1 * this.size + 3].height = .9;
			//this.objectGrid[1 * this.size + 3].width = .4;
			//this.objectGrid[1 * this.size + 3].animation = new Animation(new ImageFile('assets/dementor.png', 512, 256), 1, 512); //Animation(image(width, height), frames, offset)
			//console.log("Sprite Output:");
			//console.log(this.objectGrid[1 * this.size + 3]);
		 
		/*
		################		0-15
		#			   #		16-31
		############   #		32-47
		#			   #		48-63
		#	#######	   #		64-79
		#			   #		80-95
		#	############		96-111
		#	#		   #		112-127
		#	#	####   #		128-143
		#	#	#  #   #		144-159
		#	#	#  #   #		160-175
		#	#	#  #   #		176-191
		#	#	#  #   #		192-207
		#	#	#  #   #		208-223
		#		   #   #		224-239
		################		240-255
		
		*/
	  };


      Map.prototype.cast = function(point, angle, range) {
		//console.log("Inside Cast:");
        var self = this;
        var sin = Math.sin(angle);
        var cos = Math.cos(angle);
        var noWall = { length2: Infinity };

        return ray({ x: point.x, y: point.y, wallHeight: 0, objectHeight: 0, distance: 0 });

        function ray(origin) {
			//console.log("Inside Ray:");
          var stepX = step(sin, cos, origin.x, origin.y);
          var stepY = step(cos, sin, origin.y, origin.x, true);
		  //console.log("Step X: " + stepX + ", Step Y: " + stepY);
          var nextStep = stepX.length2 < stepY.length2
            ? inspect(stepX, 1, 0, origin.distance, stepX.y)
            : inspect(stepY, 0, 1, origin.distance, stepY.x);
		//console.log("Next Step: " + nextStep);
          if (nextStep.distance > range) return [origin];
          return [origin].concat(ray(nextStep));
        }

        function step(rise, run, x, y, inverted) {
			//console.log("Inside step: ");
          if (run === 0) return noWall;
          var dx = run > 0 ? Math.floor(x + 1) - x : Math.ceil(x - 1) - x;
          var dy = dx * (rise / run);
		  //console.log("Dx: " + dx + ", Dy: " + dy + ", Rise: " + rise + ", Run: " + run + ", X: " + x + ", Y: " + y);
          return {
            x: inverted ? y + dy : x + dx,
            y: inverted ? x + dx : y + dy,
            length2: dx * dx + dy * dy
          };
        }

        function inspect(step, shiftX, shiftY, distance, offset) {
          var dx = cos < 0 ? shiftX : 0;
          var dy = sin < 0 ? shiftY : 0;
          step.wallHeight = self.getWall(step.x - dx, step.y - dy).height;
		  step.objectHeight = self.getObject(step.x - dx, step.y - dy).height;
          step.distance = distance + Math.sqrt(step.length2);
          if (shiftX) step.shading = cos < 0 ? 2 : 0;
          else step.shading = sin < 0 ? 2 : 1;
          step.offset = offset - Math.floor(offset);
          return step;
        }
      };

      Map.prototype.update = function(seconds) {
        if (this.light > 0) this.light = Math.max(this.light - 10 * seconds, 0);
        else if (Math.random() * 5 < seconds) this.light = 2;
      };