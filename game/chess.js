const ENDPOINT = "/";
const room = window.location.pathname.replaceAll("/", "");
const socket = io.connect(ENDPOINT + "?room=" + room);

let uid = localStorage.getItem("chessUID");
if (!uid) {
  uid = Math.random().toString(36).substr(2, 9);
  localStorage.setItem("chessUID", uid);
}

const SIZE = 512;
let board = [];
let turn = 0;
let gameOver = false;
let color;

let selected = null;

let white_pawn, white_rook, white_knight, white_bishop, white_queen, white_king;
let black_pawn, black_rook, black_knight, black_bishop, black_queen, black_king;

const classes = { Pawn, Rook, Knight, Bishop, Queen, King };

socket.on("move", (move) => updateBoard(move));
socket.on("promotion", (promotion) => getPromotion(promotion))
socket.emit("login", uid);
socket.on("setup", (setupInfo) => {
  color = setupInfo.color;
  for (let i = 0; i < 8; i++) {
    const boardRow = [];
    for (let j = 0; j < 8; j++) {
      const square = setupInfo.board[j][i];
      if (square) {
        const split = square.split(" ");
        const pieceColor = split[0];
        const pieceName = split[1];
        const pieceClass = classes[pieceName];
        boardRow.push(new Square(i, j, new pieceClass(pieceColor === "white")));
      } else {
        boardRow.push(new Square(i, j, null));
      }
    }
    board.push(boardRow);
  }
  turn = setupInfo.turn;
  document.querySelector(".msg").innerHTML =
    turn % 2 === 0 ? "white's turn" : "black's turn";
});

function preload() {
  white_pawn = loadImage("assets/white_pawn.png");
  white_rook = loadImage("assets/white_rook.png");
  white_knight = loadImage("assets/white_knight.png");
  white_bishop = loadImage("assets/white_bishop.png");
  white_queen = loadImage("assets/white_queen.png");
  white_king = loadImage("assets/white_king.png");
  black_pawn = loadImage("assets/black_pawn.png");
  black_rook = loadImage("assets/black_rook.png");
  black_knight = loadImage("assets/black_knight.png");
  black_bishop = loadImage("assets/black_bishop.png");
  black_queen = loadImage("assets/black_queen.png");
  black_king = loadImage("assets/black_king.png");
}

function setup() {
  createCanvas(SIZE, SIZE);
}

function draw() {
  background(220);
  if (!color) return;

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      board[i][j].display(color === "black");
    }
  }

  if (selected) {
    board[selected.x][selected.y].display(color === "black", true);
  }
}

function updateBoard(move) {
  const { prevX, prevY, newX, newY, castle } = move;
  const c = board[prevX][prevY].piece.color;
  board[newX][newY].piece = board[prevX][prevY].piece;
  board[prevX][prevY].piece = null;
  if (!castle) turn++;
  document.querySelector(".msg").innerHTML =
    turn % 2 === 0 ? "white's turn" : "black's turn";
  checkGameOver(c === "white" ? "black" : "white");
}

function sendMove(prevX, prevY, newX, newY, castle) {
  document.querySelector(".msg").innerHTML =
    turn % 2 === 0 ? "white's turn" : "black's turn";
  socket.emit("move", { prevX, prevY, newX, newY, castle });
}

function getPromotion(promotion) {
  const { prevX, prevY, newX, newY, newPiece } = promotion;
  board[prevX][prevY].piece = null;
  const split = newPiece.split(" ");
  const pieceColor = split[0];
  const pieceName = split[1];
  const pieceClass = classes[pieceName];
  board[newX][newY].piece = new pieceClass(pieceColor === "white");
  turn++;
  document.querySelector(".msg").innerHTML =
    turn % 2 === 0 ? "white's turn" : "black's turn";
}

function sendPromotion(prevX, prevY, newX, newY, newPiece) {
  selected = null;
  document.querySelector(".msg").innerHTML =
    turn % 2 === 0 ? "white's turn" : "black's turn";
  socket.emit("promotion", { prevX, prevY, newX, newY, newPiece });
}

function mouseClicked(event) {
  if (event.target.className !== "p5Canvas") return;
  if (event.offsetX > SIZE || event.offsetY > SIZE) return;
  if (gameOver) return;

  if (color === "white" && turn % 2 !== 0) return;
  if (color === "black" && turn % 2 === 0) return;

  const n = SIZE / 8;
  let x = parseInt(event.offsetX / n);
  let y = parseInt(event.offsetY / n);

  if (color === "black") {
    x = 7 - x;
    y = 7 - y;
  }

  if (!selected) {
    if (board[x][y].piece && board[x][y].piece.color === color) {
      selected = { x, y };
    }
  } else {
    const selectedPiece = board[selected.x][selected.y].piece;
    const nextPiece = board[x][y].piece;

    // Check if player is trying to castle, then try castling
    if (
      selectedPiece.constructor.name === "King" &&
      nextPiece &&
      nextPiece.color === selectedPiece.color &&
      nextPiece.constructor.name === "Rook"
    ) {
      tryCastle(selected.x, selected.y, x, y);
      return;
    }

    // Check if player is trying to select another piece
    if (nextPiece && nextPiece.color === selectedPiece.color) {
      selected = { x, y };
      return;
    }

    if (selectedPiece.isValidMove(selected.x, selected.y, x, y, board)) {
      // before actually making the move make sure king can't get captured if move is made
      if (checkMoveKing(selected.x, selected.y, x, y)) {
        return;
      }
      const color = selectedPiece.color;

      // check for pawn promotion
      if (selectedPiece.constructor.name === "Pawn" && (y === 0 || y === 7)) {
        pawnPromotion(selected.x, selected.y, x, y);
        checkGameOver(color === "white" ? "black" : "white");
        return;
      }

      selectedPiece.makeMove(selected.x, selected.y, x, y);
      turn++;
      sendMove(selected.x, selected.y, x, y);
      // after making move check for checkmate / stalemate
      checkGameOver(color === "white" ? "black" : "white");
      selected = null;
    }
  }
}

// function that tries to castle
function tryCastle(kingX, kingY, rookX, rookY) {
  const king = board[kingX][kingY].piece;
  const rook = board[rookX][rookY].piece;
  if (king.hasMoved || rook.hasMoved) return;
  if (inDanger(kingX, kingY, board)) return;

  let currX = kingX;
  while (currX != rookX) {
    currX += currX < rookX ? 1 : -1;
    if (board[currX][kingY].piece && currX != rookX) {
      return;
    }
    if (
      inDanger(currX, kingY, board, king.color) &&
      currX != rookX &&
      currX != 1
    ) {
      return;
    }
  }

  // if we made it here then we can castle
  if (kingX < rookX) {
    king.makeMove(kingX, kingY, 6, kingY);
    rook.makeMove(rookX, rookY, 5, rookY);
    turn++;
    sendMove(kingX, kingY, 6, kingY);
    sendMove(rookX, rookY, 5, rookY, true);
  } else {
    king.makeMove(kingX, kingY, 2, kingY);
    rook.makeMove(rookX, rookY, 3, rookY);
    turn++;
    sendMove(kingX, kingY, 2, kingY);
    sendMove(rookX, rookY, 3, rookY, true);
  }
  selected = null;
}

function pawnPromotion(currX, currY, newX, newY) {
  const pieceColor = board[currX][currY].piece.color;
  board[newX][newY].piece = board[currX][currY].piece;
  board[currX][currY].piece = null;
  const promoteDiv = document.querySelector(".promote");
  promoteDiv.style.display = "";
  document.querySelector("#queen-btn").addEventListener("click", () => {
    board[newX][newY].piece = new Queen(pieceColor === "white");
    promoteDiv.style.display = "none";
    turn++;
    sendPromotion(currX, currY, newX, newY, pieceColor + " Queen");
  });
  document.querySelector("#knight-btn").addEventListener("click", () => {
    board[newX][newY].piece = new Knight(pieceColor === "white");
    promoteDiv.style.display = "none";
    turn++;
    sendPromotion(currX, currY, newX, newY, pieceColor + " Knight");
  });
  document.querySelector("#rook-btn").addEventListener("click", () => {
    board[newX][newY].piece = new Rook(pieceColor === "white");
    promoteDiv.style.display = "none";
    turn++;
    sendPromotion(currX, currY, newX, newY, pieceColor + " Rook");
  });
  document.querySelector("#bishop-btn").addEventListener("click", () => {
    board[newX][newY].piece = new Bishop(pieceColor === "white");
    promoteDiv.style.display = "none";
    turn++;
    sendPromotion(currX, currY, newX, newY, pieceColor + " Bishop");
  });
}

// checks if making this move will cause king to be in danger
function checkMoveKing(prevX, prevY, newX, newY) {
  const clone = [];
  for (const row of board) {
    const rowClone = [];
    for (const square of row) {
      const squareClone = Object.assign(
        Object.create(Object.getPrototypeOf(square)),
        square
      );
      if (square.piece)
        squareClone.piece = Object.assign(
          Object.create(Object.getPrototypeOf(square.piece)),
          square.piece
        );
      rowClone.push(squareClone);
    }
    clone.push(rowClone);
  }

  const color = clone[prevX][prevY].piece.color;
  clone[newX][newY].piece = clone[prevX][prevY].piece;
  clone[prevX][prevY].piece = null;
  const king = findKing(clone, color);
  return inDanger(king.x, king.y, clone);
}

// Checks if a square is in danger
function inDanger(x, y, board, castleColor) {
  for (const row of board) {
    for (const square of row) {
      if (
        !square.piece ||
        (board[x][y].piece && square.piece.color === board[x][y].piece.color)
      )
        continue;
      if (castleColor && square.piece.color === castleColor) continue;
      if (square.piece.constructor.name === "Pawn") {
        if (square.piece.canCapture(square.x, square.y, x, y, board)) {
          return true;
        }
        continue;
      }
      if (square.piece.isValidMove(square.x, square.y, x, y, board)) {
        return true;
      }
    }
  }
  return false;
}

// returns king of given color at given board
function findKing(board, color) {
  for (const row of board) {
    for (const square of row) {
      if (!square.piece || square.piece.color !== color) continue;
      if (square.piece.constructor.name === "King")
        return { x: square.x, y: square.y };
    }
  }
}

// checks for checkmate / stalemate
function checkGameOver(color) {
  for (const row of board) {
    for (const square of row) {
      if (!square.piece || square.piece.color !== color) continue;
      if (anyValidMoves(square)) {
        return;
      }
    }
  }

  // at this point we know it's checkmate or stalemate
  gameOver = true;

  socket.emit("gameOver");

  const king = findKing(board, color);
  let winner = null;
  if (inDanger(king.x, king.y, board)) {
    winner = color === "white" ? "black" : "white";
  }

  document.querySelector(".msg").innerHTML = winner
    ? winner + " won!"
    : "stalemate!";
}

function anyValidMoves(square) {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (square.piece.isValidMove(square.x, square.y, i, j, board)) {
        if (!checkMoveKing(square.x, square.y, i, j)) {
          return true;
        }
      }
    }
  }
  return false;
}
