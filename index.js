
const path = require("path")

const express = require("express");

const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http)

var painters = [];
var imageData = null;
var currentName = "no_name"
app.use(express.static(path.join(__dirname, "/public")))

app.get("*", (req, res) => {
    res.redirect("/index.html")
})


io.on("connection", (socket) => {
    let newPainter = new Painter(socket.id);
    painters.push(newPainter)

    io.to(painters[0].id).emit("request_img")

    socket.on("receive_imgData",async (data)=>{
         imageData = await data;
    })
    socket.emit("send_data",(imageData))

    io.emit("new_painter", newPainter)
    socket.on("draw_line", (coords) => {
        socket.broadcast.emit("draw_line", {coords,id:socket.id})
    })
    socket.on("stop_drawing", () => {
        socket.broadcast.emit("stop_drawing")
    })
    socket.on("start_drawing", () => {
        socket.broadcast.emit("start_drawing",(socket.id))
    })
    socket.on("clear", () => {
        io.emit("clear")
    })

    socket.on("chat-msg",(msg)=>{
        socket.broadcast.emit("chat-msg",{msg,name:currentName})
    })
    socket.on("set_name",({id,name})=>{        
        painters.forEach(e => {
            if (id == e.id) {
              currentName = name
              e.name = name
              socket.broadcast.emit("set_name",({id,name}))
            }            
        })
        console.log(painters);
    })
    socket.on("cursor_pos", ({mouse}) => {
        
        painters.forEach(e => {
            if (e.id == socket.id) {
                e.x = mouse.x;
                e.y = mouse.y
            }
        })
        io.emit("update_cursors", painters)
    })
    socket.on("floodFill", (data) => {              
        io.emit("floodFill", data)
    })

    socket.on("disconnect", () => {
        console.log(socket.id + " disconected ");
        painters = painters.filter(e => e.id != socket.id)
        io.emit("usr_leave", socket.id)
        console.log(painters);
    })
})



class Painter {
    constructor(id) {
        this.id = id;
        this.name = "no_name";
        this.x = 23;
        this.y = 23;
        this.cursor = Math.floor(Math.random() * 3)
    }
}





http.listen(process.env.PORT||3000, () => {
    console.log("Listenign on port 3000");
})