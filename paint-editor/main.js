const paintCanvas = document.getElementById("paintEditor");
const paintCanvasContext = paintCanvas.getContext("2d");

paintCanvasContext.lineWidth = 2;


var isDrawing = false;

var lastPositionX = 0;
var lastPositionY = 0;


function onMouseDown(event) {
	isDrawing = true;

	lastPositionX = event.clientX - paintCanvas.offsetLeft;
	lastPositionY = event.clientY - paintCanvas.offsetTop;
}

function onMouseUp() {
	isDrawing = false;
}

function onMouseMove(event) {
	if (!isDrawing) return;

	paintCanvasContext.beginPath();

	paintCanvasContext.lineTo(lastPositionX, lastPositionY);
	paintCanvasContext.lineTo(event.clientX - paintCanvas.offsetLeft, event.clientY - paintCanvas.offsetTop);

	paintCanvasContext.stroke();

	lastPositionX = event.clientX - paintCanvas.offsetLeft;
	lastPositionY = event.clientY - paintCanvas.offsetTop;
}


function onWindowResize() {
	paintCanvas.width = window.innerWidth;
	paintCanvas.height = window.innerHeight;
}

window.addEventListener("resize", onWindowResize);
onWindowResize();


paintCanvas.onmousedown = onMouseDown;
document.addEventListener("mouseup", onMouseUp);

paintCanvas.onmousemove = onMouseMove;
