import {fabric} from "fabric"
import UAParser from "ua-parser-js"

var currentlyDragging = ""
var categories = {}

// Check device type
function mobileCheck() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

if(mobileCheck()) {
    alert("Diese Webseite wurde für PCs und Tablets entwickelt. Sie könnte auf diesem Gerät möglicherweise nicht richtig funktionieren.")
}

fabric.Object.prototype.setControlsVisibility({mt: false, mb: false, ml: false, mr: false}) // Removes the control points at the side that let you distort the object

var canvas = new fabric.Canvas("canvas", {preserveObjectStacking: true}) 

function onResize() { // Made because the canvas size can't be changed in CSS
    var div = document.getElementById("leftDiv")
    canvas.setHeight(div.offsetHeight - 75) // Height of the left side - size of the buttons at the bottom
    canvas.setWidth(div.offsetWidth - 10)
    if (div.offsetWidth - 10 <= 654) { // If the width of the left side is smaller than the width of 6 buttons make space for 2 button rows
        canvas.setHeight(div.offsetHeight - 140)
    }
    if (div.offsetWidth - 10 <= 387) {
        canvas.setHeight(div.offsetHeight - 200)
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

function loadImages(json) { // Takes each category and creates a div with all images from it in it.
    categories = []
    function addSidebarElement(category) {
        categories[category.name] = [category.imgs.length - 1, 0, category.imgs]

        var rootDiv = document.getElementById("objects")
        var div = document.createElement("div")
        var flexDiv = document.createElement("div")
        flexDiv.setAttribute("class", "categoryFlexContainer")
        div.setAttribute("class", "category")
        var title = document.createElement("h2")
        title.innerHTML = category.name
        div.appendChild(title)
        var imgsDiv = document.createElement("div")
        imgsDiv.setAttribute("class", "imgsDiv")
        imgsDiv.setAttribute("id", category.name)
        div.appendChild(flexDiv)
        
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
            
            flexDiv.appendChild(backButton)
            flexDiv.appendChild(imgsDiv)
            flexDiv.appendChild(forwardButton)
        } else {flexDiv.appendChild(imgsDiv)}

        var imgTitle = document.createElement("p")
        imgTitle.setAttribute("class", "objectTitle")
        imgTitle.setAttribute("id", category.name + "Title")
        imgTitle.innerHTML = category.imgs[0].name

        div.appendChild(imgTitle)
        
        rootDiv.append(div)
    }
    
    json.forEach(category => {
        addSidebarElement(category)
    })
    onResize()
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
window.scrollRight = scrollRight
window.scrolllLeft = scrolllLeft