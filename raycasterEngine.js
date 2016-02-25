	var CIRCLE = Math.PI * 2;
	
	function Animation(texture, frames, offset) {
		this.texture = texture;
		this.frames = frames;
		this.offset = offset;
		this.currentFrame = 0;
	}
	
	Animation.prototype.getFrameOffset = function(advance) { //Just get the offset. Or get the offset and advance.
		if(this.frames <= 1) return 0;
		var offset = this.currentFrame * this.offset;
		if(advance) this.currentFrame = this.currentFrame + 1 % this.frames;
		return offset;
	}	


	
	function Object(animation, height, width, isDestructable, damageDealt) {
		this.height = height;
		this.width = width;
		this.animation = animation;
		this.isDestructable = isDestructable;
		this.health = 100;
		this.damageDealt = damageDealt; //DPS, or Damage per update.
};


      function Controls() {
        this.codes  = { 37: 'left', 39: 'right', 38: 'forward', 40: 'backward', 65: 'left', 87: 'forward', 68: 'right', 83: 'backward', 81: 'strafeLeft', 69: 'strafeRight', 'x': -1, 'y': -1};
        this.states = { 'left': false, 'right': false, 'forward': false, 'backward': false, 'strafeLeft': false, 'strafeRight': false, 'fire': false};
        document.addEventListener('keydown', this.onKey.bind(this, true), false);
        document.addEventListener('keyup', this.onKey.bind(this, false), false);
        document.addEventListener('touchstart', this.onTouch.bind(this), false);
        document.addEventListener('touchmove', this.onTouch.bind(this), false);
        document.addEventListener('touchend', this.onTouchEnd.bind(this), false);
		document.addEventListener('click', this.onClick.bind(this), false);
		document.addEventListener('mousemove', this.onMouse.bind(this), false);
		document.getElementById('gamescreen').style.cursor = "none";
      }

	  Controls.prototype.onClick = function(e) {
			this.states['fire'] = true;
			this.codes['x'] = e.clientX;	
			//console.log("Inside Controls, onClick, client x: " + e.clientX + ", screen width: " + (window.innerWidth));
			
      };
	  
	  Controls.prototype.onMouse = function(e) {
		if(e.clientX < (window.innerWidth / 10)) {
			this.states['left'] = true;
		} else if (e.clientX > (window.innerWidth / 10)*9) {
			this.states['right'] = true;
		} else {
			this.states['left'] = false;
			this.states['right'] = false;
		}
		this.codes['x'] = e.clientX;
		this.codes['y'] = e.clientY;		
	  }
	  
      Controls.prototype.onTouch = function(e) {
        var t = e.touches[0];
        this.onTouchEnd(e);
        if (t.pageY < window.innerHeight * 0.5) this.onKey(true, { keyCode: 38 });
        else if (t.pageX < window.innerWidth * 0.5) this.onKey(true, { keyCode: 37 });
        else if (t.pageY > window.innerWidth * 0.5) this.onKey(true, { keyCode: 39 });
      };

      Controls.prototype.onTouchEnd = function(e) {
        this.states = { 'left': false, 'right': false, 'forward': false, 'backward': false, 'strafeLeft': false, 'strafeRight': false };
        e.preventDefault();
        e.stopPropagation();
      };

      Controls.prototype.onKey = function(val, e) {
        var state = this.codes[e.keyCode];
        if (typeof state === 'undefined') return;
        this.states[state] = val;
        e.preventDefault && e.preventDefault();
        e.stopPropagation && e.stopPropagation();
      };


      function ImageFile(src, width, height) {
        this.image = new Image();
        this.image.src = src;
        this.width = width;
        this.height = height;
      }
      
      function Player(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction;	
        this.paces = 0;
		
		this.defaultHealth = 100;
		this.defaultAmmo = 51;
		this.kills = 0;
		this.health = 100;
		this.ammo = 51;
		this.beingDamaged = 0;
		
		this.healthIcon = new Animation(new ImageFile('assets/harryicon.png', 1076, 229), 4, 269);
		
		this.weapon = new ImageFile('assets/wandhand1.png', 170, 311);
		this.fireWeaponIMG = new ImageFile('assets/wandhand.png', 170, 311);
		this.idleWeaponIMG = new ImageFile('assets/wandhand1.png', 170, 311);
		this.weaponTicks = 0;
      }
	  
	  Player.prototype.updateHealth = function(number) {
		  //console.log("Current Health: " + this.health);
		  this.health += number;
		  if (this.health < 0) {
			  this.health = 0;
		  }
		  if(this.health <= 75 && this.health > 50 && this.healthIcon.currentFrame != 1) {
			  this.healthIcon.getFrameOffset(true);
		  } else if (this.health <= 50 && this.health > 25 && this.healthIcon.currentFrame != 2) {
			  this.healthIcon.getFrameOffset(true);		  
		  } else if (this.health <= 25 && this.health > 0 && this.healthIcon.currentFrame != 3) {
			  this.healthIcon.getFrameOffset(true);			  
		  }
		  //check if dead here.
	  };

      Player.prototype.rotate = function(angle) {
        this.direction = (this.direction + angle + CIRCLE) % (CIRCLE);
      };

      Player.prototype.walk = function(distance, map) {
        var dx = Math.cos(this.direction) * distance;
        var dy = Math.sin(this.direction) * distance;
        if (map.getWall(this.x + dx, this.y).height <= 0) this.x += dx;
        if (map.getWall(this.x, this.y + dy).height <= 0) this.y += dy;
        this.paces += distance;
		if (Math.floor(this.x) == map.victoryCell.x && Math.floor(this.y) == map.victoryCell.y) map.mapWon = true;
      };
	  
	  Player.prototype.strafe = function(distance, map) {
		var dx = Math.cos(this.direction + Math.PI / 2) * distance;
        var dy = Math.sin(this.direction + Math.PI / 2) * distance;
        if (map.getWall(this.x + dx, this.y).height <= 0) this.x += dx;
        if (map.getWall(this.x, this.y + dy).height <= 0) this.y += dy;
        this.paces += distance;
	  }
	  
	  Player.prototype.fireWeapon = function(mouseX, map, controls) {
		  //If we do different spells, each spell, we check which spell is selected.
		  //Then there would be an array corresponding to each type of spell selected.
		  //then do the ammo, push the projectile type based on that.
		  if(this.ammo > 0) {
			 this.ammo--; 
			 map.projectileGrid.push(new Projectile(this.x, this.y, mouseX, new Animation(new ImageFile('assets/explosionStrip.png', 4800, 445), 8, 600), map));	 
		  }	  
		  this.weapon = this.fireWeaponIMG;
		  controls['fire'] = false;
	  }

      Player.prototype.update = function(controls, map, seconds, controlCodes) {
		if(this.beingDamaged == 1) {
			map.setWeather("TOXIC");	
			this.beingDamaged = 0;
		} else {
			map.setWeather(map.defaultWeather);
		}
        if (controls.left) this.rotate(-Math.PI * .3 * seconds);
        if (controls.right) this.rotate(Math.PI * .3 * seconds);
        if (controls.forward) this.walk(2.5 * seconds, map);
        if (controls.backward) this.walk(-1.5 * seconds, map);
		if (controls.strafeLeft) this.strafe(-1.5 * seconds, map);
		if (controls.strafeRight) this.strafe(1.5 * seconds, map);				
		if (controls.fire) {
			this.fireWeapon(controlCodes['x'], map, controls);
			this.weapon = this.fireWeaponIMG;
			this.weaponTicks = 4;
		} else {
			if(this.weaponTicks > 0) {
				 this.weaponTicks--;
			} else {
				this.weapon = this.idleWeaponIMG;
			}
		}
      }; 


      function Camera(canvas, resolution, focalLength) {
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = window.innerWidth * 0.5;
        this.height = canvas.height = window.innerHeight * 0.5;
        this.resolution = resolution;
        this.spacing = this.width / resolution;
        this.focalLength = focalLength || 0.8;
        this.range = 14;
        this.lightRange = 5;
        this.scale = (this.width + this.height) / 1200; 
		this.doOnce = 0;
      }

      Camera.prototype.render = function(player, map, controls) {
        this.drawSky(player.direction, map.skybox, map.light);
        this.drawColumns(player, map);
		this.drawProjectiles(player, map);
        this.drawWeapon(player.weapon, player.paces, player);
		this.drawCrosshair(controls);
		this.drawHud(player);
      };
	  
	  Camera.prototype.drawProjectiles = function(player, map) {	    
			for(var i = 0; i < map.projectileGrid.length; i++) {
				if(map.projectileGrid[i].angle === -1) map.projectileGrid[i].setAngle(Math.atan2((map.projectileGrid[i].pageX/window.innerWidth) - .50, this.focalLength), player); //console.log(((map.projectileGrid[i].pageX/window.innerWidth) - .50)); console.log("Angle set: " + map.projectileGrid[i].angle); //console.log(Math.atan2(map.projectileGrid[i].angle = (map.projectileGrid[i].pageX/window.innerWidth) * this.resolution, this.focalLength));
				this.ctx.drawImage(map.projectileGrid[i].animation.texture.image, map.projectileGrid[i].getFrameOffset(), 0, map.projectileGrid[i].animation.offset, map.projectileGrid[i].animation.texture.height, map.projectileGrid[i].pageX/2 - ((map.projectileGrid[i].animation.offset * map.projectileGrid[i].scaleFactor)/2), (this.height/2) - ((map.projectileGrid[i].animation.texture.height * map.projectileGrid[i].scaleFactor)/2), map.projectileGrid[i].animation.offset * map.projectileGrid[i].scaleFactor, map.projectileGrid[i].animation.texture.height * map.projectileGrid[i].scaleFactor);
				//ctx.drawImage(image, sourceX, sourceY, sorceWidth, sourceHeight, destX, destY, destWidth, destHeight);
			}

	  }

      Camera.prototype.drawSky = function(direction, sky, ambient) {
		 
        var width = sky.width * (this.height / sky.height) * 2;
        var left = (direction / CIRCLE) * -width;

        this.ctx.save();
        this.ctx.drawImage(sky.image, left, 0, width, this.height);
        if (left < width - this.width) {
          this.ctx.drawImage(sky.image, left + width, 0, width, this.height);
        }
        if (ambient > 0) {
          this.ctx.fillStyle = '#ffffff';
          this.ctx.globalAlpha = ambient * 0.1;
          this.ctx.fillRect(0, this.height * 0.5, this.width, this.height * 0.5);
        }
        this.ctx.restore();
      };

      Camera.prototype.drawColumns = function(player, map) {
        this.ctx.save();
		
        for (var column = 0; column < this.resolution; column++) {
          var x = column / this.resolution - 0.5;
          var angle = Math.atan2(x, this.focalLength);
		  //if(column == this.resolution / 4) console.log("ANGLE, 1/4: " + x);
		  //if(column == this.resolution / 2) console.log("ANGLE 1/2: " + angle);
		  //if(column == (this.resolution / 4)*3) console.log("ANGLE 3/4: " + angle);
		  //if(column == 0) console.log("ANGLE 0: " + x);
		  //if(column == this.resolution-1) console.log("ANGLE 100: " + x);
          var ray = map.cast(player, player.direction + angle, this.range);
          this.drawColumn(column, ray, angle, map);
        }		

		
        this.ctx.restore();
      };

      Camera.prototype.drawWeapon = function(weapon, paces, player) {
        var bobX = Math.cos(paces * 2) * this.scale * 6;
        var bobY = Math.sin(paces * 4) * this.scale * 6;
        var left = this.width * .7 + bobX;
        var top = this.height * .5 + bobY;
        this.ctx.drawImage(weapon.image, left, top, weapon.width * this.scale, weapon.height * this.scale);
		//if(weapon.tag == 1) player.weapon = player.idleWeaponIMG; console.log("Was the firing animation, changing.");
      };

	Camera.prototype.drawColumn = function(column, ray, angle, map) {
        var ctx = this.ctx;
        var left = Math.floor(column * this.spacing);
        var width = Math.ceil(this.spacing);
        var hitWall = -1;
		var hitObjectIndex = -1;
		var hitObject = []

        while (++hitWall < ray.length && ray[hitWall].wallHeight <= 0);	//This loop runs until it finds the first section of ray with a height not 0.
		while (++hitObjectIndex < ray.length) {
			if(ray[hitObjectIndex].objectHeight > 0) {
				hitObject.push(hitObjectIndex);
			}
		}

		
        for (var s = ray.length - 1; s >= 0; s--) {		//Iterates backward from all Ray sections. This is not in the while loop.
          var step = ray[s];
		  if(map.weather == 'RAIN') var weatherDebris = Math.pow(Math.random(), 3) * s;
		  else if(map.weather == 'SNOW') var weatherDebris = 2;
		  else if(map.weather == 'TOXIC') var weatherDebris = 3;
          var weather = (weatherDebris > 0) && this.project(0.1, angle, step.distance);	  
		  
		  
          if (s === hitWall) {				//When it finds the one closest to the player, it generates the wall.
			var wallValue = map.getWall(Math.floor(ray[s].x), Math.floor(ray[s].y));
			if(wallValue != -1) {
				var texture = wallValue.texture;
				var textureX = wallValue.texture.width * step.offset;
				var wall = this.project(step.wallHeight, angle, step.distance);
				
				ctx.globalAlpha = 1;
				ctx.drawImage(texture.image, textureX, 0, 1, texture.height, left, wall.top, width, wall.height);
				
				ctx.fillStyle = '#000000';
				ctx.globalAlpha = Math.max((step.distance + step.shading) / this.lightRange - map.light, 0);
				ctx.fillRect(left, wall.top, width, wall.height);	
			}
          }
		  
		  for(var i = hitObject.length-1; i >= 0; i--) {
				if (s === hitObject[i] && hitObject[i] < hitWall) {								//When it finds the one closest to the player, it generates the wall.
				
				
				var entity = map.getObject(Math.floor(ray[s].x), Math.floor(ray[s].y)).animation;
				
				//SAM INSERT ACTIVATE CODE HERE:
				//map.getObject(Math.floor(ray[s].x), Math.floor(ray[s].y)).isActive = true or something...

				if(entity != null) {
					
					var offset = map.getObject(Math.floor(ray[s].x), Math.floor(ray[s].y)).width/2;
					var textureX = entity.texture.width * (step.offset - offset) + entity.getFrameOffset();
			
					var object = this.project(step.objectHeight, angle, step.distance);				
		
					ctx.globalAlpha = 1;
					
					//ctx.drawImage(image, sourceX, sourceY, sorceWidth, sourceHeight, destX, destY, destWidth, destHeight);		
					ctx.drawImage(entity.texture.image, textureX, 0, 1, entity.texture.image.height, left, object.top, width, object.height);			
					ctx.fillStyle = '#000000';
					//ctx.globalAlpha = Math.max((step.distance + step.shading) / this.lightRange - map.light, 0);
					ctx.globalAlpha = 0;
					ctx.fillRect(left, object.top, width, object.height);				
				}

			  }
		  }	//end object for loop  
		  
			  ctx.fillStyle = '#ffffff';
			  ctx.globalAlpha = 0.15;
			  if(map.weather == 'RAIN') {
				  while (--weatherDebris > 0) ctx.fillRect(left, Math.random() * weather.top, 1, weather.height);
			  } else if (map.weather == 'SNOW') {
				  while (--weatherDebris > 0) ctx.fillRect(left, Math.random() * weather.top, 3, 3); 
			  } else if (map.weather == 'TOXIC') {
				  //Toxic Green: ctx.fillStyle = '#4DFE15';
				  ctx.fillStyle = '#7baece';
				  while (--weatherDebris > 0) ctx.fillRect(left, Math.random() * weather.top, 10, 10); 
			  }			  

        } //end main for loop
      };
	  
	  Camera.prototype.drawCrosshair = function(controls) {
		  //this.ctx.arc(rayEngine.controls.codes['x'], rayEngine.controls.codes['y'],50,0,Math.PI*2,true);

		this.ctx.beginPath();
		this.ctx.strokeStyle = "white";
			this.ctx.arc(controls.codes['x']/2, controls.codes['y']/2,20,0,Math.PI*2,true);
		this.ctx.stroke();		  
	  };
	  
	  Camera.prototype.drawHud = function(player) {
		  var spaceBuffer = 4; //Used for the health bar.
		  var left = 15/2;
		  var farLeft = left + player.healthIcon.offset/2 + 20;
		  var top = (window.innerHeight - 20 - player.healthIcon.texture.image.height)/2;
		  var farTop = (window.innerHeight - 20)/2 - (15);
		  //console.log("Left: " + left);
		  //console.log("Top: " + top);
		  //ctx.drawImage(image, sourceX, sourceY, sorceWidth, sourceHeight, destX, destY, destWidth, destHeight);
		  
		  this.ctx.fillStyle = "#FFFFFF";
		  this.ctx.fillRect(left, top, player.healthIcon.offset/2 + spaceBuffer, player.healthIcon.texture.image.height/2 + spaceBuffer);
		  
		  this.ctx.drawImage(player.healthIcon.texture.image, player.healthIcon.getFrameOffset(), 0, player.healthIcon.offset, player.healthIcon.texture.image.height, left + (spaceBuffer/2), top + (spaceBuffer/2), player.healthIcon.offset/2, player.healthIcon.texture.image.height/2);
		
		  this.ctx.fillStyle = "#FFFFFF";
		  this.ctx.fillRect(farLeft, farTop, 100 + spaceBuffer, 15 + spaceBuffer);
		  this.ctx.fillStyle = "#B40404";
		  this.ctx.fillRect(farLeft + (spaceBuffer/2), farTop + (spaceBuffer/2), player.health/100 * 100, 15);
		  
		  this.ctx.fillStyle = "#FFFFFF";
		  this.ctx.font = "20px Monotype Corsiva";
		  this.ctx.fillText("Health: " + Math.round(player.health) + "%", farLeft, farTop - 10);
		  
		  this.ctx.fillStyle = "#FFFFFF";
		  this.ctx.font = "20px Monotype Corsiva";
		  this.ctx.fillText("Spells: " + player.ammo, farLeft, farTop - (30 + spaceBuffer));
		  
		  this.ctx.fillStyle = "#FFFFFF";
		  this.ctx.font = "20px Monotype Corsiva";
		  this.ctx.fillText("Kills: " + player.kills, farLeft, farTop - (50 + spaceBuffer));		  
		  
		  /* if we implement multiple spells.
		  this.ctx.fillStyle = "#FFFFFF";
		  this.ctx.font = "20px Monotype Corsiva";
		  this.ctx.fillText("Current Spell: " + player.controls.spells, farLeft, farTop - (50 + spaceBuffer));
		  */
	  };

      Camera.prototype.project = function(height, angle, distance) {
        var z = distance * Math.cos(angle);
        var wallHeight = this.height * height / z;
        var bottom = this.height / 2 * (1 + 1 / z);
        return {
          top: bottom - wallHeight,
          height: wallHeight
        }; 
      };


      function GameLoop() {
        this.frame = this.frame.bind(this);
        this.lastTime = 0;
        this.callback = function() {};
      }

      GameLoop.prototype.start = function(callback) {
        this.callback = callback;
        requestAnimationFrame(this.frame);
      };

      GameLoop.prototype.frame = function(time) {
        var seconds = (time - this.lastTime) / 1000;
        this.lastTime = time;
        if (seconds < 0.2) this.callback(seconds);
        requestAnimationFrame(this.frame);
      };

	  
	  function RayCasterEngine() {
		   	  
	  }
	  
	  RayCasterEngine.prototype.run = function() {
		var currentLevel = 1;  
		var display = document.getElementById('gameWorld');
		var map = new Map(currentLevel);
		var player = new Player(map.playerSpawn.x, map.playerSpawn.y, 0);
		var controls = new Controls();
		var camera = new Camera(display, 320, 0.8);
		var loop = new GameLoop();
		var that = this;
		var enemyGrid = [];
		enemyGrid = this.populateEnemies(enemyGrid, map);
		//console.log(enemyGrid);
		loop.start(function frame(seconds) {
			map.update(seconds);
			map.updateProjectiles(player);
			player.update(controls.states, map, seconds, controls.codes);
			that.enemyGrid = that.updateEnemies(player, seconds, enemyGrid, map);
			camera.render(player, map, controls);
			if(map.mapWon && currentLevel < 4) {
				currentLevel++;
				map = new Map(currentLevel);
				player = new Player(map.playerSpawn.x, map.playerSpawn.y, 0);
				this.populateEnemies(that.enemyGrid, map);
			} else if (currentLevel == 4 && map.mapWon) {
				//Win Game
			}
		}); 
	  }
	  
	  
	function Enemy(initialX, initialY, map) {
		this.x = initialX;
		this.y = initialY;
		//tracks the enemies state.  
		this.state = 1;
		this.speed = 0;		
		this.moveSpeed = .7;
		this.mapObject = map.getObject(initialX, initialY);
		this.mapObject.height = .9;
		
	}
	
	RayCasterEngine.prototype.updateEnemies = function (player, seconds, enemyGrid, map) {

		for(var i = 0; i < enemyGrid.length; i++) {
			var enemy = enemyGrid[i];
			var dx = player.x - enemy.x;
			var dy = player.y - enemy.y;
			var dist = Math.sqrt(dx*dx + dy*dy);
			
			//console.log("updating enemy: " + i + " distance: " + dist);
			if (dist <= 2) {
				player.beingDamaged = 1;
				//console.log("enemy in range" + i);
				player.updateHealth(map.getObject(Math.floor(enemy.x), Math.floor(enemy.y)).damageDealt * -1);
			}
			if(dist > 2 && dist < 7) {
				RayCasterEngine.prototype.moveEnemy(enemy, seconds, player, dy, dx, map);
			}
			if(map.getObject(enemy.x, enemy.y).health <= 0) {
				enemyGrid.splice(i , 1);
				//console.log("enemy dead: " + i + " " + enemy.x + " " + enemy.y);
				//console.log(enemyGrid);
			}
		}
		return enemyGrid;
	};
	
	RayCasterEngine.prototype.moveEnemy = function(enemy, seconds, player, dy, dx, map) {
		var oldX = enemy.x;
		var oldY = enemy.y;
		var moveDist = enemy.moveSpeed * seconds;
		var direction = Math.atan2(dy, dx);
		var newX = enemy.x + Math.cos(direction) * moveDist;
		var newY = enemy.y + Math.sin(direction) * moveDist;
		if (map.getWall(newX, newY).height <= 0) enemy.x = newX;
        if (map.getWall(newX, newY).height <= 0) enemy.y = newY;
		if(oldX != enemy.x || oldY != enemy.y) {
			var tempObject = map.getObject(oldX, oldY);
			map.setObject(oldX, oldY, map.getObject(newX, newY));
			map.setObject(newX, newY, tempObject);
		}
		
		
	};
	
	RayCasterEngine.prototype.populateEnemies = function(enemyGrid, map) {
		enemyGrid = [];
		//console.log(enemyGrid);
		for(var x = 0; x < map.size; x++) {
			for(var y = 0; y < map.size; y++) {
				if(map.getObject(x, y).height > 0) {
					enemyGrid.splice(0, 0, new Enemy(x, y, map));
					//console.log("Enemy added: " + x + ", " + y);
				}
			}
		}
		return enemyGrid;
	};
      