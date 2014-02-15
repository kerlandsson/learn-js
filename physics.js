var DIRS = {
	W : "west",
	N : "north",
	E : "east",
	S : "south"
};

var DIR = {
	W : new Direction(DIRS.W),
	N : new Direction(DIRS.N),
	E : new Direction(DIRS.E),
	S : new Direction(DIRS.S)
};

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
	};

	Direction.prototype.equals = function(other) {
		return other.direction === this.direction;
	};

	Direction.prototype.isVertical = function() {
		return this.direction == DIRS.N || this.direction == DIRS.S;
	};
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
			return new Edge(this.x + this.w, this.y, this.x + this.w, this.y
					+ this.h);
		} else if (dir.equals(DIR.S)) {
			return new Edge(this.x, this.y + this.h, this.x + this.w, this.y
					+ this.h);
		}
	};
}

function Edge(x1, y1, x2, y2) {
	this.x1 = x1;
	this.x2 = x2;
	this.y1 = y1;
	this.y2 = y2;

	Edge.prototype.isVerticalEdge = function() {
		return this.x1 === this.x2;
	};
}

// Throws error in case rectangles never collide
function timeToCollision(movingRect, vector, stillRect) {
	var yTime = calculateYTimeToCollision(movingRect, vector, stillRect);
	var xTime = calculateXTimeToCollision(movingRect, vector, stillRect);
	var res = calculateCollisionTimeAndDirection(vector, yTime, xTime);
	if (res.direction === undefined) {
		throw "could not determine collision direction";
	}
	if (res.time === Infinity) {
		throw "Infinity until collision";
	}

	return res;
}

function calculateCollisionTimeAndDirection(vector, yTime, xTime) {
	var res = {};
	if (yTime < xTime) {
		res.time = yTime;
		res.direction = vector.getCardinalDirections().h;
	} else {
		res.time = xTime;
		res.direction = vector.getCardinalDirections().v;	
	}
	return res;
}

function calculateXTimeToCollision(movingRect, vector, stillRect) {
	var movingCollisionDirs = vector.getCardinalDirections();
	if (movingCollisionDirs.v === undefined) {
		return Infinity;
	}
	var movingEdge = movingRect.getEdge(movingCollisionDirs.v);
	var stillEdge = stillRect.getEdge(movingCollisionDirs.v.opposite());
	var xDistance = stillEdge.x1 - movingEdge.x1;
	var xTime = xDistance / vector.vx;
	if (xTime < 0) {
		xTime = Infinity;
	}
	return xTime;
}

function calculateYTimeToCollision(movingRect, vector, stillRect,
		movingCollisionDirs) {
	var movingCollisionDirs = vector.getCardinalDirections();
	if (movingCollisionDirs.h === undefined) {
		return Infinity;
	}
	var movingEdge = movingRect.getEdge(movingCollisionDirs.h);
	var stillEdge = stillRect.getEdge(movingCollisionDirs.h.opposite());
	var yDistance = stillEdge.y1 - movingEdge.y1;
	var yTime = yDistance / vector.vy;
	if (yTime < 0) {
		yTime = Infinity;
	}
	return yTime;
}

function Vector(vx, vy) {
	this.vx = vx;
	this.vy = vy;

	Vector.prototype.getCardinalDirections = function() {
		var directions = {};
		if (this.vx > 0) {
			directions.v = DIR.E;
		} else if (this.vx < 0) {
			directions.v = DIR.W;
		}
		if (this.vy > 0) {
			directions.h = DIR.S;
		} else if (this.vy < 0) {
			directions.h = DIR.N;
		}
		return directions;
	};

	Vector.prototype.magnitude = function() {
		return Math.sqrt(vx * vx + vy * vy);
	};

}

function intersects(r1, r2) {
	return r1.x <= r2.x + r2.w && r1.x + r1.w >= r2.x && r1.y <= r2.y + r2.h
			&& r1.y + r1.h >= r2.y;
}
