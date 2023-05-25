import {fabric} from "fabric"
import UAParser from "ua-parser-js"

var currentlyDragging = ""

// Check device type
var parser = new UAParser("user-agent")
var result = parser.getResult()
if (["mobile" || "console" || "smarttv" || "wearable"].includes(result.device.type)) {
    alert("Dieses Gerät wird nicht zur Verwendung dieser Webseite empfohlen. Wir empfehlen die Nutzung auf einem PC oder Tablet.")
}

fabric.Object.prototype.setControlsVisibility({mt: false, mb: false, ml: false, mr: false}) // Removes the control points at the side that let you distort the object

var canvas = new fabric.Canvas("canvas", {preserveObjectStacking: true}) 

function onResize() { // Made because the canvas size can't be changed in CSS
    var div = document.getElementById("leftDiv")
    canvas.setHeight(div.offsetHeight - 75) // Height of the left side - size of the buttons at the bottom
    canvas.setWidth(div.offsetWidth - 10)
    if (div.offsetWidth - 10 <= 800) { // If the width of the left side is smaller than the width of 6 buttons make space for 2 button rows
        canvas.setHeight(div.offsetHeight - 140)
    }
}
window.addEventListener("resize", onResize)
onResize() // For if window doesn't get resized at the beginning

function onDragDrop(e) { // Places an object when it gets dragged onto the canvas
    var position = canvas.getPointer(e.e)
    addObject(currentlyDragging, position.x, position.y)
}
canvas.on("drop", onDragDrop)

function dragging(name) { // Needed because the event in onDragDrop() doesn't return the dragged objects data
    currentlyDragging = name
}

function deleteObject() {
    canvas.remove(canvas.getActiveObject())
}

function deleteAllObjects() {
    canvas.getObjects().forEach(x => {
        canvas.remove(x)
    })
}

function download(dataurl, filename) {
    const link = document.createElement("a");
    link.href = dataurl;
    link.download = filename;
    link.click();
}

function downloadCanvas() {
    download(canvas.toDataURL({format: "png", quality: 1}), "bild.png")
}

function test() {
    alert("Test button currently does not have any tests")
}

function moveForward() {
    canvas.bringForward(canvas.getActiveObject())
}

function moveBackward() {
    canvas.sendBackwards(canvas.getActiveObject())
}

function addObject(name, x=100, y=100) {
    var img = new Image()
    img.src = `img/${name}.png`

    fabric.Image.fromURL(`img/${name}.png`, function(oImg) {
        oImg.set({"left": x, top: y})
        if (img.width / img.height <= 0.5) {
            oImg.scaleToHeight(100) // Make height 100 if y axis is longer
        } else {
            oImg.scaleToWidth(100) // Make width 100 if x axis is longer
        }
        canvas.add(oImg)
    })
}

// Make functions accessible in HTML
window.deleteObject = deleteObject
window.deleteAllObjects = deleteAllObjects
window.downloadCanvas = downloadCanvas
window.test = test
window.moveForward = moveForward
window.moveBackward = moveBackward
window.addObject = addObject
window.onDragDrop = onDragDrop
window.dragging = dragging