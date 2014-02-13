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



