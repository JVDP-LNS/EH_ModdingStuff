//DECLARATIONS
const shipObject = {};
const submitButton = document.getElementById("buttonSubmit");

const canvasSizeUp = document.getElementById('canvasSizeUp');
const canvasSizeDown = document.getElementById('canvasSizeDown');
const canvasSizeInput = document.getElementById('canvasSizeInput');
const canvasDraw = document.getElementById('canvasDraw');
const canvasErase = document.getElementById('canvasErase');
const canvasZoomIn = document.getElementById('canvasZoomIn');
const canvasZoomOut = document.getElementById('canvasZoomOut');

const colorMap = [false, "#6060ffff", "#60ff60ff", "#60ffffff", "#ff6060ff", "#ffff60ff"]
const colorButtonsList = [];
colorButtonsList.push(document.getElementById("canvasErase"));
colorButtonsList.push(document.getElementById("canvasBlue"));
colorButtonsList.push(document.getElementById("canvasGreen"));
colorButtonsList.push(document.getElementById("canvasCyan"));
colorButtonsList.push(document.getElementById("canvasRed"));
colorButtonsList.push(document.getElementById("canvasYellow"));

const canvasBackground = document.getElementById('canvasBackground');
const canvas = document.getElementById('canvas');
const grid = document.getElementById('grid');
const canvasCtx = canvas.getContext('2d');
const gridCtx = grid.getContext('2d');
const canvasContainer = document.getElementById("canvasContainer");
let ch = canvas.height;
let gh = canvas.height;
let csh = canvas.clientHeight;  
let styleScale = csh / ch;
let drawIndex = 0;    //draw => erase cell so BG color is visible
let zoom  = 0;

let resizeHandler;

//FUNCTIONS
function selectColor(newInd) {
    colorButtonsList[drawIndex].classList.remove("colorButtonSelected");
    colorButtonsList[newInd].classList.add("colorButtonSelected");
    drawIndex = newInd;
    if(drawIndex > 0)
        canvasCtx.fillStyle = colorMap[drawIndex];
}
function offset(el) {
    var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}
function drawCell(x, y) {
    if(drawIndex === 0)
        canvasCtx.clearRect(Math.floor(x / styleScale), Math.floor(y / styleScale), 1, 1);
    else
        canvasCtx.fillRect(Math.floor(x / styleScale), Math.floor(y / styleScale), 1, 1);
}
function handleMouseDraw(e) {
    if(e.buttons !== 1)
        return;
    drawCell(e.offsetX, e.offsetY);
}
function handleTouchDraw(e) {
    if(e.targetTouches.length > 1)
        return;
    e.preventDefault();
    const touch = e.targetTouches[0];
    const px = touch.pageX;
    const py = touch.pageY;
    const os = offset(canvas);
    drawCell(px - os.left, py - os.top);
}
function drawGrid() {
    grid.height = csh;
    grid.width = csh;
    gridCtx.beginPath();
    gridCtx.strokeStyle = "black";
    gridCtx.lineWidth = 0.125 * (5 - zoom / 3);
    for(let i = 1; i < ch; i++) {
        gridCtx.moveTo(styleScale * i, 0);
        gridCtx.lineTo(styleScale * i, styleScale * ch);
    }
    for(let i = 1; i < ch; i++) {
        gridCtx.moveTo(0, styleScale * i);
        gridCtx.lineTo(styleScale * ch, styleScale * i);
    }
    gridCtx.stroke();
}
function setCanvasZoomLevel(zoomLevel) {
    //Grid resize bugs at zoomLevel 5
    if(zoomLevel === NaN || zoomLevel < -1 || zoomLevel > 4) 
        return;
    zoom = zoomLevel;
    const newZoomStyle = String(Math.pow(2, zoom) * 100) + "%";
    canvasBackground.style.height = newZoomStyle;
    canvasBackground.style.width = newZoomStyle;
    grid.style.height = newZoomStyle;
    grid.style.width = newZoomStyle;
    canvas.style.height = newZoomStyle;
    canvas.style.width = newZoomStyle;
    csh = canvas.clientHeight;
    styleScale = csh / ch;
    drawGrid();
}
function resizeGrid(newh) {
    if(newh === NaN || newh < 1 || newh > 1024) return;
    canvasSizeInput.value = newh;
    const diff = newh - ch;
    const tempData = canvasCtx.getImageData(0, 0, ch, ch);
    canvas.height += diff;
    canvas.width += diff;
    canvasCtx.putImageData(tempData, 0, 0);

    ch += diff;
    styleScale = csh / ch;
    drawGrid();
}
function generateLayoutString() {
    const imgData = canvasCtx.getImageData(0,0,ch,ch).data;
    let layoutString = "";
    for(let i = 0; i < ch; i++) {
        for(let j = 0; j < ch; j++) {
            const red = imgData[i * ch * 4 + j * 4 + 0];
            const green = imgData[i * ch * 4 + j * 4 + 1];
            const blue = imgData[i * ch * 4 + j * 4 + 2];
            const alpha = imgData[i * ch * 4 + j * 4 + 3];
            if(alpha < 128) layoutString += '0';
            else if(red > 128 && green > 128) layoutString += '5';
            else if(blue > 128 && green > 128) layoutString += '3';
            else if(blue > 128) layoutString += '1';
            else if(green > 128) layoutString += '2';
            else if(red > 128) layoutString += '4';
            else layoutString += '7';  //INVALID
        }
    }
    return layoutString;
}
function handleResize() {
    clearTimeout(resizeHandler);
    resizeHandler = setTimeout(() => {
        rect = canvas.getBoundingClientRect();
        csh = canvas.clientHeight;  
        styleScale = csh / ch;
    }, 100);
}
function generateJson() {
    let curVal = 1;
    shipObject["ItemType"] = curVal;
    if((curVal = document.getElementById("schemaId").value).length == 0 || Number(curVal) === NaN) {
        console.log("Id field is required");
        return;
    }
    shipObject["Id"] = Number(curVal);
    curVal = document.getElementById("schemaName").value;
    shipObject["Name"] = curVal;
    curVal = document.getElementById("schemaDescription").innerHTML;
    shipObject["Description"] = curVal;
    curVal = generateLayoutString();
    shipObject["Layout"] = curVal;
    jsonDisplay.innerHTML = JSON.stringify(shipObject, null, 4);
    navigator.clipboard.writeText(jsonDisplay.innerHTML);
}

drawGrid();
//ASSIGNMENT

grid.onmousemove = grid.onmousedown = handleMouseDraw;
grid.ontouchmove = handleTouchDraw;
window.onresize = handleResize;

canvasSizeUp.onclick = () => {resizeGrid(ch+1)};
canvasSizeDown.onclick = () => {resizeGrid(ch-1)};
canvasSizeInput.onchange = () => {resizeGrid(Number(canvasSizeInput.value))};
canvasZoomIn.onclick = () => {setCanvasZoomLevel(zoom + 1)};
canvasZoomOut.onclick = () => {setCanvasZoomLevel(zoom - 1)};
submitButton.onclick = generateJson;