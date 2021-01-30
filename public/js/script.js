
const paths = {}
const pathNumber = 0;
const cursors = []
const painters = [];
let COLOR = "#000000"
let WIDTH = 5



var socket = io();

var drawing = false;



for (let i = 0; i < 3; i++) {
    cursors[i] = new Image()
    cursors[i].src = "img/cursors/" + i + ".png"
    cursors[i].setAttribute("draggable", "false")
}

const cursor = Math.floor(Math.random() * cursors.length)
const picker = document.getElementById("picker")


let c = document.getElementById("canvas")
let ctx = c.getContext("2d")
let color = document.getElementById("color-select")
let container = document.getElementById("canvas-container")
let userList = document.getElementById("userList")
let myCursor = document.getElementById("circle").cloneNode(true)
c.width = 1280
c.height = 720
ctx.fillStyle= "#ff0000"
ctx.fillRect(0,0,c.width,c.height)
var imageData = ctx.getImageData(0,0,c.width,c.height);
// ctx.imageSmoothingEnabled = true;

ctx.lineCap = "round"
ctx.lineJoin = "round"


// ctx.fillStyle = "white"
// ctx.fillRect(0, 0, c.width, c.height)

const mouse = {
    tool: "PENCIL",
    x: null,
    y: null
}

ctx.fillStyle = COLOR
let cont = 0;
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
     ] : null;
  }

async function bfsFloodFill(startX, startY,color) {
    imageData =  ctx.getImageData(0,0,c.width,c.height)

    let prevC = getPixelData(startX, startY)
    let newColor = hexToRgb(color||COLOR)

    let q = [{x:startX,y:startY}] 
    console.log(prevC,newColor);
    ctx.fillStyle = newColor;

    // console.log(prevC,newColor);
    let d,u,r,l
    let x,y;

    
    
    while(q.length !=  0){
        let offset = (1280 * y + x) * 4

        unq =  q.pop()
              
        x = unq.x
        y = unq.y
        
        imageData.data[offset+0] = newColor[0]
        imageData.data[offset+1] = newColor[1]
        imageData.data[offset+2] = newColor[2]
        imageData.data[offset+3] = 255
        
        // RIGTH PIXEL
        r = getPixelData(x+1, y)
        if (validCoord(x + 1, y) && !colorsMatch(r, newColor) && colorsMatch(r, prevC)) {
            q.push({x:x+1,y})
            // ctx.fillRect(x,y,1,1)
        }

        // DOWN PIXEL
        d = getPixelData(x, y+1)
        if (validCoord(x, y+1) &&  !colorsMatch(d,newColor) && colorsMatch(d  ,prevC)) {
            q.push({x:x,y:y+1})
            // ctx.fillRect(x,y,1,1)
        }

        // UP PIXEL
        u = getPixelData(x, y-1)
        if (validCoord(x, y-1) &&  !colorsMatch(u,newColor) && colorsMatch(u  ,prevC)) {
            q.push({x:x,y:y-1})            
        }

        // LEFT PIXEL
        l  = getPixelData(x-1, y)
        if (validCoord(x -1, y) &&  !colorsMatch(l,newColor) && colorsMatch(l  ,prevC)) {
            q.push({x:x-1,y})
            
        }
        // console.log(r,d,u,l);
    }
    console.log(q.length) 
   await ctx.putImageData(imageData,0,0)    
}

function colorsMatch(a,b){
    return a[0] == b[0] && a[1] == b[1] && a[2] == b[2]
}

function validCoord(x, y) {
    return true
    // if (y > c.width || y <= 0 || x > c.height || x <= 0){
    //     // console.log(x,y,"notValid");
    //     return false;
    // }else{
    // }
}
function getPixelData(x,y){    
    let offset = (imageData.width * y + x) * 4
    let p = imageData.data     
    // console.log(rgbToHex(p[offset],p[offset+1],p[offset+2]));
    // document.body.style.backgroundColor = "#"+rgbToHex(p[offset],p[offset+1],p[offset+2])
    return [p[offset],p[offset+1],p[offset+2]]
}

function getPixelColor(x, y) {
    // imageData = ctx.getImageData(0,0,c.width,c.height)
    let pdata =ctx.getImageData(x,y,1,1)
    var hex = "#" + ("000000" + rgbToHex(pdata[0],pdata[1],pdata[2])).slice(-6);
    console.log(hex);
    return hex;
}

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}
socket.on("floodFill",(data)=>{
    console.log(data.color);
    bfsFloodFill(data.x,data.y,data.color)

})
container.addEventListener("mousedown", (e) => {
    console.log("heythere");
    socket.emit("start_drawing");
    ctx.beginPath()
    drawing = true;
    
    console.log(mouse.tool);
    if (mouse.tool == "COLOR-PICKER") {
        COLOR = getPixelColor(mouse.x,mouse.y)
        color.value = COLOR;
        picker.removeAttribute("disabled")
        mouse.tool = "PENCIL"
    }
})

container.addEventListener("touchstart", (e) => {
    e.preventDefault()
    console.log(e);
    mouse.x = parseInt(e.changedTouches[0].clientX) - c.offsetLeft
    mouse.y = parseInt(e.changedTouches[0].clientY) - c.offsetTop
    socket.emit("start_drawing");
    ctx.beginPath()
    drawing = true;
})

container.addEventListener("mouseup", (e) => {
    drawing = false;
    socket.emit("stop_drawing")
    ctx.closePath()
})
container.addEventListener("mouseleave", (e) => {
    drawing = false;
    socket.emit("stop_drawing")
    ctx.closePath()
})
container.addEventListener("mouseenter", (e) => {
    drawing = false;
    socket.emit("stop_drawing")
    ctx.closePath()
})

c.addEventListener("touchend", (e) => {
    e.preventDefault()
    console.log("touchend");
    drawing = false;
    ctx.closePath()
    socket.emit("stop_drawing")
})

myCursor.style.position = "absolute"
myCursor.style.cursor = "none"
container.appendChild(myCursor)

picker.addEventListener(("click"), e => {
    if (mouse.tool == "COLOR-PICKER") {
        e.target.setAttribute("disabled",false)
        mouse.tool = "PENCIL"
    } else {
        mouse.tool = "COLOR-PICKER"
    }

    e.target.setAttribute("disabled",true)
})
document.addEventListener("keypress", (e) => {
    if (e.key == " ") {
        bfsFloodFill(mouse.x,mouse.y)
        socket.emit("floodFill",{x:mouse.x,y:mouse.y,color:COLOR})
    }
    if (e.key == "q") {
        // imageData= ctx.getImageData(0,0,c.width,c.height)
        console.log(getPixelData(mouse.x,mouse.y));
        
        // bfsFloodFill(mouse.x,mouse.y,COLOR)
        // floodFill(mouse.x, mouse.y)
    }
})

c.addEventListener("mousemove", (e) => {
    mouse.x = e.offsetX;
    mouse.y = e.offsetY;
    myCursor.style.left = mouse.x + c.offsetLeft + "px"
    myCursor.style.top = mouse.y + c.offsetTop + "px"
    if (e.offsetX > c.width || e.offsetX < 0 ||
        e.offsetY > c.height || e.offsetY < 0) {
        mouse.x = null;
        mouse.y = null;
    }
})
c.addEventListener("touchmove", (e) => {
    e.preventDefault()

    mouse.x = parseInt(e.changedTouches[0].clientX) - c.offsetLeft
    mouse.y = parseInt(e.changedTouches[0].clientY) - c.offsetTop

    if (e.offsetX > c.width || e.offsetX < 0 ||
        e.offsetY > c.height || e.offsetY < 0) {
        mouse.x = null;
        mouse.y = null;
    }
})

document.getElementById("clear").addEventListener("click", () => {
    socket.emit("clear")
})

document.getElementById("changename").addEventListener("change", e => {
    socket.emit("set_name", { id: socket.id, name: e.target.value })
})
var userid = null;

socket.on("set_name", ({ id, name }) => {
    document.getElementById(id).lastChild.textContent = name
    document.getElementById("list-" + id).childNodes[1].textContent = name
})

let current = document.querySelector("#current")
let coords = document.querySelector("#coords")

document.getElementById("send-msg").addEventListener("submit", (e) => {
    e.preventDefault();
    let msg = document.getElementById("msg-input")
    // console.log("hello");
    document.getElementById("chat-list").innerHTML += `<div class="chat-message"><b>Tú:</b> ${msg.value} </div>`
    socket.emit("chat-msg", msg.value)
    msg.value = ""
})



socket.on("chat-msg", ({ msg, name }) => {
    console.log("message");
    document.getElementById("chat-list").innerHTML += `<div class="chat-message"><b>${name}:</b> ${msg} </div>`
})


function renderCursors(painters) {
    painters.forEach(e => {
        if (!document.getElementById(e.id) && e.id != socket.id) {
            console.log("Creating cursor for " + e.id);
            let newImg = cursors[e.cursor].cloneNode()
            let newNode = document.createElement("div")
            newNode.id = e.id
            newNode.style.zIndex = "9999"
            newNode.style.position = "absolute"
            newNode.appendChild(newImg)
            let span = document.createElement("span")
            span.textContent = e.name
            span.className = "user_name"
            newNode.appendChild(span);
            document.getElementById("container").appendChild(newNode)
            if (!document.getElementById(`list-${e.id}`)) {
                userList.innerHTML += `<span id="list-${e.id}"> <span>${e.name} </span> <span id="circle-${e.id}"></span></span>`
            }
        }



        let crs = document.getElementById(e.id)



        if (e.id != socket.id) {
            if (e.y != null && e.x != null) {
                crs.style.left = e.x + c.offsetLeft - 8 + "px"
                crs.style.top = e.y + c.offsetTop - 8 + "px"
            }
            // crs.style.left = mouse.x + c.offsetLeft - 8 + "px"
            // crs.style.top = mouse.y + c.offsetTop - 8 + "px"
        } else {
        }
    })
}

document.getElementById("width").addEventListener("change", (e) => {
    WIDTH = e.target.value
    // document.getElementById("circle").style.width = e.target.value + "px"
    document.getElementById("circle").style.height = e.target.value + "px"
    myCursor.style.width = e.target.value + "px"
    myCursor.style.height = e.target.value + "px"

})


color.addEventListener("change", (e) => {
    COLOR = color.value
    document.getElementById("circle").style.backgroundColor = COLOR;
    myCursor.style.backgroundColor = COLOR
})


socket.on("stop_drawing", () => {
    console.log("Close Path");
})


socket.on("start_drawing", (id) => {
    paths[id] = new Path2D()

})

socket.on("clear", () => {
    ctx.save()
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.restore()
})

socket.on("draw_line", ({ coords, id }) => {

    paths[id].lineTo(coords.x1, coords.y1)
    paths[id].moveTo(coords.x1, coords.y1)
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = coords.color;
    ctx.lineWidth = coords.width;
    ctx.stroke(paths[id])
})





socket.on("update_cursors", (painters) => {
    // document.querySelector("pre").innerText = JSON.stringify(painters)
    renderCursors(painters)
})


function mainLoop() {
    if (drawing && mouse.x && mouse.y) {
        let [x1, y1] = [mouse.x, mouse.y]

        ctx.lineTo(x1, y1)
        ctx.moveTo(x1, y1)
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.strokeStyle = COLOR;
        ctx.lineWidth = WIDTH;

        ctx.stroke()


        socket.emit("draw_line", { x1, y1, color: COLOR, width: WIDTH })

    }
    socket.emit("cursor_pos", { mouse })
    requestAnimationFrame(mainLoop)
}
mainLoop()



socket.on("usr_leave", (id) => {
    showAlert("User " + id + " has disconnected", "red")
    userList.removeChild(document.getElementById("list-" + id))
    document.getElementById("container").removeChild(document.getElementById(id))
    delete paths[id]
})
document.addEventListener("drop", (e) => {
    e.preventDefault()
    console.log(e);
})
socket.on("request_img", () => {
    let imageData = c.toDataURL()
    socket.emit("receive_imgData", (imageData))
    console.log("sending my data");
})

const alertBox = document.getElementById("alert-box")
function showAlert(msg, color) {
    let alert = document.createElement("div")
    alert.className = "alert"
    alert.innerHTML = msg
    if (color == "red") {
        alert.style.backgroundColor = "#f35a5abb"
    }
    alertBox.appendChild(alert)
    setTimeout(() => {
        alertBox.removeChild(alert)
    }, 4000);

}

socket.on("send_data", (data) => {
    let img = new Image();
    img.src = data;
    img.onload = () => {
        console.log("Loading...");
        ctx.drawImage(img, 0, 0)
    }

})
socket.on("new_painter", (painter) => {
    showAlert("User " + painter.name + " has connected")
})

window.onbeforeunload = () => {
    let imageData = c.toDataURL()
    socket.emit("receive_imgData", (imageData))

}