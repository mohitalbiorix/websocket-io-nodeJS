const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const path = require("path");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  var options = {
    root: path.join(__dirname),
  };
  var fileName = "index.html";
  res.sendFile(fileName, options);
});

var users = 0;

//connect socket (connection event)
io.on("connection", (socket) => {
  console.log("a user connected");
  users++;
  // send message to the all connected client including new users also
  // io.sockets.emit("brodacast", { message: users + "users connected!" });

  // send data to new  users
  socket.emit("newuserconnect", { message: "Hii Welcome Dear" });

  // send data only connected users
  socket.broadcast.emit("newuserconnect", {
    message: users + "Users Connected!",
  });

  // send custom message to the client (send event)
  setTimeout(() => {
    socket.send(
      "Sent message from server side by prereserved events (message)"
    );
  }, 1000);

  // create a custom event
  setTimeout(() => {
    socket.emit("myCustomEvent", {
      description: "A custom message from server side! (emit)",
    });
  }, 3000);

  // fetch data from client
  socket.on("customClientEvent", (data) => {
    console.log(data.description);
  });

  // disconnet socket (disconnet event)
  socket.on("disconnect", () => {
    users--;

    // send message to the all connected client including new users also
    /*    io.sockets.emit("brodacast", { message: users + "users connected!" }); */

    // send data only connected users
    socket.broadcast.emit("newuserconnect", {
      message: users + "Users Connected!",
    });
    console.log("a user disconnected");
  });
});

// custome namespace

var cnsp = io.of("/custom-namespace");

cnsp.on("connection", (socket) => {
  console.log("A user connected");

  cnsp.emit("customEvent", "Tester event call");

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

var roomNo = 1;
var full = 0;

// join rooms
io.on("connection", (socket) => {
  console.log("user connected");

  socket.join("room -" + roomNo);
  io.sockets
    .in("room -" + roomNo)
    .emit("connectedRoom", "You are connected to room no." + roomNo);
  full++;

  if (full >= 2) {
    full = 0;
    roomNo++;
  }

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(3000, () => {
  console.log("server ready on 3000");
});
