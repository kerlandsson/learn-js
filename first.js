// TODO
// * Refactor ball collision detection (put more collide logic in physics, make ball a square but render as circle)
// * Handle collisions between paddle and ball better (paddle moves over ball)
// * Move rendering code to separate function, not in the objects

var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var GAME_HEIGHT = 375;
var GAME_WIDTH = 500;

var keysDown = {};

var DIRECTION = {
	EAST : "east",
	SOUTH : "south",
	WEST : "west",
	NORTH : "north"
};

addEventListener("keydown", function(e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function(e) {
	delete keysDown[e.keyCode];
}, false);

function Game(ctx) {
	var field = new Field(GAME_WIDTH, GAME_HEIGHT);
	var paddle = new Paddle(new Point(0, GAME_HEIGHT - 8)); // FIXME
																// hardcoded
																// paddle height
																// :)
	var ball = new Ball(new Point(50, GAME_HEIGHT - 50));

	this.tick = function(delta) {
		update(delta);
		field.draw(ctx);
		paddle.draw(ctx);
		ball.draw(ctx);
	};

	var update = function(delta) {
		movePaddleIfKeyDown(delta);
		moveBall(delta);
	};

	var moveBall = function(delta) {
		// TODO breaks of paddle moves over ball
		var newPosRect = newPositionForBall(delta);
		var allRects = field.bounds.slice(0);
		allRects.push(paddle);
		allRects = allRects.concat(field.getLiveBricks());
		var possibleCollisionRects = allRects.filter(function(x) {
			return intersects(x.rect(), newPosRect);
		});
		if (possibleCollisionRects.length > 0) {
			var speedVector = ball.getSpeedVector();
			var timesToCollisions = possibleCollisionRects.map(function(x) {
				var ttc = timeToCollision(ball.rect(), speedVector, x.rect());
				ttc.obj = x;
				return ttc;
			});
			timesToCollisions.sort(function(a, b) {
				return b.time - a.time;
			});
			var closestCollision = timesToCollisions.pop();
			ball.move(closestCollision.time);
			collisionWith(closestCollision);
		} else {
			ball.move(delta);
		}
	};

	var collisionWith = function(collisionSpec) {
		var speedVector = ball.getSpeedVector();
		var collidedWith = collisionSpec.obj;
		if (collidedWith instanceof FieldEdge) {
			if (collidedWith.direction.equals(DIR.S)) {
				// TODO better game over handling :)
				throw "Game over";
			}
		}
		if (collidedWith instanceof Brick) {
			collidedWith.live = false;
		}
		if (collisionSpec.direction.isVertical()) {
			ball.changeSpeed(new Vector(speedVector.vx, -speedVector.vy));
		} else {
			ball.changeSpeed(new Vector(-speedVector.vx, speedVector.vy));
		}

	};

	var newPositionForBall = function(delta) {
		var simulationBall = ball.createSimulationBall();
		simulationBall.changeSpeed(ball.getSpeedVector());
		simulationBall.move(delta);
		return simulationBall.rect();
	};

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

	};

	var calculatePaddleMovement = function(delta) {
		var paddleMovement = 0;
		if (KEY_LEFT in keysDown) {
			paddleMovement -= (delta / 1000) * paddle.speed();

		}
		if (KEY_RIGHT in keysDown) {
			paddleMovement += (delta / 1000) * paddle.speed();
		}
		return paddleMovement;
	};
}

function Ball(startPos) {
	var RADIUS = 3;
	this.pos = startPos;
	this.vector = new Vector(0.2, -0.2);

	this.draw = function(ctx) {
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, RADIUS, 0, Math.PI * 2);
		ctx.fill();
	};

	this.move = function(time) {
		this.pos = new Point(this.pos.x + this.vector.vx * time, this.pos.y
				+ this.vector.vy * time);
	};

	this.changeSpeed = function(speedVector) {
		this.vector = speedVector;
	};

	this.getSpeedVector = function() {
		return this.vector;
	};

	this.rect = function() {
		return new Rectangle(this.pos.x - RADIUS, this.pos.y - RADIUS,
				2 * RADIUS, 2 * RADIUS);
	};

	this.createSimulationBall = function() {
		var newBall = new Ball(this.pos);
		newBall.changeSpeed(this.getSpeedVector());
		return newBall;
	};
}

function Brick(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.live = true;

	this.rect = function() {
		return new Rectangle(this.x, this.y, this.w, this.h);
	};
}

function Paddle(startPos) {
	var PADDLE_HEIGHT = 8;
	var PADDLE_WIDTH = 100;
	var PADDLE_SPEED = 400;
	this.pos = startPos;

	// Positive for right, negative for left. No bounds checking.
	Paddle.prototype.move = function(howFar) {
		this.pos = this.peekMove(howFar);
	};

	// Returns the point the paddle would move to if move was called with this
	// howFar value.
	Paddle.prototype.peekMove = function(howFar) {
		return new Point(this.pos.x + howFar, this.pos.y);
	};

	Paddle.prototype.draw = function(ctx) {
		ctx.fillRect(this.pos.x, this.pos.y, PADDLE_WIDTH, PADDLE_HEIGHT);
	};

	Paddle.prototype.speed = function() {
		return PADDLE_SPEED;
	};

	Paddle.prototype.rect = function() {
		return new Rectangle(this.pos.x, this.pos.y, PADDLE_WIDTH,
				PADDLE_HEIGHT);
	};

}

function Point(x, y) {
	this.x = x;
	this.y = y;

	Point.prototype.toString = function() {
		return x + "," + y;
	};
}

function Field(width, height) {
	this.width = width;
	this.height = height;
	this.bounds = [];
	this.bounds.push(new FieldEdge(DIR.N, new Rectangle(-1000, -1000, 1000,
			height + 2000)));
	this.bounds.push(new FieldEdge(DIR.W, new Rectangle(-1000, -1000,
			width + 2000, 1000)));
	this.bounds.push(new FieldEdge(DIR.E, new Rectangle(width, -1000, 1000,
			height + 2000)));
	this.bounds.push(new FieldEdge(DIR.S, new Rectangle(-1000, height,
			width + 2000, 1000)));

	this.bricks = [];
	var brickCols = 10;
	var brickRows = 5;
	var brickHeight = 15;
	var brickWidth = (width - 1) / brickCols;
	createBricks(this.bricks, brickCols, brickRows, brickHeight, brickWidth);

	this.getLiveBricks = function() {
		return this.bricks.filter(function(x) {
			return x.live;
		});
	};

	Field.prototype.draw = function(ctx) {
		ctx.save();
		ctx.fillStyle = "#F984EF";
		ctx.fillRect(0, 0, this.width, this.height);
		ctx.restore();
		for (var i = 0; i < this.bricks.length; i++) {
			var b = this.bricks[i];
			if (b.live) {
				ctx.fillRect(b.x, b.y, b.w, b.h);
			} else {
				ctx.save();
				ctx.fillStyle = "#F984EF";
				ctx.fillRect(b.x, b.y, b.w, b.h);
				ctx.restore();
			}
		}

	};
}

function createBricks(bricks, brickCols, brickRows, brickHeight, brickWidth) {
	for (var i = 0; i < brickCols; i++) {
		for (var j = 0; j < brickRows; j++) {
			bricks.push(new Brick(2 + i * brickWidth - 1, 2 + j
					* brickHeight - 1, brickWidth - 1, brickHeight - 1));
		}
	}
}

function FieldEdge(direction, rect) {
	this.r = rect;
	this.direction = direction;

	this.rect = function() {
		return this.r;
	};
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

var t = new Ticker(game.tick, function() { requestAnimationFrame(t.tick); });
requestAnimationFrame(t.tick);
