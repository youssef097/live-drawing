
const paths = []
const pathNumber = 0;
const cursors = []
const painters = [];
let COLOR = ""



var socket = io();
var drawing = false;

for (let i = 0; i < 3; i++) {
    cursors[i] = new Image()
    cursors[i].src = "img/cursors/" + i + ".png"
    cursors[i].setAttribute("draggable", "false")
}



let c = document.getElementById("canvas")
let ctx = c.getContext("2d")
let color = document.getElementById("color-select")

ctx.imageSmoothingEnabled = true;

ctx.lineWidth = 2;
ctx.lineCap = "round"
ctx.lineJoin = "round"

c.width = 500
c.height = 500

color.addEventListener("change", (e) => {
    COLOR = color.value
})
const mouse = {
    x: null,
    y: null
}


const cursor = Math.floor(Math.random() * cursors.length)

document.addEventListener("mousedown", (e) => {
    socket.emit("start_drawing");
    drawing = true;
})


c.addEventListener("touchstart", (e) => {
    e.preventDefault()
    console.log(e);
    mouse.x = parseInt(e.changedTouches[0].clientX) - c.offsetLeft
    mouse.y = parseInt(e.changedTouches[0].clientY) - c.offsetTop
    socket.emit("start_drawing");
    drawing = true;
})


document.addEventListener("mouseup", (e) => {
    drawing = false;
    socket.emit("stop_drawing")
})


c.addEventListener("touchend", (e) => {
    e.preventDefault()
    console.log("touchend");
    drawing = false;
    socket.emit("stop_drawing")
})



c.addEventListener("mousemove", (e) => {
    mouse.x = e.offsetX;
    mouse.y = e.offsetY;

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

document.getElementById("changename").addEventListener("change",e=>{    
    socket.emit("set_name",{id:socket.id,name:e.target.value})
})
var userid = null;


let current = document.querySelector("#current")
let coords = document.querySelector("#coords")



function renderCursors(painters) {
    painters.forEach(e => {
        if(!document.getElementById(e.id)){
            console.log("Creating cursor for "+ e.id);
            let newImg = cursors[e.cursor].cloneNode()
            let newNode = document.createElement("div")            
            newNode.id = e.id
            newNode.style.zIndex = "9999"
            newNode.style.position = "absolute"
            newNode.appendChild(newImg)
            newNode.appendChild(document.createTextNode(e.name));            
            document.getElementById("container").appendChild(newNode)
        }
        let crs = document.getElementById(e.id)
        

      
        if (e.id == socket.id) {
            crs.style.left = mouse.x + c.offsetLeft - 8 + "px"
            crs.style.top = mouse.y + c.offsetTop - 8 + "px"
        } else {
            if(e.y != null &&  e.x != null){
                crs.style.left = e.x + c.offsetLeft - 8 + "px"
                crs.style.top = e.y + c.offsetTop - 8 + "px"                
            }
        }
    })
}

document.getElementById("width").addEventListener("change", (e) => {
    ctx.lineWidth = e.target.value
    document.getElementById("circle").style.width = e.target.value + "px"
    document.getElementById("circle").style.height = e.target.value + "px"
    ctx.lineCap = "round"
    ctx.lineJoin = "round"    
})



socket.on("stop_drawing", () => {
    ctx.closePath()
    console.log("Close Path");
})


socket.on("start_drawing", () => {
    ctx.beginPath()
    console.log("Begin path");
})

socket.on("clear", () => {
    ctx.clearRect(0, 0, c.width, c.height)
})

socket.on("draw_line", (coords) => {
    ctx.lineTo(coords.x1, coords.y1)
    ctx.moveTo(coords.x1, coords.y1)
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = coords.color;
    ctx.lineWidth = coords.width;
    ctx.stroke()
})





socket.on("update_cursors", (painters) => {
    
    // document.querySelector("pre").innerText = JSON.stringify(painters)
    renderCursors(painters)    
})


function mainLoop() {        
    if (drawing && mouse.x && mouse.y) {
        let [x1, y1] = [mouse.x, mouse.y]
        socket.emit("draw_line", { x1, y1, color: COLOR, width: ctx.lineWidth })
    }
    socket.emit("cursor_pos", { mouse })
    requestAnimationFrame(mainLoop)
}
mainLoop()



socket.on("usr_leave", (id) => {
    showAlert("User " + id + " has disconnected", "red")   
    document.getElementById("container").removeChild(document.getElementById(id)) 
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


socket.on("new_painter", (painter) => {        
    showAlert("User " + painter.name + " has connected")
})
