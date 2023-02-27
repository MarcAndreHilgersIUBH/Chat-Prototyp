const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(__dirname + "/public"));
app.get("/", (req, res) => {

});

var users = {};

io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("new-connection", (data) => {
        console.log(`new-connection event received`, data);
        users[socket.id] = { username: data.username, roomname: data.roomname };
        console.log("users :>> ", users);
        socket.join(data.roomname);
        io.to(data.roomname).emit("room-entered", { roomname: data.roomname });
        socket.to(data.roomname).emit("chat-entered", {
            user: "server",
            message: `${data.username} ist dem Chat beigetreten`,
        });
    });

    // handles message posted by client
    socket.on("new-message", (data) => {
        console.log(`👾 new-message from ${data.user}`);
        // broadcast message to all sockets except the one that triggered the event
        socket.to(data.roomname).emit("broadcast-message", {
            user: users[socket.id],
            message: data.message,
        });
    });

    socket.on("disconnect", () => {
        if (users[socket.id] && users[socket.id]["roomname"] !== undefined){
            console.log("User disconnected " + users[socket.id]["roomname"]);
            socket.to(users[socket.id]["roomname"]).emit("chat-left", { user: users[socket.id],
            });
        }
        delete users[socket.id];
    });

});

server.listen(3000, () => {
    console.log("Listening on port 3000");
});



