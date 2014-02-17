var CONFIG = { GAME_WIDTH: 700,
		GAME_HEIGHT: 400,
		BGCOLOR: "#00bfff",
		BALL_RADIUS: 5};

// -----------------------------------------------------------------------------

function BallGame() {
	this.field = new Field(CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
	this.ball = new Ball(CONFIG.BALL_RADIUS);
	this.ball.setPosition(50 + this.ball.getRadius(), this.field.getHeight() - 50 - this.ball.getRadius());
	this.ball.setSpeed(new Vector(0.3, -0.3));
	this.gravity = 0.00025;
}

BallGame.prototype.getField = function() {
	return this.field;
};

BallGame.prototype.getBall = function() {
	return this.ball;
};

BallGame.prototype.tick = function(delta) {
	this.ball.move(delta);
	this.ball.addYSpeed(this.gravity * delta);
};

//-----------------------------------------------------------------------------
function Ball(radius) {
	require(radius);
	this.radius = radius;
	this.x = 0;
	this.y = 0;
	this.speed = new Vector(0, 0);
}

Ball.prototype.setPosition = function(x, y) {
	require(x);
	require(y);
	this.x = x;
	this.y = y;
};

Ball.prototype.getRadius = function() {
	return this.radius;
};

Ball.prototype.getX = function() {
	return this.x;
};

Ball.prototype.getY = function() {
	return this.y;
};

Ball.prototype.setSpeed = function(newSpeed) {
	require(newSpeed);
	this.speed = newSpeed;
};

Ball.prototype.addYSpeed = function(amount) {
	require(amount);
	this.speed = new Vector(this.speed.vx, this.speed.vy + amount);
};

Ball.prototype.getSpeed = function() {
	return this.speed;
};

Ball.prototype.move = function(time) {
	require(time);
	var newX = this.getX() + this.speed.vx * time;
	var newY = this.getY() + this.speed.vy * time;
	this.setPosition(newX, newY);
};

//-----------------------------------------------------------------------------

function Field(w, h) {
	require(w);
	require(h);
	this.w = w;
	this.h = h;
}

Field.prototype.getWidth = function() {
	return this.w;
};

Field.prototype.getHeight = function() {
	return this.h;
};

//-----------------------------------------------------------------------------

function BallGameRenderer(ctx, game) {
	this.ctx = ctx;
	this.game = game;
	
	this.lastFieldRender = null;
	this.lastBallRender = null;
}

BallGameRenderer.prototype.render = function() {
	this.renderField();
	this.renderBall();
};

BallGameRenderer.prototype.renderField = function() {
	if (!this.lastFieldRender) {
		var field = this.game.getField();
		this.ctx.save();
		this.ctx.fillStyle = CONFIG.BGCOLOR;
		this.ctx.fillRect(0, 0, field.getWidth(), field.getHeight());
		this.ctx.restore();
		this.lastFieldRender = "done";
	}
};

BallGameRenderer.prototype.renderBall = function() {
		var ball = game.getBall();
		var x = ball.getX();
		var y = ball.getY();
		var radius = ball.getRadius();
		if (this.ballFirstTime() || this.ballHasMoved(x, y, radius)) {
			if (!this.ballFirstTime()) {
				// TODO need better clear logic since we have to use +1 here due to
				// antialiasing leaving tracks otherwise
				drawColoredCircle(this.ctx, CONFIG.BGCOLOR, this.lastBallRender.x,
					this.lastBallRender.y, this.lastBallRender.radius + 1);
			}
			drawCircle(this.ctx, x, y, radius);
			this.lastBallRender = {x: x, y: y, radius: radius};
		}
};

BallGameRenderer.prototype.ballHasMoved = function(x, y, radius) {
	return  this.lastBallRender.x !== x || this.lastBallRender.y !== y
		|| this.lastBallRender.radius !== radius;
};

BallGameRenderer.prototype.ballFirstTime = function() {
	return this.lastBallRender === null;
};

// ---------------------------------------------------------------------------------------------------

function drawColoredCircle(ctx, color, x, y, radius) {
	ctx.save();
	ctx.fillStyle = color;
	drawCircle(ctx, x, y, radius);
	ctx.restore();
}

function drawCircle(ctx, x, y, radius) {
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2);
	ctx.fill();
}

// ---------------------------------------------------------------------------------------------------

var game = new BallGame();
var renderer = new BallGameRenderer(setupCanvasContext(CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT), game);

function renderAndRequestNewFrame() {
	renderer.render();
	requestAnimationFrame(t.tick);
}

function tickGame(delta) {
	game.tick(delta);
}

var t = new Ticker(tickGame, renderAndRequestNewFrame);
renderAndRequestNewFrame();