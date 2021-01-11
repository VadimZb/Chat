const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 8000;

app.use("/static", express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

let connectionCounter = 0;
let users = [];
io.on("connection", (socket) => {
    io.emit("send blacklist", users);
    socket.on("name given", (username) => {
        connectionCounter++;
        users.push(username);
        io.emit("send blacklist", users);
        socket.broadcast.emit("user joined", username);
        io.emit("refresh online", connectionCounter);

        socket.on("disconnect", () => {
            users.splice(users.indexOf(username), 1);
            socket.broadcast.emit("user left", username);
            connectionCounter--;
            io.emit("refresh online", connectionCounter);
        });
    });

    socket.on("message sent", (username, text) => {
        socket.broadcast.emit("new message", username, text);
    });
});

http.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});
