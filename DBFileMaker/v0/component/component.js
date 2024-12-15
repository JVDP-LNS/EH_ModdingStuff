//DECLARATIONS
const componentObject = {};
const descriptionArea = document.getElementById("schemaDescription");
const iconColor = document.getElementById("schemaColor");
const iconAlpha = document.getElementById("schemaColorAlpha");
const cellType = document.getElementById("schemaCellType");
const cellTypeColorMap = {
    "0" : "#a0a0a0ff",
    "1" : "#6060ffff",
    "2" : "#60ff60ff",
    "3" : "#60ffffff",
    "4" : "#ff6060ff",
    "5" : "#ffff60ff",
};
const nextModificationSubmit = document.getElementById('schemaPossibleModificationsNextAdd');
const nextModificationInput = document.getElementById('schemaPossibleModificationsNextId');
const possibleModificationsList = document.getElementById('schemaPossibleModifications');
const possibleModificationsVarlist = new Set();    //stores the ID
const submitButton = document.getElementById("buttonSubmit");

const canvasSizeUp = document.getElementById('canvasSizeUp');
const canvasSizeDown = document.getElementById('canvasSizeDown');
const canvasSizeInput = document.getElementById('canvasSizeInput');
const canvasDraw = document.getElementById('canvasDraw');
const canvasErase = document.getElementById('canvasErase');
const canvasZoomIn = document.getElementById('canvasZoomIn');
const canvasZoomOut = document.getElementById('canvasZoomOut');

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
let draw = true;    //draw => erase cell so BG color is visible
let zoom  = 0;

const jsonDisplay = document.getElementById("jsonDisplay");
let resizeHandler;

//FUNCTIONS

function offset(el) {
    var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}
function drawCell(x, y) {
    if(draw === true)
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
    gridCtx.lineWidth = 0.25 * (5 - zoom);
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
    canvasCtx.fillStyle = "#202020ff";
    canvasCtx.fillRect(ch, 0, diff, newh);
    canvasCtx.fillRect(0, ch, newh, diff)

    ch += diff;
    styleScale = csh / ch;
    drawGrid();
}
function generateLayoutString() {
    const imgData = canvasCtx.getImageData(0,0,ch,ch).data;
    let opJson = "";
    for(let i = 0; i < ch; i++) {
        for(let j = 0; j < ch; j++) {
            const alpha = imgData[i * ch * 4 + j * 4 + 3];
            if(alpha < 128) opJson += '1';
            else opJson += '0';
        }
    }
    return opJson;
}
function handleResize() {
    clearTimeout(resizeHandler);
    resizeHandler = setTimeout(() => {
        rect = canvas.getBoundingClientRect();
        csh = canvas.clientHeight;  
        styleScale = csh / ch;
    }, 100);
}
function handleAlphaChange () {
    let alpha = iconAlpha.value;
    iconColor.style.opacity = alpha/255;
}
function handleCellTypeChange() {
    canvasBackground.style.backgroundColor = cellTypeColorMap[cellType.value];
}
function handleRemoveModification(id) {
    const ele = document.getElementById("possibleModificationId" + String(id));
    possibleModificationsVarlist.delete(id);
    ele.remove();
}
function handleNewModification() {
    const newId = Number(nextModificationInput.value)
    if(newId === NaN)
        return;
    if(possibleModificationsVarlist.has(newId))
        return;
    possibleModificationsVarlist.add(newId);
    const newEle1 = document.createElement("td");
    newEle1.innerHTML = String(newId);
    const newEle2 = document.createElement("td");
    const buttonRemove = document.createElement("button");
    buttonRemove.onclick = () => {handleRemoveModification(newId)};
    buttonRemove.innerHTML = "X";
    newEle2.appendChild(buttonRemove);
    const newEle = document.createElement("tr");
    newEle.setAttribute("id", "possibleModificationId" + String(newId));
    newEle.appendChild(newEle1);
    newEle.appendChild(newEle2);
    possibleModificationsList.insertAdjacentElement("beforebegin", newEle)
}
function generateJson() {
    let curVal = 1;
    componentObject["ItemType"] = curVal;
    if((curVal = document.getElementById("schemaId").value).length == 0 || Number(curVal) === NaN) {
        console.log("Id field is required");
        return;
    }
    componentObject["Id"] = Number(curVal);

    curVal = document.getElementById("schemaName").value;
    componentObject["Name"] = curVal;
    curVal = document.getElementById("schemaDescription").innerHTML;
    componentObject["Description"] = curVal;
    curVal = document.getElementById("schemaDisplayCategory").value;
    componentObject["DisplayCategory"] = Number(curVal);
    curVal = document.getElementById("schemaAvailability").value;
    componentObject["Availability"] = Number(curVal);

    if((curVal = document.getElementById("schemaComponentStatsId").value).length === 0 || Number(curVal) === NaN) {
        console.log("ComponentStatsId field is required");
        return;
    }
    componentObject["ComponentStatsId"] = Number(curVal);
    if((curVal = document.getElementById("schemaFaction").value).length === 0 || Number(curVal) === NaN) {
        console.log("Faction field is invalid");
        curval = 0;
    }
    componentObject["Faction"] = Number(curVal);
    if((curVal = document.getElementById("schemaLevel").value).length === 0 || Number(curVal) === NaN) {
        console.log("Level field is invalid");
        curval = 0;
    }
    componentObject["Level"] = Number(curVal);

    curVal = document.getElementById("schemaIcon").value;
    componentObject["Icon"] = curVal;

    curVal = document.getElementById("schemaColor").value;
    curVal += Number(iconAlpha.value).toString(16);
    componentObject["Color"] = curVal;

    componentObject["Layout"] = generateLayoutString();

    curVal = document.getElementById("schemaCellType").value;
    componentObject["CellType"] = Number(curVal);

    if((curVal = document.getElementById("schemaDeviceId").value).length !== 0 && Number(curVal) !== NaN) {
        componentObject["DeviceId"] = Number(curVal);
    }
    if((curVal = document.getElementById("schemaWeaponId").value).length !== 0 && Number(curVal) !== NaN) {
        componentObject["WeaponId"] = Number(curVal);
    }
    if((curVal = document.getElementById("schemaAmmunitionId").value).length !== 0 && Number(curVal) !== NaN) {
        componentObject["AmmunitionId"] = Number(curVal);
    }
    if((curVal = document.getElementById("schemaWeaponSlotType").value).length !== 0 && Number(curVal) !== NaN) {
        componentObject["WeaponSlotType"] = curVal;
    }
    if((curVal = document.getElementById("schemaDroneBayId").value).length !== 0 && Number(curVal) !== NaN) {
        componentObject["DroneBayId"] = Number(curVal);
    }
    if((curVal = document.getElementById("schemaDroneId").value).length !== 0 && Number(curVal) !== NaN) {
        componentObject["DroneId"] = Number(curVal);
    }

    compObjRes = {}
    ShipSizes = [];
    if(document.getElementById("schemeRestrictionsShipSizesUndefined").checked === true)
        ShipSizes.push(-1);
    if(document.getElementById("schemeRestrictionsShipSizesFrigate").checked === true)
        ShipSizes.push(0);
    if(document.getElementById("schemeRestrictionsShipSizesDestroyer").checked === true)
        ShipSizes.push(1);
    if(document.getElementById("schemeRestrictionsShipSizesCruiser").checked === true)
        ShipSizes.push(2);
    if(document.getElementById("schemeRestrictionsShipSizesBattleship").checked === true)
        ShipSizes.push(3);
    if(document.getElementById("schemeRestrictionsShipSizesTitan").checked === true)
        ShipSizes.push(4);
    if(document.getElementById("schemeRestrictionsShipSizesStarbase").checked === true)
        ShipSizes.push(5);
    if(ShipSizes.length > 0 && ShipSizes.length < 7)
        compObjRes["ShipSizes"] = ShipSizes;
    if(document.getElementById("schemaRestrictionsNotForOrganicShips").checked === true)
        compObjRes["NotForOrganicShips"] = true;
    if(document.getElementById("schemaRestrictionsNotForMechanicShips").checked === true)
        compObjRes["NotForMechanicShips"] = true;
    if((curVal = document.getElementById("schemaRestrictionsMaxComponentLimit").value).length !== 0 && Number(curVal) !== NaN && Number(curVal) > 0)
        compObjRes["MaxComponentLimit"] = Number(curVal);
    if((curVal = document.getElementById("schemaRestrictionsComponentGroupTag").value).length !== 0 && Number(curVal) !== NaN)
        compObjRes["ComponentGroupTag"] = Number(curVal);
    if((curVal = document.getElementById("schemaRestrictionsUniqueComponentTag").value).length > 0)
        compObjRes["UniqueComponentTag"] = curVal;
    if(Object.keys(compObjRes).length > 0)
        componentObject["Restrictions"] = compObjRes;
    if(possibleModificationsVarlist.size > 0)
        componentObject["PossibleModifications"] = Array.from(possibleModificationsVarlist);
    jsonDisplay.innerHTML = JSON.stringify(componentObject, null, 4);
    navigator.clipboard.writeText(jsonDisplay.innerHTML);
}

//ASSIGNMENT
canvasCtx.fillStyle = "#202020ff";
canvasCtx.fillRect(0, 0, ch, ch);
drawGrid();

grid.onmousemove = grid.onmousedown = handleMouseDraw;
grid.ontouchmove = handleTouchDraw;
window.onresize = handleResize;

iconAlpha.oninput = handleAlphaChange;
canvasSizeUp.onclick = () => {resizeGrid(ch+1)};
canvasSizeDown.onclick = () => {resizeGrid(ch-1)};
canvasSizeInput.onchange = () => {resizeGrid(Number(canvasSizeInput.value))};
canvasDraw.onclick = () => {
    draw = true;
    canvasDraw.style.backgroundColor = "slategray"; 
    canvasErase.style.backgroundColor = "darkslategray";
}
canvasErase.onclick = () => {
    draw = false;
    canvasErase.style.backgroundColor = "slategray"; 
    canvasDraw.style.backgroundColor = "darkslategray";
}
canvasZoomIn.onclick = () => {setCanvasZoomLevel(zoom + 1)};
canvasZoomOut.onclick = () => {setCanvasZoomLevel(zoom - 1)};
cellType.onchange = handleCellTypeChange;
nextModificationSubmit.onclick = handleNewModification;
submitButton.onclick = generateJson;