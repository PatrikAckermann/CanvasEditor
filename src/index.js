import {fabric} from "fabric"
import UAParser from "ua-parser-js"

var currentlyDragging = ""
var categories = {}

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
    console.log(canvas.getActiveObject()._objects)
    var objects = canvas.getActiveObject()
    if (objects._objects !== undefined) {
        objects._objects.forEach(x => {
            canvas.remove(x)
        })
    } else {
        canvas.remove(canvas.getActiveObject())
    }
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

function test() {
    var div = document.getElementsByClassName("imgsDiv")[0]
    div.scrollTo({left: 0, behavior: "smooth"})
}

function loadImages(json) { // Takes each category and creates a div with all images from it in it.
    categories = []
    function addSidebarElement(category) {
        categories[category.name] = [category.imgs.length - 1, 0, category.imgs]

        var rootDiv = document.getElementById("objects")
        var div = document.createElement("div")
        div.setAttribute("class", "category")
        var title = document.createElement("h2")
        title.innerHTML = category.name
        div.appendChild(title)
        var imgsDiv = document.createElement("div")
        imgsDiv.setAttribute("class", "imgsDiv")
        imgsDiv.setAttribute("id", category.name)
        div.appendChild(imgsDiv)
        
        category.imgs.forEach(x => {
            var name = /[ \w-]+\./.exec(x.src)[0].replace(".", "")
            var image = document.createElement("img")
            image.setAttribute("class", "objectImg")
            image.setAttribute("id", name)
            image.setAttribute("onclick", `addObject('${name}')`)
            image.setAttribute("src", x.src)
            image.setAttribute("ondragstart", `dragging("${name}")`)
            
            var imgDiv = document.createElement("div")
            
            imgDiv.setAttribute("class", "imgContainer")
            imgDiv.appendChild(image)

            imgsDiv.appendChild(imgDiv)    
        })

        if (category.imgs.length > 1) { // Create scroll buttons only when there are 2 or more images
            var backButton = document.createElement("button")
            var forwardButton = document.createElement("button")
            backButton.setAttribute("onclick", `scrolllLeft('${category.name}')`)
            forwardButton.setAttribute("onclick", `scrollRight('${category.name}')`)
            backButton.setAttribute("class", `backButton scrollButton`)
            forwardButton.setAttribute("class", `forwardButton scrollButton`)
            backButton.innerHTML = "<"
            forwardButton.innerHTML = ">"
            imgsDiv.appendChild(backButton)
            imgsDiv.appendChild(forwardButton)
        }

        var imgTitle = document.createElement("p")
        imgTitle.setAttribute("class", "objectTitle")
        imgTitle.setAttribute("id", category.name + "Title")
        imgTitle.innerHTML = category.imgs[0].name

        imgsDiv.appendChild(imgTitle)
        
        rootDiv.append(div)
    }
    
    json.forEach(category => {
        addSidebarElement(category)
    })
    onResize()
    console.log(categories)
}

function scrolllLeft(categoryName) { // Scrolls the image carousel to the left. 3 Ls because it for some reason doesn't work with 2
    var div = document.getElementById(categoryName)
    if (categories[categoryName][1] <= 0) {
        categories[categoryName][1] = categories[categoryName][0]
    } else {
        categories[categoryName][1] = categories[categoryName][1] - 1
    }
    div.scrollTo({left: categories[categoryName][1] * 200, behavior: "smooth"})

    var text = document.getElementById(categoryName + "Title")
    text.innerHTML = categories[categoryName][2][categories[categoryName][1]].name
}

function scrollRight(categoryName) { // Scrolls the image carousel to the right.
    var div = document.getElementById(categoryName)
    if (categories[categoryName][1] >= categories[categoryName][0]) {
        categories[categoryName][1] = 0
    } else {
        categories[categoryName][1] = categories[categoryName][1] + 1
    }
    div.scrollTo({left: categories[categoryName][1] * 200, behavior: "smooth"})

    var text = document.getElementById(categoryName + "Title")
    text.innerHTML = categories[categoryName][2][categories[categoryName][1]].name
}

fetch("img/images.json").then(x => x.json()).then(x => loadImages(x)) // Loads the image json and then starts loadImages()

// Make functions accessible in HTML
window.deleteObject = deleteObject
window.deleteAllObjects = deleteAllObjects
window.downloadCanvas = downloadCanvas
window.moveForward = moveForward
window.moveBackward = moveBackward
window.addObject = addObject
window.onDragDrop = onDragDrop
window.dragging = dragging
window.test = test
window.scrollRight = scrollRight
window.scrolllLeft = scrolllLeft