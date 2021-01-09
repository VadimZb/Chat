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
io.on("connection", (socket) => {
    let username = "";

    socket.on("name given", (username) => {
        username = username;
        connectionCounter++;
        socket.broadcast.emit("user joined", username);
        io.emit("refresh online", connectionCounter);

        socket.on("disconnect", () => {
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
