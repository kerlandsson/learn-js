var CONFIG = {
	GAME_WIDTH : 600,
	GAME_HEIGHT : 300,
	BGCOLOR : "#00bfff",
	BALL_RADIUS : 5
};


var SCALE = 30;



function Entity(x, y, angle) {
	this.x = x;
	this.y = y;
	this.angle = (angle === undefined ? 0 : angle);
}

Entity.prototype.update = function(state) {
	this.x = state.x;
	this.y = state.y;
	this.angle = state.angle;
};

function RectangleEntity(x, y, halfWidth, halfHeight, angle) {
	Entity.call(this, x, y, angle);
	this.halfWidth = halfWidth;
	this.halfHeight = halfHeight;
}
RectangleEntity.prototype = new Entity();
RectangleEntity.prototype.constructor = RectangleEntity;

RectangleEntity.prototype.draw = function(ctx) {
	ctx.save();
	ctx.translate(this.x * SCALE, this.y * SCALE);
	ctx.rotate(this.angle);
	ctx.translate(-(this.x) * SCALE, -(this.y) * SCALE);
	ctx.fillStyle = 'red';
	ctx.fillRect((this.x - this.halfWidth) * SCALE, (this.y - this.halfHeight)
			* SCALE, (this.halfWidth * 2) * SCALE, (this.halfHeight * 2)
			* SCALE);
	ctx.restore();

//	Entity.prototype.draw.call(this, ctx);
};

function Game() {

}

Game.prototype.tick = function(delta) {

};

function GameRenderer(ctx) {
	this.ctx = ctx;
}

var objects = [];

GameRenderer.prototype.render = function() {
	this.ctx.clearRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
	//world.DrawDebugData();
	for (var i = 0; i < objects.length; i++) {
		objects[i].draw(this.ctx);
	}
};

var ctx = setupCanvasContext(CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);

function enableDebugDraw() {
	var debugDraw = new b2DebugDraw();
	debugDraw.SetSprite(ctx);
	debugDraw.SetDrawScale(30.0);
	debugDraw.SetFillAlpha(0.5);
	debugDraw.SetLineThickness(1.0);
	debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
	world.SetDebugDraw(debugDraw);
}

var renderer = new GameRenderer(ctx);
var game = new Game();

function renderAndRequestNewFrame() {
	renderer.render();
	requestAnimationFrame(t.tick);
}


var pw = new PhysicsWorld(0, 10);

function tickGame(delta) {
	pw.step(delta);
	game.tick(delta);
}

var myRect = new RectangleEntity(3, 3, 2, 2, Math.PI / 9);
var ground = new RectangleEntity(0, 9.8, 20, 0.2);
var obstacle = new RectangleEntity(2, 9.5, 0.3, 1);

pw.addBody(myRect, {type: BODY_TYPE.DYNAMIC});
pw.addBody(ground, {type: BODY_TYPE.STATIC});
pw.addBody(obstacle, {type: BODY_TYPE.DYNAMIC});

objects.push(myRect);
objects.push(ground);
objects.push(obstacle);


var t = new Ticker(tickGame, renderAndRequestNewFrame);
renderAndRequestNewFrame();
