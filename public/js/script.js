var socket = io();

const paths = {}
const pathNumber = 0;
const cursors = []
const painters = [];
let COLOR = "#000000"
let WIDTH = 5

const actions = []



const cursor = Math.floor(Math.random() * cursors.length)
const picker = document.getElementById("picker")
const c = document.getElementById("canvas")
const ctx = c.getContext("2d")
const color = document.getElementById("color-select")
const container = document.getElementById("canvas-container")
const userList = document.getElementById("userList")
const alertBox = document.getElementById("alert-box")
const myCursor = document.getElementById("circle").cloneNode(true)



var drawing = false;

// Import assets
for (let i = 0; i < 3; i++) {
    cursors[i] = new Image()
    cursors[i].src = "/img/cursors/" + i + ".png"
    cursors[i].setAttribute("draggable", "false")
}


c.width = 800
c.height = 800

const translatePos = {
    x: c.width / 2,
    y: c.height / 2
}

var imageData = ctx.getImageData(0, 0, c.width, c.height);
// ctx.imageSmoothingEnabled = true;

ctx.lineCap = "round"
ctx.lineJoin = "round"

ctx.fillStyle = "white"
ctx.fillRect(0, 0, c.width, c.height)

myCursor.style.width = WIDTH + "px"
myCursor.style.height = WIDTH + "px"

const mouse = {
    tool: "PENCIL",
    x: null,
    y: null
}



async function bfsFloodFill(startX, startY, color) {
    imageData = ctx.getImageData(0, 0, c.width, c.height)

    let prevC = getPixelData(startX, startY, imageData)
    let newColor = hexToRgb(color || COLOR)

    let q = [{ x: startX, y: startY }]
    console.log(prevC, newColor);
    ctx.fillStyle = newColor;

    let d, u, r, l
    let x, y;



    while (q.length != 0) {
        let offset = (c.width * y + x) * 4

        unq = q.pop()

        x = unq.x
        y = unq.y

        imageData.data[offset + 0] = newColor[0]
        imageData.data[offset + 1] = newColor[1]
        imageData.data[offset + 2] = newColor[2]
        imageData.data[offset + 3] = 255

        // RIGTH PIXEL
        r = getPixelData(x + 1, y, imageData)
        if (validCoord(x + 1, y) && !colorsMatch(r, newColor) && colorsMatch(r, prevC)) {
            q.push({ x: x + 1, y })
        }

        // DOWN PIXEL
        d = getPixelData(x, y + 1, imageData)
        if (validCoord(x, y + 1) && !colorsMatch(d, newColor) && colorsMatch(d, prevC)) {
            q.push({ x: x, y: y + 1 })
        }

        // UP PIXEL
        u = getPixelData(x, y - 1, imageData)
        if (validCoord(x, y - 1) && !colorsMatch(u, newColor) && colorsMatch(u, prevC)) {
            q.push({ x: x, y: y - 1 })
        }

        // LEFT PIXEL
        l = getPixelData(x - 1, y, imageData)
        if (validCoord(x - 1, y) && !colorsMatch(l, newColor) && colorsMatch(l, prevC)) {
            q.push({ x: x - 1, y })
        }

    }
    await ctx.putImageData(imageData, 0, 0)
}

socket.on("floodFill", (data) => {
    console.log(data.color);
    bfsFloodFill(data.x, data.y, data.color)

})

myCursor.style.position = "absolute"
myCursor.style.cursor = "none"
container.appendChild(myCursor)

document.getElementById("tools").addEventListener(("click"), e => {
    console.log(e.target.id);
    imageData = ctx.getImageData(0, 0, c.width, c.height)
    switch (e.target.id) {
        case "picker":
            if (mouse.tool == "COLOR-PICKER") {
                e.target.setAttribute("disabled", false)
                mouse.tool = "PENCIL"
            } else {
                e.target.setAttribute("disabled", true)
                mouse.tool = "COLOR-PICKER"
            }
            break;
        case "floodfill":
            if (mouse.tool == "FLOOD-FILL") {
                e.target.setAttribute("disabled", false)
                mouse.tool = "PENCIL"
            } else {
                e.target.setAttribute("disabled", true)
                mouse.tool = "FLOOD-FILL"
            }
            break;
        case "undo":
            console.log(undo);
           paths[socket.id].pop()
           socket.emit("undo",{id:socket.id})
           redraw()
    }


    if (e.target.getAttribute("disabled")) {
        e.target.setAttribute("disabled", true)
    }
})



document.addEventListener("keypress", (e) => {
    console.log(e.target);
    if (e.key == " ") {
        bfsFloodFill(mouse.x, mouse.y)
        socket.emit("floodFill", { x: mouse.x, y: mouse.y, color: COLOR })
    }
    if (e.key == "+") {
        scale.x /= 0.2
        scale.y /= 0.2
       
    }
    if (e.key == "-") {
        scale.x *= 0.2
        scale.y *= 0.2
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




socket.on("set_name", ({ id, name }) => {
    document.getElementById(id).lastChild.textContent = name
    document.getElementById("list-" + id).childNodes[1].textContent = name
})



document.getElementById("send-msg").addEventListener("submit", (e) => {
    e.preventDefault();
    let msg = document.getElementById("msg-input")
    document.getElementById("chat-list").innerHTML += `<div class="chat-message"><b>Tú:</b> ${msg.value} </div>`
    socket.emit("chat-msg", msg.value)
    msg.value = ""
})



socket.on("chat-msg", ({ msg, name }) => {
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



        if (e.id != socket.id && e.y != null && e.x != null) {
            crs.style.left = e.x + c.offsetLeft - 8 + "px"
            crs.style.top = e.y + c.offsetTop - 8 + "px"

        }

    })
}

document.getElementById("width").addEventListener("input", (e) => {
    console.log(WIDTH);
    WIDTH = e.target.value
    document.getElementById("circle").style.height = WIDTH + "px"
    myCursor.style.width = e.target.value + "px"
    myCursor.style.height = e.target.value + "px"

})


color.addEventListener("input", (e) => {
    COLOR = color.value
    document.getElementById("circle").style.backgroundColor = COLOR;
    myCursor.style.backgroundColor = COLOR
})


socket.on("stop_drawing", () => {
    console.log("Close Path");
})


socket.on("start_drawing", ({id,color,width}) => {
    console.log(id,color,width);
    if (!paths[id]) {
        paths[id] = [{path:new Path2D(), color,width}]
    } else {
        paths[id].push({path:new Path2D(), color,width})
    }
    console.log(paths);
})

socket.on("clear", () => {
    ctx.save()
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.restore()
})

socket.on("draw_line", ({ coords, id }) => {

    let p = paths[id][paths[id].length - 1].path
    p.lineTo(coords.x1, coords.y1)
    p.moveTo(coords.x1, coords.y1)
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = coords.color;
    ctx.lineWidth = coords.width;
    ctx.stroke(p)
})

socket.on("update_cursors", (painters) => {
    renderCursors(painters)
})


function redraw() {
    ctx.clearRect(0,0,c.width,c.height)
    for (const usrID in paths) {
        paths[usrID].forEach(p => {
            ctx.save()
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.width;
            ctx.stroke(p.path)
            ctx.restore()
        })
    }
}

function mainLoop() {
    if (drawing && mouse.x && mouse.y) {
        let [x1, y1] = [mouse.x, mouse.y]
        let p = paths[socket.id][paths[socket.id].length - 1].path
        p.lineTo(x1, y1)
        p.moveTo(x1, y1)
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.strokeStyle = COLOR;
        ctx.lineWidth = WIDTH;

        ctx.stroke(p)


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


socket.on("undo",({id})=>{
    paths[id].pop()
    redraw()
})

socket.on("send_data", (data) => {
    let img = new Image();
    img.src = data;
    img.onload = () => {
        console.log("Loading...");
        ctx.drawImage(img, 0, 0)
    }

})
socket.on("new_painter", (painter) => {
    paths[socket.id] = []
    showAlert("User " + painter.name + " has connected")
})

window.onbeforeunload = () => {
    let imageData = c.toDataURL()
    socket.emit("receive_imgData", (imageData))

}
container.addEventListener("mousedown", async (e) => {

    switch (mouse.tool) {
        case "COLOR-PICKER":
            if (mouse.tool == "COLOR-PICKER") {
                drawing = false
                imageData = await ctx.getImageData(0, 0, c.width, c.height)
                let data = getPixelData(mouse.x, mouse.y, imageData)
                COLOR = "#" + rgbToHex(data[0], data[1], data[2])
                console.log("picked COlor", COLOR);
                color.value = COLOR;
                picker.removeAttribute("disabled")
                mouse.tool = "PENCIL"
            }
            break;
        case "PENCIL":
            paths[socket.id].push({color:COLOR,width:WIDTH, path:new Path2D})
            drawing = true;
            break;
        case "FLOOD-FILL":
            drawing = false;
            await bfsFloodFill(mouse.x, mouse.y, COLOR)
            socket.emit("floodFill", { x: mouse.x, y: mouse.y, color: COLOR })

            document.getElementById("floodfill").removeAttribute("disabled")
            break;
        default:
            drawing = true;
    }
    mouse.tool = "PENCIL"
    console.log("heythere");
    socket.emit("start_drawing",{color:COLOR,width:WIDTH});

    console.log(mouse.tool);

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