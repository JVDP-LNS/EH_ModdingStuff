const canvas = document.getElementById('canvas');
const grid = document.getElementById('grid');
const canvasCtx = canvas.getContext('2d');
const gridCtx = grid.getContext('2d');

const styleScale = 50;

let cx = canvas.offsetLeft;
let cy = canvas.offsetTop;
let ch = canvas.height;
let gh = canvas.height;
let csh = ch * styleScale; 

function drawCell(x, y) {
    canvasCtx.fillRect(Math.floor(x * ch / csh), Math.floor(y * ch / csh), 1, 1);
}
function drawGrid() {
    gridCtx.beginPath();
    gridCtx.strokeStyle = "black";
    gridCtx.lineWidth = 0.25;
    for(let i = 1; i < ch; i++) {
        gridCtx.moveTo(styleScale * i, 0);
        gridCtx.lineTo(styleScale * i, styleScale * ch);
        console.log("yeah00");
    }
    for(let i = 1; i < ch; i++) {
        gridCtx.moveTo(0, styleScale * i);
        gridCtx.lineTo(styleScale * ch, styleScale * i);
        console.log("yeah00");
    }
    gridCtx.stroke();
    console.log("done");
}

canvas.style.height = String(csh) + "px";
grid.height = styleScale * ch;
grid.width = styleScale * ch;
canvasCtx.fillStyle = "white";
drawGrid();

grid.onmousemove = (e) => {
    if(e.buttons !== 1)
        return;
    drawCell(e.offsetX, e.offsetY);
}