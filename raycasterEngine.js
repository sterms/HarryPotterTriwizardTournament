	var CIRCLE = Math.PI * 2;

	
	function Object(texture, height, width) {
		this.height = height;
		this.texture = texture;
		this.width = width;
	};


      function Controls() {
        this.codes  = { 37: 'left', 39: 'right', 38: 'forward', 40: 'backward', 65: 'left', 87: 'forward', 68: 'right', 83: 'backward', 81: 'strafeLeft', 69: 'strafeRight'};
        this.states = { 'left': false, 'right': false, 'forward': false, 'backward': false, 'strafeLeft': false, 'strafeRight': false, 'fire': false};
        document.addEventListener('keydown', this.onKey.bind(this, true), false);
        document.addEventListener('keyup', this.onKey.bind(this, false), false);
        document.addEventListener('touchstart', this.onTouch.bind(this), false);
        document.addEventListener('touchmove', this.onTouch.bind(this), false);
        document.addEventListener('touchend', this.onTouchEnd.bind(this), false);
		document.addEventListener('click', this.onClick.bind(this), false);
		document.addEventListener('mousemove', this.onMouse.bind(this), false);
      }

	  Controls.prototype.onClick = function(e) {
			this.states['fire'] = true;
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
        this.weapon = new ImageFile('assets/wandhand1.png', 170, 311);
        this.paces = 0;
      }

      Player.prototype.rotate = function(angle) {
        this.direction = (this.direction + angle + CIRCLE) % (CIRCLE);
      };

      Player.prototype.walk = function(distance, map) {
        var dx = Math.cos(this.direction) * distance;
        var dy = Math.sin(this.direction) * distance;
        if (map.getWall(this.x + dx, this.y).height <= 0) this.x += dx;
        if (map.getWall(this.x, this.y + dy).height <= 0) this.y += dy;
        this.paces += distance;
      };
	  
	  Player.prototype.strafe = function(distance, map) {
		var dx = Math.cos(this.direction + Math.PI / 2) * distance;
        var dy = Math.sin(this.direction + Math.PI / 2) * distance;
        if (map.getWall(this.x + dx, this.y).height <= 0) this.x += dx;
        if (map.getWall(this.x, this.y + dy).height <= 0) this.y += dy;
        this.paces += distance;
	  }

      Player.prototype.update = function(controls, map, seconds) {
        if (controls.left) this.rotate(-Math.PI * .3 * seconds);
        if (controls.right) this.rotate(Math.PI * .3 * seconds);
        if (controls.forward) this.walk(2.5 * seconds, map);
        if (controls.backward) this.walk(-1.5 * seconds, map);
		if (controls.strafeLeft) this.strafe(-1.5 * seconds, map);
		if (controls.strafeRight) this.strafe(1.5 * seconds, map);
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

      Camera.prototype.render = function(player, map) {
        this.drawSky(player.direction, map.skybox, map.light);
        this.drawColumns(player, map);
        this.drawWeapon(player.weapon, player.paces);
      };
	  
	  Camera.prototype.fireWeapon = function(player, map) {
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
          var ray = map.cast(player, player.direction + angle, this.range);
          this.drawColumn(column, ray, angle, map);
        }
		
			this.fireWeapon(player, map);
		
        this.ctx.restore();
      };

      Camera.prototype.drawWeapon = function(weapon, paces) {
        var bobX = Math.cos(paces * 2) * this.scale * 6;
        var bobY = Math.sin(paces * 4) * this.scale * 6;
        var left = this.width * .7 + bobX;
        var top = this.height * .5 + bobY;
        this.ctx.drawImage(weapon.image, left, top, weapon.width * this.scale, weapon.height * this.scale);
      };

Camera.prototype.drawColumn = function(column, ray, angle, map) {
        var ctx = this.ctx;
        //var texture = map.wallTextures[0];
        var left = Math.floor(column * this.spacing);
        var width = Math.ceil(this.spacing);
        var hitWall = -1;
		var hitObject = -1;

        while (++hitWall < ray.length && ray[hitWall].wallHeight <= 0);	//This loop runs until it finds the first section of ray with a height not 0.
		while (++hitObject < ray.length && ray[hitObject].objectHeight <= 0);

		
        for (var s = ray.length - 1; s >= 0; s--) {		//Iterates backward from all Ray sections. This is not in the while loop.
          var step = ray[s];
		  if(map.weather == 'RAIN') var weatherDebris = Math.pow(Math.random(), 3) * s;
		  else if(map.weather == 'SNOW') var weatherDebris = 2;
		  else if(map.weather == 'TOXIC') var weatherDebris = 3;
          var weather = (weatherDebris > 0) && this.project(0.1, angle, step.distance);	  
		  
		  
          if (s === hitWall) {				//When it finds the one closest to the player, it generates the wall.
			var texture = map.getWall(Math.floor(ray[s].x), Math.floor(ray[s].y)).texture;
			if(this.doOnce == 0) console.log(ray); 
            //var textureX = Math.floor(texture.width * step.offset);
			var textureX = Math.floor(map.getWall(Math.floor(ray[s].x), Math.floor(ray[s].y)).texture.width * step.offset);
			//Run a .get here on the step.x step.y to get wall, texture from wall.
            var wall = this.project(step.wallHeight, angle, step.distance);

			
            ctx.globalAlpha = 1;
            ctx.drawImage(texture.image, textureX, 0, 1, texture.height, left, wall.top, width, wall.height);
            
            ctx.fillStyle = '#000000';
            ctx.globalAlpha = Math.max((step.distance + step.shading) / this.lightRange - map.light, 0);
            ctx.fillRect(left, wall.top, width, wall.height);	

          }
		  
		  if (s === hitObject) {								//When it finds the one closest to the player, it generates the wall.
			var texture = map.getObject(Math.floor(ray[s].x), Math.floor(ray[s].y)).texture;

			if(texture != null) {
				var offset = map.getObject(Math.floor(ray[s].x), Math.floor(ray[s].y)).width/2;
				var textureX = Math.floor(map.getObject(Math.floor(ray[s].x), Math.floor(ray[s].y)).texture.width * (step.offset - offset));

				var object = this.project(step.objectHeight, angle, step.distance);				
	
				ctx.globalAlpha = 1;
				


				//ctx.drawImage(image, sourceX, sourceY, sorceWidth, sourceHeight, destX, destY, destWidth, destHeight);
								
					ctx.drawImage(texture.image, textureX, 0, 1, texture.height, left, object.top, width, object.height);

				
				ctx.fillStyle = '#000000';
				//ctx.globalAlpha = Math.max((step.distance + step.shading) / this.lightRange - map.light, 0);
				ctx.globalAlpha = 0;
				ctx.fillRect(left, object.top, width, object.height);				
			}

          }
          
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.15;
		  if(map.weather == 'RAIN') {
			  while (--weatherDebris > 0) ctx.fillRect(left, Math.random() * weather.top, 1, weather.height);
		  } else if (map.weather == 'SNOW') {
			  while (--weatherDebris > 0) ctx.fillRect(left, Math.random() * weather.top, 3, 3); 
		  } else if (map.weather == 'TOXIC') {
			  ctx.fillStyle = '#4DFE15';
			  while (--weatherDebris > 0) ctx.fillRect(left, Math.random() * weather.top, 10, 10); 
		  }

        }
		this.doOnce = 1;
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
	    var display = document.getElementById('gameWorld');
		var player = new Player(1.5, 1.5, Math.PI * 0.3);
		var map = new Map(16);
		var controls = new Controls();
		var camera = new Camera(display, 320, 0.8);
		var loop = new GameLoop();
		var numEnemies = 0;
		
		var that = this;
		
		map.buildIntroLevel();
		map.setWeather('RAIN');
		var enemy = new Enemy(new Object(new ImageFile('assets/dementor.png', 512, 256), 0, .4), 1, 4, this);
		var enemy2 = new Enemy(new Object(new ImageFile('assets/dementor.png', 512, 256), 0, .4), 2, 5, this);
		
		var enemyGrid = [enemy, enemy2];
		
		console.log(enemy);
		numEnemies++;
		numEnemies++;
		console.log(enemyGrid[1]);
		loop.start(function frame(seconds) {
			map.update(seconds);
			player.update(controls.states, map, seconds);
			that.updateEnemies(player, seconds, enemyGrid, numEnemies, map);
			camera.render(player, map);
		}); 
	  }
	  
	  
	function Enemy(object, initialX, initialY) {
		this.x = initialX || 0;
		this.y = initialY || 0;
		this.imageObject = object || 0;
		this.state = 0;
		this.speed = 0;		
		this.moveSpeed = .05;
	}
	
	RayCasterEngine.prototype.updateEnemies = function (player, seconds, enemyGrid, numEnemies, map) {

		for(var i = 0; i < numEnemies; i++) {
			var enemy = enemyGrid[i];
			console.log("update enemies " + i);
			var dx = player.x - enemy.x;
			var dy = player.y - enemy.y;
			var dist = Math.sqrt(dx*dx + dy*dy);
			console.log("update enemies dist = " + dist);
			if(dist > 2) {
				if(dist < 8) {
					RayCasterEngine.prototype.moveEnemy(enemy, seconds, player, dy, dx, map);
				}
			}
		}
	};
	
	RayCasterEngine.prototype.moveEnemy = function(enemy, seconds, player, dy, dx, map) {
		var moveDist = 2.5 * seconds;
		var direction = Math.atan2(dy, dx);
		var newX = enemy.x + Math.cos(direction) * moveDist;
		var newY = enemy.y + Math.sin(direction) * moveDist;
		if (map.getWall(newX, enemy.y).height <= 0) enemy.x = newX;
        if (map.getWall(enemy.x, newY).height <= 0) enemy.y = newY;
	};
      