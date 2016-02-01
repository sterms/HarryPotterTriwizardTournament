function Enemy(x, y) {
	this.height = .6;
	this.x = x;
	this.y = y;
	this.distanceFromPlayer = 0;
};

Enemy.prototype.setDistance = function(origin) {
	this.distanceFromPlayer = Math.sqrt(((this.x - origin.x) * (this.x - origin.x)) + ((this.y - origin.y) *(this.y - origin.y)));
};

function Map(size) {
        this.size = size;
        this.wallGrid = new Uint8Array(size * size);
        this.skybox = new ImageFile('assets/northern.jpg', 2000, 750);
		this.wallTextures = [];
        this.light = 0;
		this.enemies = [];		
		this.wallTextures.push(new ImageFile('assets/hedge.jpg', 2048, 2048));
      }
	  
		Map.prototype.addEnemy = function(enemy) {
			var newEntry = new Enemy(enemy.x, enemy.y);
			this.enemies.push(newEntry);
		};
		
		Map.prototype.updateEnemies = function(origin) {
			for(var i = 0; i < this.enemies.length; i++) {
				this.enemies[i].setDistance(origin);
			}
		};
	  
      Map.prototype.get = function(x, y) {
        x = Math.floor(x);
        y = Math.floor(y);
        if (x < 0 || x > this.size - 1 || y < 0 || y > this.size - 1) return -1;
        return this.wallGrid[y * this.size + x];
      };

	  
	  
      Map.prototype.randomize = function() {
		var totalSize = this.size * this.size;
        for (var i = 0; i < this.size * this.size; i++) {
          //this.wallGrid[i] = Math.random() < 0.3 ? 1 : 0;
		  if(i % 2 == 0) {
			  this.wallGrid[i] = 1;
		  } else {
			  this.wallGrid[i] = 0;
		  }
        }
      };
	  
	  Map.prototype.buildIntroLevel = function() {
		  var totalSize = this.size * this.size;
		  for(var i = 0; i < totalSize; i++) {
			  //Fill top and bottoms
			  if(i >= 0 && i < this.size) {
				  this.wallGrid[i] = 1;
			  }
			  if(i >= totalSize-this.size && i < totalSize) {
				  this.wallGrid[i] = 1;
			  }
			  //Fill edges.
			  if(i % this.size == 0) {
				  this.wallGrid[i] = 1;
			  }
			  if(i % this.size == this.size-1) {
				  this.wallGrid[i] = 1;
			  }
			  
			  
			  if(i >= 33 && i < 44) {
				  this.wallGrid[i] = 1;
			  }
			  if(i >= 66 && i < 75) {
				  this.wallGrid[i] = 1;
			  }
			  if(i >= 98 && i < 111) {
				  this.wallGrid[i] = 1;
			  }
			  if(i == 114) {
				  this.wallGrid[i] = 1;
			  }
			  
			  if(i == 130 || (i >= 132 && i <= 139)) {
				  this.wallGrid[i] = 1;
			  }
			  if(i == 146 || (i >= 148 && i <= 152) || i == 155) {
				  this.wallGrid[i] = 1;
			  }
			  
			  if(i == 162 || (i >= 164 && i <= 168) || i == 171) {
				  this.wallGrid[i] = 1;
			  }
			  if(i == 178 || (i >= 180 && i <= 184) || i == 187) {
				  this.wallGrid[i] = 1;
			  }
			  if(i == 194 || (i >= 196 && i <= 200) || i == 203) {
				  this.wallGrid[i] = 1;
			  }
			  if(i == 210 || (i >= 212 && i <= 216) || i == 219) {
				  this.wallGrid[i] = 1;
			  }
			  if(i == 235) {
				  this.wallGrid[i] = 1;
			  }
			  
		  }
		  
		 
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
		this.addEnemy({x: 3.5, y: 1.5});
	  };

      Map.prototype.cast = function(point, angle, range) {
		//console.log("Inside Cast:");
        var self = this;
        var sin = Math.sin(angle);
        var cos = Math.cos(angle);
        var noWall = { length2: Infinity };

        return ray({ x: point.x, y: point.y, height: 0, distance: 0 });

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
          step.height = self.get(step.x - dx, step.y - dy);
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