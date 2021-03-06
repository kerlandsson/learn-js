var CONSTANTS = {KEY_LEFT: 37,
		KEY_UP: 38,
		KEY_RIGHT: 39};

var CONFIG = {
	GAME_WIDTH : 20, // meters
	GAME_HEIGHT : 10, // meters
	BGCOLOR : "#00bfff",
	BALL_RADIUS : 5,
	DRAW_SCALE : 30 // pixels per "meter"
};

var keysDown = {};
addEventListener("keydown", function(e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function(e) {
	delete keysDown[e.keyCode];
}, false);


function Entity(x, y, angle) {
	this.x = x;
	this.y = y;
	this.angle = (angle === undefined ? 0 : angle);
	this.vx = 0;
	this.vy = 0;
}

Entity.prototype.update = function(state) {
	this.x = state.x;
	this.y = state.y;
	this.angle = state.angle;
	this.vx = state.vx;
	this.vy = state.vy;
};

function RectangleEntity(x, y, halfWidth, halfHeight, angle) {
	Entity.call(this, x, y, angle);
	this.halfWidth = halfWidth;
	this.halfHeight = halfHeight;
}
RectangleEntity.prototype = new Entity();
RectangleEntity.prototype.constructor = RectangleEntity;

function CircleEntity(x, y, radius, angle) {
	Entity.call(this, x, y, angle);
	this.radius = radius;
}

CircleEntity.prototype = new Entity();
CircleEntity.prototype.constructor = CircleEntity;


function Game() {
	this.pw = new PhysicsWorld(0, 10);
	var myRect = new RectangleEntity(3, 3, 2, 2, Math.PI / 9);
	var ground = new RectangleEntity(CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT - 0.2, CONFIG.GAME_WIDTH / 2, 0.2);
	var obstacle = new RectangleEntity(2, 9.5, 0.3, 1);
	var ball = new CircleEntity(8, 3, 0.4);
	this.char = new RectangleEntity(5, 9, 0.4, 1);

	this.pw.addBody(myRect, {type: BODY_TYPE.DYNAMIC});
	this.pw.addBody(ground, {type: BODY_TYPE.STATIC, restitution: 0, friction: 0.2});
	this.pw.addBody(obstacle, {type: BODY_TYPE.DYNAMIC});
	this.pw.addBody(ball, {type: BODY_TYPE.DYNAMIC, angularDamping: 2});
	this.charBody = this.pw.addBody(this.char, {type: BODY_TYPE.DYNAMIC, fixedRotation: true, friction: 50, restitution: 0});

	this.bodies = [myRect, ground, obstacle, ball, this.char];
}

Game.prototype.tick = function(delta) {
	this.pw.step(delta);
	this.handleInput();
};

Game.prototype.handleInput = function() {
	var desiredVelocity = 0;
	if (CONSTANTS.KEY_LEFT in keysDown) {
		desiredVelocity -= 10;
	}
	if (CONSTANTS.KEY_RIGHT in keysDown) {
		desiredVelocity += 10;
	}
	if (CONSTANTS.KEY_UP in keysDown) {
		this.charBody.ApplyImpulse(new b2Vec2(0, -1), this.charBody.GetWorldCenter());
	}
	if (desiredVelocity != 0) {
		var velChange = desiredVelocity - this.char.vx;
		var impulse = this.charBody.GetMass() * velChange;
		this.charBody.ApplyImpulse(new b2Vec2(impulse, 0), this.charBody.GetWorldCenter());
	}
};

function GameRenderer(ctx, game, drawScale) {
	this.ctx = ctx;
	this.game = game;
	this.scale = drawScale;
}

GameRenderer.prototype.render = function() {
	this.ctx.clearRect(0, 0, CONFIG.DRAW_SCALE * CONFIG.GAME_WIDTH, CONFIG.DRAW_SCALE * CONFIG.GAME_HEIGHT);
	//world.DrawDebugData();
	var bodies = this.game.bodies;
	for (var i = 0; i < bodies.length; i++) {
		this.drawBody(bodies[i]);
	}
};

GameRenderer.prototype.drawBody = function(body) {
	if (body instanceof RectangleEntity) {
		this.drawRectangle(body);
	} if (body instanceof CircleEntity) {
		this.drawCircle(body);
	}
};

GameRenderer.prototype.drawRectangle = function(rect) {
	ctx.save();
	ctx.translate(rect.x * this.scale, rect.y * this.scale);
	ctx.rotate(rect.angle);
	ctx.translate(-(rect.x) * this.scale, -(rect.y) * this.scale);
	//ctx.fillStyle = 'red';
	ctx.fillRect((rect.x - rect.halfWidth) * this.scale, (rect.y - rect.halfHeight)
			* this.scale, (rect.halfWidth * 2) * this.scale, (rect.halfHeight * 2)
			* this.scale);
	ctx.restore();
};

GameRenderer.prototype.drawCircle = function(circle) {
	ctx.save();
//	ctx.translate(circle.x * this.scale, circle.y * this.scale);
//	ctx.rotate(circle.angle);
//	ctx.translate(-(circle.x) * this.scale, -(circle.y) * this.scale);
    ctx.beginPath();
    ctx.arc(circle.x * this.scale, circle.y * this.scale, circle.radius * this.scale, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
	ctx.restore();
};

var ctx = setupCanvasContext(CONFIG.DRAW_SCALE * CONFIG.GAME_WIDTH, CONFIG.DRAW_SCALE * CONFIG.GAME_HEIGHT);

function enableDebugDraw() {
	var debugDraw = new b2DebugDraw();
	debugDraw.SetSprite(ctx);
	debugDraw.SetDrawScale(30.0);
	debugDraw.SetFillAlpha(0.5);
	debugDraw.SetLineThickness(1.0);
	debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
	world.SetDebugDraw(debugDraw);
}

var game = new Game();
var renderer = new GameRenderer(ctx, game, CONFIG.DRAW_SCALE);

function renderAndRequestNewFrame() {
	renderer.render();
	requestAnimationFrame(t.tick);
}

function tickGame(delta) {
	game.tick(delta);
}

var t = new Ticker(tickGame, renderAndRequestNewFrame);
renderAndRequestNewFrame();
