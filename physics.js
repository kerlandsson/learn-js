
function Rectangle(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
}

function intersects(r1, r2) {
        return r1.x <= r2.x + r2.w
                        && r1.x + r1.w >= r2.x
                        && r1.y <= r2.y + r2.h
                        && r1.y + r1.h >= r2.y;
}
