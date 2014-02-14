var r = new Rectangle(10,20,30,40); // test rectangle

test( "create rect", function() {
	equal(r.x, 10);
	equal(r.y, 20);
	equal(r.w, 30);
	equal(r.h, 40);
});

test ( "not intersects", function() {
	var r2 = new Rectangle(41,61,10,20);
	ok(!intersects(r, r2));
});

test ( "intersects bottom right", function() {
	var r2 = new Rectangle(40, 60, 10, 10);
	ok(intersects(r, r2));
});

test ( "intersects top right", function() {
	var r2 = new Rectangle(10, 0, 10, 20);
	ok(intersects(r, r2));
});

test ( "intersects top left", function() {
	var r2 = new Rectangle(0, 0, 10, 20);
	ok(intersects(r, r2));
});

test ( "intersects bottom left", function() {
	var r2 = new Rectangle(0, 20, 10, 10);
	ok(intersects(r, r2));
});

test ("getEdge", function() {
	propEqual(r.getEdge(DIR.W), new Edge(10, 20, 10, 60));
	propEqual(r.getEdge(DIR.N), new Edge(10, 20, 40, 20));
	propEqual(r.getEdge(DIR.E), new Edge(40, 20, 40, 60));
	propEqual(r.getEdge(DIR.S), new Edge(10, 60, 40, 60));
});

test ("isVerticalEdge", function() {
	ok(r.getEdge(DIR.W).isVerticalEdge());
	ok(r.getEdge(DIR.E).isVerticalEdge());
	ok(!r.getEdge(DIR.N).isVerticalEdge());
	ok(!r.getEdge(DIR.S).isVerticalEdge());
});



test ("cardinalDirection", function() {
	deepEqual(new Vector(1,1).getCardinalDirections(), {v: DIR.E, h: DIR.S});
	deepEqual(new Vector(-1,1).getCardinalDirections(), {v: DIR.W, h: DIR.S});
	deepEqual(new Vector(-1,-1).getCardinalDirections(), {v: DIR.W, h: DIR.N});
	deepEqual(new Vector(1,-1).getCardinalDirections(), {v: DIR.E, h: DIR.N});
	deepEqual(new Vector(1,0).getCardinalDirections(), {v: DIR.E});
	deepEqual(new Vector(-1,0).getCardinalDirections(), {v: DIR.W});
	deepEqual(new Vector(0,1).getCardinalDirections(), {h: DIR.S});
	deepEqual(new Vector(0,-1).getCardinalDirections(), {h: DIR.N});
});

test ("vectorMagnitude", function() {
	var v = new Vector(3, 4);
	equal(v.magnitude(), 5);

});

test ("oppositeDir", function() {
	ok(DIR.W.opposite().equals(DIR.E));
	ok(DIR.E.opposite().equals(DIR.W));
	ok(DIR.N.opposite().equals(DIR.S));
	ok(DIR.S.opposite().equals(DIR.N));
});

test ("timeToCollision only vy south", function() {
	var r2 = new Rectangle(0, 0, 5, 5);
	var v = new Vector(0, 5);
	var res = timeToCollision(r2, v, r);
	equal(res.time, 3);
	ok(res.direction.equals(DIR.S));
});

test ("timeToCollision only vy miss", function() {
	var r2 = new Rectangle(0, 20, 5, 5);
	var v = new Vector(0, 5);
	var res = timeToCollision(r2, v, r);
	equal(res.time, -1);
	ok(res.direction.equals(DIR.S));
});

test ("timeToCollision only vy north", function() {
	var r2 = new Rectangle(0, 65, 5, 5);
	var v = new Vector(0, -5);
	var res = timeToCollision(r2, v, r);
	equal(res.time, 1);
	ok(res.direction.equals(DIR.N));
});

test ("timeToCollision only vx east", function() {
	var r2 = new Rectangle(0, 15, 5, 5);
	var v = new Vector(5, 0);
	var res = timeToCollision(r2, v, r);
	equal(res.time, 1);
	ok(res.direction.equals(DIR.E));
});

test ("timeToCollision only vx west", function() {
	var r2 = new Rectangle(50, 15, 5, 5);
	var v = new Vector(-5, 0);
	var res = timeToCollision(r2, v, r);
	equal(res.time, 2);
	ok(res.direction.equals(DIR.W));
});

//test ("timeToCollision only vx and vy", function() {
//	var r2 = new Rectangle(0, 0, 6, 7);
//	var v = new Vector(5, 5);
//	equal(timeToCollision(r2, v, r), 5);
//});

