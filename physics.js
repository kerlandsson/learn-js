var DIRS = {W : "west",
	N : "north",
	E : "east",
	S : "south"}

var DIR = {W : new Direction(DIRS.W),
	N : new Direction(DIRS.N),
	E : new Direction(DIRS.E),
	S : new Direction(DIRS.S)
}

function Direction(direction) {
	this.direction = direction;
	this.opposite = function() {
		if (this.direction == DIRS.W) {
			return new Direction(DIRS.E);
		}
		if (this.direction == DIRS.E) {
			return new Direction(DIRS.W);
		}
		if (this.direction == DIRS.N) {
			return new Direction(DIRS.S);
		}
		if (this.direction == DIRS.S) {
			return new Direction(DIRS.N);
		}
	}

	Direction.prototype.equals = function(other) {
		return other.direction === this.direction;
	}
}


function Rectangle(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;

	Rectangle.prototype.getEdge = function(dir) {
		if (dir.equals(DIR.W)) {
			return new Edge(this.x, this.y, this.x, this.y + this.h);
		} else if (dir.equals(DIR.N)) {
			return new Edge(this.x, this.y, this.x + this.w, this.y);
		} else if (dir.equals(DIR.E)) {
			return new Edge(this.x + this.w, this.y, this.x + this.w, this.y + this.h);
		} else if (dir.equals(DIR.S)) {
			return new Edge(this.x, this.y + this.h, this.x + this.w, this.y + this.h);
		}
	}
}

function Edge(x1, y1, x2, y2) {
	this.x1 = x1;
	this.x2 = x2;
	this.y1 = y1;
	this.y2 = y2;

	Edge.prototype.isVerticalEdge = function() {
		return this.x1 === this.x2;
	}
}

function timeToCollision(movingRect, vector, stillRect) {
	var movingCollisionDirs = vector.getCardinalDirections();
	if (movingCollisionDirs.length == 1) {
		var movingEdge = movingRect.getEdge(movingCollisionDirs[0]);
		var stillEdge = stillRect.getEdge(movingCollisionDirs[0].opposite());
		if (movingEdge.isVerticalEdge()) {
			var xDistance = stillEdge.x1 - movingEdge.x1;
			return xDistance;
		} else {
			var yDistance = stillEdge.y1 - movingEdge.y1;
			return yDistance;
		}
	}

}

function Vector(vx, vy) {
	this.vx = vx;
	this.vy = vy;

	Vector.prototype.getCardinalDirections = function() {
		var directions = [];
		if (this.vx > 0) {
			directions.push(DIR.E);
		} else if (this.vx < 0) {
			directions.push(DIR.W);
		}
		if (this.vy > 0) {
			directions.push(DIR.S);
		} else if (this.vy < 0) {
			directions.push(DIR.N);
		}
		return directions;
	}
}

function intersects(r1, r2) {
        return r1.x <= r2.x + r2.w
                        && r1.x + r1.w >= r2.x
                        && r1.y <= r2.y + r2.h
                        && r1.y + r1.h >= r2.y;
}

