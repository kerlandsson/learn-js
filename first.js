
function main() {
	console.log("Initialized!");
	var canvas = document.getElementById("gameCanvas");
	var ctx = canvas.getContext("2d");
	ctx.fillRect(0,0,100,200);
}


window.onload = main
