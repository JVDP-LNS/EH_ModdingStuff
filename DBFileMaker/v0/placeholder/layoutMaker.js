const canvas = document.getElementById('canvasLayout');
const canvasContext = canvas.getContext("2d");
let canh = canvas.height;
let cansh = parseInt(canvas.style.height);
let scaleStyle = canh / cansh;
const canvasX = canvas.offsetLeft;
const canvasY = canvas.offsetTop;
const canvasContainer = document.getElementById('canvasContainer');

canvasContext.fillStyle = "red";
function drawCell(ex, ey) {
    const x = Math.floor((ex) * scaleStyle);
    const y = Math.floor((ey) * scaleStyle);
    canvasContext.fillRect(x, y, 1, 1);
}
function handleMouseDraw(e) {
    if(e.buttons !== 1)
        return;
    dbgEle.innerHTML = String(e.offsetX) + ", " + String(e.offsetY);
    drawCell(e.offsetX, e.offsetY);
}
const dbgEle = document.getElementById('dbg');
function handleTouchDraw(e) {
    if(e.targetTouches.length > 1)
        return;
    e.preventDefault();
    const touch = e.targetTouches[0];
    const px = touch.pageX;
    const py = touch.pageY;
    dbgEle.innerHTML = String(Math.floor(px)) + ", " + String(Math.floor(py)) + " | " + canvasContainer.scrollLeft + ", " +canvasContainer.scrollTop ;
    drawCell(px + canvasContainer.scrollLeft - canvas.offsetLeft, py + canvasContainer.scrollTop - canvas.offsetTop);
}

canvas.addEventListener("mousemove", handleMouseDraw);
canvas.addEventListener("touchmove", handleTouchDraw);
test = document.getElementById("test");
test.textContent = (window.devicePixelRatio);
window.addEventListener('resize', () => {test.textContent = (window.devicePixelRatio)});
buttomSubmit = document.getElementById("buttonSubmit");
buttomSubmit.addEventListener("click", () => {
    let imgData = canvasContext.getImageData(0,0,canh,canh).data;
    console.log(imgData);
    opEle = document.getElementById("json");
    let opJson = "";
    for(let i = 0; i < canh; i++) {
        for(let j = 0; j < canh; j++) {
            let r = imgData[i * canh * 4 + j * 4];
            let g = imgData[i * canh * 4 + j * 4 + 1];
            let b = imgData[i * canh * 4 + j * 4 + 2];
            if(r && g) opJson += '5';
            else if(b && g) opJson += '3';
            else if(r) opJson += '4';
            else if(g) opJson += '2';
            else if(b) opJson += '1';
            else opJson += '0';
        }
        opJson += "<br>";
    }
    opEle.innerHTML = opJson;
    localStorage.setItem('compLayout', opJson)
});

function resizeGridHelper(diff) {
    canvas.height += diff;
    canh += diff;
    cansh += 100 * diff;
    canvas.width += diff;
    canvas.style.height = String(cansh) + "px";
}
function resizeGrid(newSize) {
    const diff = newSize - canh;
    if(canh > 0) {
        const tempData = canvasContext.getImageData(0, 0, canh, canh);
        resizeGridHelper(diff)
        canvasContext.putImageData(tempData, 0, 0);
    }
    else {
        resizeGridHelper(diff);
    }
}

document.getElementById('gridUp').onclick = () => {
    resizeGrid(canh+1);
    gridSizeInput.value = canh;
}
const gridSizeInput = document.getElementById('gridSize');
gridSizeInput.onchange = () => {
    resizeGrid(Math.max(gridSizeInput.value, 1));
    gridSizeInput.value = Math.max(gridSizeInput.value, 1);
}
document.getElementById('gridDown').onclick = () => {
    if(canh > 1)
        resizeGrid(canh-1);
    gridSizeInput.value = canh;
}

