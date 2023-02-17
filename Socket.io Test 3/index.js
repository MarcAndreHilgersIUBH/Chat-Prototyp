"use strict"

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

/* TODO: Anpassung Import von socket.io auf unsere Variablennamen */
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(__dirname + "/public"));
//app.get("/", (req, res) => { });

var users = {};

io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("new-connection", (data) => {
        console.log(`new-connection event received`, data);
        users[socket.id] = data.username;
        console.log("users :>> ", users);
        socket.broadcast.emit("chat-entered", {
            user: "server",
            message: `${data.username} ist dem Chat beigetreten`,
        });
    });

    // handles message posted by client
    socket.on("new-message", (data) => {
        console.log(`new-message from ${data.user}`);
        // broadcast message to all sockets except the one that triggered the event
        socket.broadcast.emit("broadcast-message", {
            user: users[data.user],
            message: data.message,
        });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
        socket.broadcast.emit("chat-left", { user: users[socket.id],
        });
        delete users[socket.id];
    });


});

server.listen(3000, () => {
    console.log("Listening on port 3000");
});