var CONFIG = { GAME_WIDTH: 700,
		GAME_HEIGHT: 400,
		BGCOLOR: "#00bfff"};

// -----------------------------------------------------------------------------

function BallGame() {
	this.field = new Field(CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
}

BallGame.prototype.getField = function() {
	return this.field;
};

BallGame.prototype.tick = function(delta) {
	
};

//-----------------------------------------------------------------------------

function Field(w, h) {
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
}

BallGameRenderer.prototype.render = function() {
	if (!this.lastFieldRender) {
		var field = this.game.getField();
		this.ctx.save();
		this.ctx.fillStyle = CONFIG.BGCOLOR;
		this.ctx.fillRect(0, 0, field.getWidth(), field.getHeight());
		this.ctx.restore();
		this.lastFieldRender = "done";
	}
};

//-----------------------------------------------------------------------------

var game = new BallGame();
var renderer = new BallGameRenderer(setupCanvasContext(CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT), game);

function renderAndRequestNewFrame() {
	renderer.render();
	requestAnimationFrame(t.tick);
}

var t = new Ticker(game.tick, renderAndRequestNewFrame);
renderAndRequestNewFrame();