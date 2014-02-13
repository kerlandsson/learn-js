test( "create rect", function() {
	var r = new Rectangle(1,2,10,20);
	equal(r.x, 1);
	equal(r.y, 2);
	equal(r.w, 10);
	equal(r.h, 20);
});
