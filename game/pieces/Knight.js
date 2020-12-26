class Knight extends Piece {
  constructor(white) {
    super(white ? white_knight : black_knight, white ? "white" : "black");
  }

  isValidMove(currX, currY, newX, newY, board) {
    const dx = Math.abs(currX - newX);
    const dy = Math.abs(currY - newY);

    if ((dx !== 2 || dy !== 1) && (dx !== 1 || dy !== 2)) return false;

    if (
      board[newX][newY].piece &&
      board[newX][newY].piece.color === board[currX][currY].piece.color
    )
      return false;

    // move is valid
    return true;
  }
}
