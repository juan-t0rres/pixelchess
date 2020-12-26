class Rook extends Piece {
  constructor(white) {
    super(white ? white_rook : black_rook, white ? "white" : "black");
  }

  isValidMove(currX, currY, newX, newY, board) {
    const dx = Math.abs(currX - newX);
    const dy = Math.abs(currY - newY);
    // invalid if no change
    if (dx === 0 && dy === 0) return false;
    // invalid if change in both x and y
    if (dx > 0 && dy > 0) return false;

    let x = currX;
    while (x !== newX) {
      x = x < newX ? x + 1 : x - 1;
      if (board[x][currY].piece && x !== newX) return false;
    }

    let y = currY;
    while (y !== newY) {
      y = y < newY ? y + 1 : y - 1;
      if (board[currX][y].piece && y !== newY) return false;
    }

    if (
      board[newX][newY].piece &&
      board[newX][newY].piece.color === board[currX][currY].piece.color
    )
      return false;

    // move is valid
    return true;
  }
}
