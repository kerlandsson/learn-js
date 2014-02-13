var DIR = {W : "west",
	N : "north",
	E : "east",
	S : "south"}

function Rectangle(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;

	Rectangle.prototype.getEdge = function(dir) {
		if (dir === DIR.W) {
			return new Edge(this.x, this.y, this.x, this.y + this.h);
		} else if (dir === DIR.N) {
			return new Edge(this.x, this.y, this.x + this.w, this.y);
		} else if (dir === DIR.E) {
			return new Edge(this.x + this.w, this.y, this.x + this.w, this.y + this.h);
		} else if (dir === DIR.S) {
			return new Edge(this.x, this.y + this.h, this.x + this.w, this.y + this.h);
		}

	}
}

function Edge(x1, y1, x2, y2) {
	this.x1 = x1;
	this.x2 = x2;
	this.y1 = y1;
	this.y2 = y2;
}

function Vector(vx, vy) {
	this.vx = vx;
	this.vy = vy;
}

function intersects(r1, r2) {
        return r1.x <= r2.x + r2.w
                        && r1.x + r1.w >= r2.x
                        && r1.y <= r2.y + r2.h
                        && r1.y + r1.h >= r2.y;
}
