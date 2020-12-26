const express = require("express");
const app = express();

const http = require("http").Server(app);
const io = require("socket.io");
const socket = io(http);
const port = 8080;

const rooms = {};

const startBoard = [
  [
    "black Rook",
    "black Knight",
    "black Bishop",
    "black Queen",
    "black King",
    "black Bishop",
    "black Knight",
    "black Rook",
  ],
  [
    "black Pawn",
    "black Pawn",
    "black Pawn",
    "black Pawn",
    "black Pawn",
    "black Pawn",
    "black Pawn",
    "black Pawn",
  ],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [
    "white Pawn",
    "white Pawn",
    "white Pawn",
    "white Pawn",
    "white Pawn",
    "white Pawn",
    "white Pawn",
    "white Pawn",
  ],
  [
    "white Rook",
    "white Knight",
    "white Bishop",
    "white Queen",
    "white King",
    "white Bishop",
    "white Knight",
    "white Rook",
  ],
];

socket.on("connection", (socket) => {
  let room = socket.handshake.query.room;
  socket.on("login", (uid) => {
    if (!rooms[room]) {
      const roomObj = {
        players: {},
        board: startBoard.map((arr) => arr.slice()),
        turn: 0,
      };
      roomObj.players[uid] = "white";
      rooms[room] = roomObj;
    } else if (
      Object.keys(rooms[room].players).length < 2 &&
      !rooms[room].players[uid]
    ) {
      rooms[room].players[uid] = "black";
    }

    if (!rooms[room].players[uid]) {
      return;
    }

    console.log(uid + " connected to room " + room);
    socket.join(room);
    socket.emit("setup", {
      color: rooms[room].players[uid],
      board: rooms[room].board,
      turn: rooms[room].turn,
    });

    socket.on("disconnect", () => {
      // to do, check if everyone disconnected and delete room from memory
      console.log(uid + " disconnected");
    });
  });

  socket.on("move", (move) => {
    const { prevX, prevY, newX, newY, castle } = move;
    rooms[room].board[newY][newX] = rooms[room].board[prevY][prevX];
    rooms[room].board[prevY][prevX] = null;
    if (!castle) rooms[room].turn++;
    socket.to(room).emit("move", move);
  });

  socket.on("gameOver", () => {
    delete rooms[room];
  });
});

app.use("/", express.static("home"));

app.use("/:id", express.static("game"));

http.listen(port, () => {
  console.log("connected to port: " + port);
});
