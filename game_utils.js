function Ticker(tickFunc, ticksDoneCallback) {
	var lastTickAt = null;
	
	this.tick = function(timestamp) {
		if (!lastTickAt) {
			lastTickAt = timestamp;
		}
		var delta = timestamp - lastTickAt;
		lastTickAt = timestamp;
		// If too much time has passed, start over to avoid queuing up too much
		if (delta < 1000 && delta > 0) {
			doTicks(delta, tickFunc);
		}
		ticksDoneCallback();
	};
	
	function doTicks(delta, tickFunc) {
		var maxTick = 30;
		while (delta > maxTick) {
			tickFunc(maxTick);
			delta = delta - maxTick;
		}
		tickFunc(delta);
	}
	
}

function setupCanvasContext(canvasWidth, canvasHeight) {
	if (canvasWidth < 1 || canvasHeight < 1) {
		throw "Width and height must be more than 1";
	}
	var canvas = document.createElement("canvas");
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
	canvas.style.border = "1px solid";
	document.body.appendChild(canvas);
	return canvas.getContext("2d");
}