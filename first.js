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

function PotentialCollision(cardinalDirection, distanceToCollision, entity) {
	this.cardinalDirection = cardinalDirection;
	this.distanceToCollision = distanceToCollision;
	this.entity = entity;

	PotentialCollision.prototype.toString = function() {
		return "direction=" + this.cardinalDirection + ", distance=" + this.distanceToCollision;
	}
}



function Ball(startPos) {
	var RADIUS = 3;
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
		var potentialCollisions = this.findEdgeCollisions(field);
		var candidates = potentialCollisions.filter(this.isCandidateCollision);
		candidates.sort(function(a,b) {return b.distanceToCollision - a.distanceToCollision});
		var closestCollision = candidates.pop();
		if (closestCollision && closestCollision.distanceToCollision < howFar) {
			this.collide(closestCollision);
			var remainingDistance = howFar - closestCollision.distanceToCollision;
			console.log("colliding: " + closestCollision + ", new dir: " + this.direction
					+ ", dist left: " + remainingDistance + ", pos after: " + this.pos);
			this.move(remainingDistance, field);
		} else {
			this.moveNoCollisionCheck(howFar);
		}
	}

	this.movingInCardinalDirection = function(d) {
		if (d === DIRECTION.NORTH) {
			return this.direction > Math.PI;
		}
		if (d === DIRECTION.SOUTH) {
			return this.direction < Math.PI;
		}
		if (d === DIRECTION.EAST) {
			return this.direction > 1.5 * Math.PI || this.direction < 0.5 * Math.PI;
		}
		if (d == DIRECTION.WEST) {
			return this.direction > 0.5 * Math.PI && this.direction < 1.5 * Math.PI;
		}
	}

	this.isCandidateCollision = function(pc) {
		return that.movingInCardinalDirection(pc.cardinalDirection);
	}


	this.findEdgeCollisions = function(field) {
		var potentialCollisions = []
		var d = this.ballEdge(DIRECTION.NORTH).y / Math.cos(this.angle(DIRECTION.NORTH));
		potentialCollisions.push(new PotentialCollision(DIRECTION.NORTH, d));
		d = -((field.height - this.ballEdge(DIRECTION.SOUTH).y) / Math.cos(this.angle(DIRECTION.SOUTH)));
		potentialCollisions.push(new PotentialCollision(DIRECTION.SOUTH, d));
		d = (field.width - this.ballEdge(DIRECTION.EAST).x) / Math.cos(this.angle(DIRECTION.EAST));
		potentialCollisions.push(new PotentialCollision(DIRECTION.EAST, d));
		d = -this.ballEdge(DIRECTION.WEST).x / Math.cos(this.angle(DIRECTION.WEST));
		potentialCollisions.push(new PotentialCollision(DIRECTION.WEST, d));
		return potentialCollisions;
	}


	/** Angle that a collision in a specific cardinal direction happens in */
	this.angle = function(cardinalDirection) {
		if (cardinalDirection === DIRECTION.EAST || cardinalDirection === DIRECTION.WEST) {
			var angle = Math.PI * 2 - this.direction;
			return angle;
		}
		return Math.PI * 1.5 - this.direction;
	}

	Ball.prototype.moveNoCollisionCheck = function(distance) {
		var xComponent = Math.cos(this.direction) * distance;
		var yComponent = Math.sin(this.direction) * distance;
		var newX = this.pos.x + xComponent;
		var newY = this.pos.y + yComponent;
		// Ensure the ball never goes outside the field and coords become negative (trig gets weird
		// if edge is on a negative point when it shouldn't)
		if (newX - RADIUS < 0) newX = RADIUS;
		if (newY - RADIUS < 0) newY = RADIUS;
		this.pos = new Point(newX, newY);

	}

	/** Moves the ball to the point of collision and changes direction accordingly */
	Ball.prototype.collide = function(potentialCollision) {
		function normalizeDirection() {
			if (that.direction > 2 * Math.PI) {
				that.direction -= 2 * Math.PI;
			}
			if (that.direction < 0) {
				that.direction += 2 * Math.PI;
			}
		}
		console.log("Moving distance to collision: " + potentialCollision.distanceToCollision);
		this.moveNoCollisionCheck(potentialCollision.distanceToCollision);
		this.direction = this.direction + 2 * this.angle(potentialCollision.cardinalDirection) - Math.PI;
		normalizeDirection();
	}

	Ball.prototype.speed = function() {
		return BALL_SPEED;
	}

	Ball.prototype.ballEdge = function(direction) {
		if (direction === DIRECTION.EAST)
			return new Point(this.pos.x + RADIUS, this.pos.y);
		if (direction === DIRECTION.WEST)
			return new Point(this.pos.x - RADIUS, this.pos.y);
		if (direction === DIRECTION.NORTH)
			return new Point(this.pos.x, this.pos.y - RADIUS);
		if (direction === DIRECTION.SOUTH)
			return new Point(this.pos.x, this.pos.y + RADIUS);
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

	Point.prototype.toString = function() {
		return x + "," + y;
	}
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

