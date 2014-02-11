var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var GAME_HEIGHT = 375;
var GAME_WIDTH = 500;

var keysDown = {};


addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

function Game(ctx) {
	var ctx = ctx;
	var field = new Field(GAME_WIDTH, GAME_HEIGHT);
	var paddle = new Paddle(new Point(0, GAME_HEIGHT - 15)); // FIXME hardcoded paddle height :)
	var ball = new Ball(new Point(50, GAME_HEIGHT - 50));

	this.tick = function(delta) {
		update(delta);
		//field.draw(ctx);
		paddle.draw(ctx);
		ball.draw(ctx);
	}

	var update = function(delta) {
		movePaddleIfKeyDown(delta);	
		moveBall(delta);
	}

	var moveBall = function(delta) {
		var howFar = (delta / 1000) * ball.speed();
		ball.move(howFar, field);
	}

	var movePaddleIfKeyDown = function(delta) {
		paddleMovement = calculatePaddleMovement(delta);
		potentialNewPos = paddle.peekMove(paddleMovement);
		if (potentialNewPos.x < 0) {
			paddleMovement = -paddle.pos.x;
		}
		var paddleMaxX = field.width - paddle.width()
		if (potentialNewPos.x > paddleMaxX) {
			paddleMovement = paddleMaxX - paddle.pos.x;
		}
		paddle.move(paddleMovement);

	}

	var calculatePaddleMovement = function(delta) {
		var paddleMovement = 0;
		if (KEY_LEFT in keysDown) {
			paddleMovement -= (delta / 1000) * paddle.speed();	

		}
		if (KEY_RIGHT in keysDown) {
			paddleMovement += (delta / 1000) * paddle.speed();	
		}	
		return paddleMovement;
	}
}

function Ball(startPos) {
	var RADIUS = 1;
	var BALL_SPEED = 300;
	this.pos = startPos;
	this.direction = Math.PI * 1 + Math.random();
	var that = this;

	Ball.prototype.draw = function(ctx) {
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, RADIUS, 0, Math.PI*2);
		ctx.fill();
	}

	Ball.prototype.move = function(howFar, field) {
		function angleHorizontal() {
			return Math.PI * 1.5 - that.direction;

		}
		function angleVertical() {
			return Math.PI * 2 - that.direction;
		}
		function normalizeDirection() {
			if (this.direction > 2 * Math.PI) {
				that.direction -= 2 * Math.PI;
			}
			if (this.direction < 0) {
				that.direction += 2 * Math.PI;
			}
		}
		var x = Math.cos(this.direction) * howFar;
		var y = Math.sin(this.direction) * howFar;
		if (this.ballNorthY() + y < 0) {
			var distanceToCollision = this.ballNorthY() / Math.cos(angleHorizontal());
			var remainingDistance = howFar - distanceToCollision;
			var xDistanceToCollide = Math.cos(this.direction) * distanceToCollision;
			var yDistanceToCollide = Math.sin(this.direction) * distanceToCollision;
			console.log("distance=" + howFar + ", distanceToCollision=" + distanceToCollision + ", remainingDistance=" + remainingDistance + ", xDistanceToCollide=" + xDistanceToCollide);
			this.direction = this.direction + 2 * angleHorizontal() - Math.PI;
			this.pos = new Point(this.pos.x + xDistanceToCollide, this.pos.y + yDistanceToCollide);
			this.move(remainingDistance, field);
		} else if (this.ballSouthY() + y > field.height) {
			this.direction = this.direction + 2 * angleHorizontal() - Math.PI;
			var remainingY = y - (field.height - this.ballSouthY());
			this.pos = new Point(this.pos.x + x, field.height - remainingY);
		} else if (this.ballEastX() + x > field.width) {
			this.direction = this.direction + 2 * angleVertical() - Math.PI;
			var remainingX = x - (field.width - this.ballEastX());
			this.pos = new Point(field.width - remainingX, this.pos.y + y);
		} else if (this.ballWestX() < 0) {
			this.direction = this.direction + 2 * angleVertical() - Math.PI;
			var remainingX = -(x + this.ballWestX());
			this.pos = new Point(remainingX, this.pos.y + y);
		}
		else {
			this.pos = new Point(this.pos.x + x, this.pos.y + y);
		}
		normalizeDirection();
	}

	Ball.prototype.speed = function() {
		return BALL_SPEED;
	}

	Ball.prototype.ballNorthY = function() {
		return this.pos.y - RADIUS;
	}
	Ball.prototype.ballSouthY = function() {
		return this.pos.y + RADIUS;
	}
	Ball.prototype.ballEastX = function() {
		return this.pos.x + RADIUS;
	}
	Ball.prototype.ballWestX = function() {
		return this.pos.x - RADIUS;
	}

}

function Paddle(startPos) {
	var PADDLE_HEIGHT = 15;
	var PADDLE_WIDTH = 40;
	var PADDLE_SPEED = 400;
	this.pos = startPos;

	// Positive for right, negative for left. No bounds checking.
	Paddle.prototype.move = function(howFar) {
		this.pos = this.peekMove(howFar);
	}

	// Returns the point the paddle would move to if move was called with this howFar value.
	Paddle.prototype.peekMove = function(howFar) {
		return new Point(this.pos.x + howFar, this.pos.y);
	}


	Paddle.prototype.draw = function(ctx) {
		ctx.fillRect(this.pos.x, this.pos.y, PADDLE_WIDTH, PADDLE_HEIGHT);
	}

	Paddle.prototype.speed = function() {
		return PADDLE_SPEED;
	}
	
	Paddle.prototype.height = function() {
		return PADDLE_HEIGHT;
	}

	Paddle.prototype.width = function() {
		return PADDLE_WIDTH;
	}

}

function Point(x, y) {
	this.x = x;
	this.y = y;
}

function Field(width, height) {
	this.width = width;
	this.height = height;

	Field.prototype.draw = function(ctx) {
		ctx.save();
		ctx.fillStyle="#F984EF";
		ctx.fillRect(0, 0, this.width, this.height);
		ctx.restore();
	}
}

function setupCanvasContext() {
	var canvas = document.createElement("canvas");
	canvas.width = GAME_WIDTH;
	canvas.height = GAME_HEIGHT;
	canvas.style.border = "1px solid";
	document.body.appendChild(canvas);
	return canvas.getContext("2d");
}


var game = new Game(setupCanvasContext());

var lastTickAt = null;
function tick(timestamp) {
	if (!this.lastTickAt) {
		this.lastTickAt = timestamp;
	}
	var delta = timestamp - lastTickAt;
	lastTickAt = timestamp;
	game.tick(delta);
	requestAnimationFrame(tick)
}

requestAnimationFrame(tick);

