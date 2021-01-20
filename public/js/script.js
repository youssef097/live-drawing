
const paths = {}
const pathNumber = 0;
const cursors = []
const painters = [];
let COLOR = "black"
let WIDTH = 1



var socket = io();

var drawing = false;

let currentPath =  null;

for (let i = 0; i < 3; i++) {
    cursors[i] = new Image()
    cursors[i].src = "img/cursors/" + i + ".png"
    cursors[i].setAttribute("draggable", "false")
}



let c = document.getElementById("canvas")
let ctx = c.getContext("2d")
let color = document.getElementById("color-select")
let container = document.getElementById("container")
let userList = document.getElementById("userList")

// ctx.imageSmoothingEnabled = true;

ctx.lineCap = "round"
ctx.lineJoin = "round"

c.width = 1280
c.height = 720


const mouse = {
    x: null,
    y: null
}


const cursor = Math.floor(Math.random() * cursors.length)

container.addEventListener("mousedown", (e) => {
    socket.emit("start_drawing");
    ctx.beginPath()
    drawing = true;
})
c.addEventListener("touchstart", (e) => {
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
c.addEventListener("touchend", (e) => {
    e.preventDefault()
    console.log("touchend");
    drawing = false;
    ctx.closePath()
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

socket.on("set_name",({id,name})=>{
    document.getElementById(id).lastChild.textContent = name
    document.getElementById("list-"+id).childNodes[1].textContent = name
})

let current = document.querySelector("#current")
let coords = document.querySelector("#coords")

document.getElementById("send-msg").addEventListener("submit",(e)=>{
    e.preventDefault();
    let msg = document.getElementById("msg-input")
    // console.log("hello");
    socket.emit("chat-msg",msg.value)            
    msg.value = ""
})
socket.on("chat-msg",({msg,name})=>{
    document.getElementById("chat-list").innerHTML+=`<div class="chat-message"><b>${name}:</b> ${msg} </div>`
    

})


function renderCursors(painters) {
    painters.forEach(e => {
        if(!document.getElementById(e.id) && e.id != socket.id){
            console.log("Creating cursor for "+ e.id);
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
            if(!document.getElementById(`list-${e.id}`)){
                userList.innerHTML += `<span id="list-${e.id}"> <span>${e.name} </span> <span id="circle-${e.id}"></span></span>`
            }
        }

        

        let crs = document.getElementById(e.id)
        

      
        if (e.id != socket.id) {
            if(e.y != null &&  e.x != null){
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
    document.getElementById("circle").style.width = e.target.value + "px"
    document.getElementById("circle").style.height = e.target.value + "px"
    // ctx.lineCap = "round"
    // ctx.lineJoin = "round"    
})
color.addEventListener("change", (e) => {
    COLOR = color.value
    document.getElementById("circle").style.backgroundColor = COLOR;    
})


socket.on("stop_drawing", () => {
    // currentPath.closePath()
    console.log("Close Path");
})


socket.on("start_drawing", (id) => {
    // if(currentPath)
    paths[id] = new Path2D()
    // currentPath = new Path2D();
    
    // console.log(currentPath);
    // currentPath.beginPath()
    console.log(id + " began path");
})

socket.on("clear", () => {
    ctx.clearRect(0, 0, c.width, c.height)
})

socket.on("draw_line", ({coords,id}) => {   
  
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
    userList.removeChild(document.getElementById("list-"+id)) 
    document.getElementById("container").removeChild(document.getElementById(id)) 
    delete paths[id]
})
document.addEventListener("drop",(e)=>{
    e.preventDefault()
    console.log(e);
})  
socket.on("request_img",()=>{
    let imageData = c.toDataURL()
    socket.emit("receive_imgData",(imageData))
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

socket.on("send_data",(data)=>{
    let img = new Image();
    img.src = data;
    img.onload = ()=>{
        console.log("Loading...");
        ctx.drawImage(img,0,0)
    }

})
socket.on("new_painter", (painter) => {               
    showAlert("User " + painter.name + " has connected")
})

window.onbeforeunload = ()=>{
    let imageData = c.toDataURL()
    socket.emit("receive_imgData",(imageData))

}