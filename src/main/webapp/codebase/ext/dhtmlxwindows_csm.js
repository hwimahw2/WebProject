dhtmlXWindows.prototype.enableComposite = function() {
	
	
	this._compoEnabled = false;
	this._compoWins = {};
	this._compoArr = new Array();
	
	this.setCompoWindows = function(wins) {
		for (a in this._compoWins) {
			delete this._compoWins[a];
		}
		var w = wins.split(";");
		for (var q=0; q<w.length; q++) {
			this._compoArr[q] = new Array();
			var k = w[q].split(",");
			for (var e=0; e<k.length; e++) {
				this._compoArr[q][this._compoArr[q].length] = k[e];
				if (this._compoWins[k[e]] == null) {
					var id = k[e];
					var p = this.window(id).getPosition();
					var d = this.window(id).getDimension();
					this._compoWins[id] = {};
					this._compoWins[id]["x"] = p[0];
					this._compoWins[id]["y"] = p[1];
					this._compoWins[id]["width"] = d[0];
					this._compoWins[id]["height"] = d[1];
				}
			}
		}
	}
	
	this.setCompoMaxDimension = function(width, height) {
		
	}
	
	this.renderCompo = function() {
		this._compoEnabled = true;
	}
	
	// fix moving
	this._compoFixMove = function(win) {
		var id = win.getId();
		if (this._compoWins[id] == null) { return; }
		//
		var ofsX = win.x - this._compoWins[id]["x"];
		var ofsY = win.y - this._compoWins[id]["y"];
		if (ofsX != 0 || ofsY != 0) {
			// fix windows coords
			for (a in this._compoWins) {
				this._compoWins[a]["x"] = this._compoWins[a]["x"] + ofsX;
				this._compoWins[a]["y"] = this._compoWins[a]["y"] + ofsY;
				if (a != id) { this.window(a).setPosition(this._compoWins[a]["x"], this._compoWins[a]["y"]); }
			}
		}
	}
	// fix resize
	this._compoFixResize = function(win, dir) {
		var id = win.getId();
		if (this._compoWins[id] == null) { return; }
		//
		var pos =  new Array();
		if (dir == "border_bottom") {
			var maxR = -1;
			//
			var front = {};
			var opposite = {};
			//
			for (var q=0; q<this._compoArr.length; q++) {
				for (var w=0; w<this._compoArr[q].length; w++) {
					if (this._compoArr[q][w] == id) {
						if (q > maxR) { maxR = q; }
					}
				}
			}
			// console.log(this._compoArr[maxR])
			for (var q=0; q<this._compoArr[maxR].length; q++) {
				front[this._compoArr[maxR][q]] = 1;
				if (this._compoArr[maxR+1]!=null) {
					// console.log(this._compoArr[maxR][q],this._compoArr[maxR+1][q])
					if (this._compoArr[maxR][q] != this._compoArr[maxR+1][q]) {
						opposite[this._compoArr[maxR+1][q]] = 1;
					} else {
						if (front[this._compoArr[maxR][q]] != null) {
							delete front[this._compoArr[maxR][q]];
						}
					}
				}
			}
			// modify
			var d = win.getDimension();
			var k = this._compoWins[id]["height"] - d[1];
			
			for (a in opposite) {
				this._compoWins[a]["height"] = this._compoWins[a]["height"] + k;
				this.window(a).setDimension(this._compoWins[a]["width"], this._compoWins[a]["height"]);
				//
				this._compoWins[a]["y"] = this._compoWins[a]["y"] - k;
				this.window(a).setPosition(this._compoWins[a]["x"], this._compoWins[a]["y"]);
				//
				var w = this.window(a).getDimension();
				var w2 = this.window(a).getMinDimension();
				//
				
				if (w[0] == w2[0] || w[1] == w2[1]) {
					this._compoFixResize(this.window(a), dir);
				}
			}
			for (a in front) {
				this._compoWins[a]["height"] = this._compoWins[a]["height"] - k;
				this.window(a).setDimension(this._compoWins[a]["width"], this._compoWins[a]["height"]);
			}
		}
	}
}
