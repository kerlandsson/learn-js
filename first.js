var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var GAME_HEIGHT = 375;
var GAME_WIDTH = 500;

var keysDown = {};

var DIRECTION  = {
	EAST: "east",
	SOUTH: "south",
	WEST: "west",
	NORTH: "north"
}



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
		field.draw(ctx);
		paddle.draw(ctx);
		ball.draw(ctx);
	}

	var update = function(delta) {
		movePaddleIfKeyDown(delta);	
		moveBall(delta);
	}

	var moveBall = function(delta) {
		// TODO breaks of paddle moves over ball
		var newPosRect = newPositionForBall(delta);
		var allRects = field.bounds.slice(0);
		allRects.push(paddle.rect());
		var possibleCollisionRects = allRects.filter(function(x) { return intersects(x, newPosRect) });
		if (possibleCollisionRects.length > 0) {
			var speedVector = ball.getSpeedVector();
			var timesToCollisions = possibleCollisionRects.map(
					function(x) { return timeToCollision(ball.boundedRect(), speedVector, x) });
			timesToCollisions.sort(function(a, b) {return b.time - a.time; });
			var closestCollision = timesToCollisions.pop();
			ball.move(closestCollision.time);
			if (closestCollision.direction.isVertical()) {
				ball.changeSpeed(new Vector(speedVector.vx, -speedVector.vy));
			} else {
				ball.changeSpeed(new Vector(-speedVector.vx, speedVector.vy));
			}
		} else {
			ball.move(delta);
		}
	}

	var newPositionForBall = function(delta) {
		var simulationBall = ball.createSimulationBall();
		simulationBall.changeSpeed(ball.getSpeedVector());
		simulationBall.move(delta);
		return simulationBall.boundedRect();
	}

	var movePaddleIfKeyDown = function(delta) {
		paddleMovement = calculatePaddleMovement(delta);
		potentialNewPos = paddle.peekMove(paddleMovement);
		if (potentialNewPos.x < 0) {
			paddleMovement = -paddle.pos.x;
		}
		var paddleMaxX = field.width - paddle.rect().w;
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
	var RADIUS = 3;
	this.pos = startPos;
	this.vector = new Vector(0.2, -0.2);

	this.draw = function(ctx) {
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, RADIUS, 0, Math.PI*2);
		ctx.fill();
	}

	this.move = function(time) {
		this.pos = new Point(this.pos.x + this.vector.vx * time, this.pos.y + this.vector.vy * time);
	}

	this.changeSpeed = function(speedVector) {
		this.vector = speedVector; 
	}

	this.getSpeedVector = function() {
		return this.vector;
	}

	this.boundedRect = function() {
		return new Rectangle(this.pos.x - RADIUS, this.pos.y - RADIUS, 2*RADIUS, 2*RADIUS);
	}

	this.createSimulationBall = function() {
		var newBall = new Ball(this.pos);
		newBall.changeSpeed(this.getSpeedVector());
		return newBall;
	}
}

function Brick(pos, width, height) {
	this.pos = pos;
	this.width = width;
	this.height = height;
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
	
	Paddle.prototype.rect = function() {
		return new Rectangle(this.pos.x, this.pos.y, PADDLE_WIDTH, PADDLE_HEIGHT);
	}

}

function Point(x, y) {
	this.x = x;
	this.y = y;

	Point.prototype.toString = function() {
		return x + "," + y;
	}
}

function Field(width, height) {
	this.width = width;
	this.height = height;
	this.bounds = [];
	this.bounds.push(new Rectangle(-1000, -1000, 1000, height + 2000));
	this.bounds.push(new Rectangle(-1000, -1000, width + 2000, 1000));
	this.bounds.push(new Rectangle(width, -1000, 1000, height + 2000));
	this.bounds.push(new Rectangle(-1000, height, width + 2000, 1000));

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
	this.lastTickAt = timestamp;
	// If too much time has passed, start over to avoid queing up too much
	if (delta < 1000) {
		var minTick = 40;
		while (delta > minTick) {
			game.tick(minTick);
			delta = delta - minTick;
		}
		game.tick(delta);
	}
	requestAnimationFrame(tick)
}

requestAnimationFrame(tick);

