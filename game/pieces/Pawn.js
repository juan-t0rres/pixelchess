class Pawn extends Piece {
  constructor(white) {
    super(white ? white_pawn : black_pawn, white ? "white" : "black");
  }

  canCapture(currX, currY, newX, newY, board) {
    const dx = Math.abs(currX - newX);
    const dy = currY - newY;

    if (dx !== 1 || dy !== 1) return false;

    if (
      !board[newX][newY].piece ||
      board[newX][newY].piece.color === board[currX][currY].piece.color
    )
      return false;

    if (this.color === "white") {
      if (dy < 0) return false;
      if (dy > 1) return false;
    } else {
      if (dy > 0) return false;
      if (dy < -1) return false;
    }

    // move is valid
    return true;
  }

  isValidMove(currX, currY, newX, newY, board) {
    const dx = Math.abs(currX - newX);
    const dy = currY - newY;

    // invalid if pawn moves more than 1 square horizontal or no change in y
    if (dx > 1 || dy === 0) return false;

    // invalid if pawn moves diagonally but doesn't capture
    if (
      dx === 1 &&
      (!board[newX][newY].piece ||
        board[newX][newY].piece.color === board[currX][currY].piece.color)
    )
      return false;

    if (this.color === "white") {
      // can't go backwards
      if (dy < 0) return false;
      // can't go more than 2 spaces forwards
      if (dy > 2) return false;
      // can only go 2 spaces if you haven't moved pawn yet and you're not jumping over a piece
      if (dy === 2 && (currY !== 6 || board[newX][newY + 1].piece)) return false;
    } else {
      // same as above but for black
      if (dy > 0) return false;
      if (dy < -2) return false;
      if (dy === -2 && (currY !== 1 || board[newX][newY - 1].piece)) return false;
    }

    // can't capture without going diagonal
    if (board[newX][newY].piece && dx === 0) return false;

    // move is valid
    return true;
  }
}
