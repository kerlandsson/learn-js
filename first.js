
function Game(ctx) {
	this.ctx = ctx;

	this.tick = function() {
		this.ctx.fillRect(0,0,200,100);
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
var mainLoop = function() {
	game.tick();
}


setInterval(mainLoop, 100);
