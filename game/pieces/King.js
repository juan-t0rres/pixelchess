class King extends Piece {
  constructor(white) {
    super(white ? white_king : black_king, white ? "white" : "black");
  }

  isValidMove(currX, currY, newX, newY, board) {
    const dx = Math.abs(currX - newX);
    const dy = Math.abs(currY - newY);
    if (dx === 0 && dy === 0) return false;
    if (dx > 1 || dy > 1) return false;
    if (
      board[newX][newY].piece &&
      board[newX][newY].piece.color === board[currX][currY].piece.color
    )
      return false;

    // move is valid
    return true;
  }
}
