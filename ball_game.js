var CONFIG = { GAME_WIDTH: 700,
		GAME_HEIGHT: 400,
		BGCOLOR: "#00bfff",
		BALL_RADIUS: 5};

// -----------------------------------------------------------------------------

function BallGame() {
	this.field = new Field(CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
	this.ball = new Ball(CONFIG.BALL_RADIUS);
	this.ball.move(50 + this.ball.getRadius(), this.field.getHeight() - 50 - this.ball.getRadius());
}

BallGame.prototype.getField = function() {
	return this.field;
};

BallGame.prototype.getBall = function() {
	return this.ball;
};

BallGame.prototype.tick = function(delta) {
	
};

//-----------------------------------------------------------------------------
function Ball(radius) {
	require(radius);
	this.radius = radius;
	this.x = 0;
	this.y = 0;
}

Ball.prototype.move = function(x, y) {
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
		if (this.ballHasMoved(x, y, radius)) {
			this.ctx.beginPath();
			this.ctx.arc(x, y, radius, 0, Math.PI * 2);
			this.ctx.fill();
			this.lastBallRender = {x: x, y: y, radius: radius};
		}
};
BallGameRenderer.prototype.ballHasMoved = function(x, y, radius) {
	if (this.lastBallRender == null) return true;
	return  this.lastBallRender.x !== x || this.lastBallRender.y !== y
		|| this.lastBallRender.radius !== radius;
};

var game = new BallGame();
var renderer = new BallGameRenderer(setupCanvasContext(CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT), game);

function renderAndRequestNewFrame() {
	renderer.render();
	requestAnimationFrame(t.tick);
}

var t = new Ticker(game.tick, renderAndRequestNewFrame);
renderAndRequestNewFrame();