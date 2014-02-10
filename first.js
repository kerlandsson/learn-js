var KEY_LEFT = 37;
var KEY_RIGHT = 39;

var keysDown = {};


addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

function Game(ctx) {
	this.ctx = ctx;
	this.field = new Field(512, 300);
	this.paddle = new Paddle(new Point(0, 285));

	this.tick = function(delta) {
		this.update(delta);
		this.field.draw(this.ctx);
		this.paddle.draw(this.ctx);
	}

	this.update = function(delta) {
		var paddleMovement = 0;
		if (KEY_LEFT in keysDown) {
			paddleMovement -= (delta / 1000) * this.paddle.speed();	

		}
		if (KEY_RIGHT in keysDown) {
			paddleMovement += (delta / 1000) * this.paddle.speed();	
		}	
		this.paddle.move(new Point(this.paddle.pos.x + paddleMovement, this.paddle.pos.y));

	}
}


function Paddle(startPos) {
	var PADDLE_HEIGHT = 15;
	var PADDLE_WIDTH = 40;
	var PADDLE_SPEED = 200;
	this.pos = startPos;

	this.move = function (newPos) {
		this.pos = newPos;
	}

	this.draw = function(ctx) {
		ctx.fillRect(this.pos.x, this.pos.y, PADDLE_WIDTH, PADDLE_HEIGHT);
	}

	this.speed = function() {
		return PADDLE_SPEED;
	}

}

function Point(x, y) {
	this.x = x;
	this.y = y;
}

function Field(width, height) {
	this.width = width;
	this.height = height;

	this.draw = function(ctx) {
		ctx.save();
		ctx.fillStyle="#F984EF";
		ctx.fillRect(0, 0, this.width, this.height);
		ctx.restore();
	}
}

function setupCanvasContext() {
	var canvas = document.createElement("canvas");
	canvas.width = 512;
	canvas.height = 300;
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

