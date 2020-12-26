class Bishop extends Piece {
  constructor(white) {
    super(white ? white_bishop : black_bishop, white ? "white" : "black");
  }

  isValidMove(currX, currY, newX, newY, board) {
    const dx = Math.abs(currX - newX);
    const dy = Math.abs(currY - newY);

    if (dx !== dy || dx === 0) return false;

    let x = currX;
    let y = currY;
    while (x !== newX && y !== newY) {
      x = x < newX ? x + 1 : x - 1;
      y = y < newY ? y + 1 : y - 1;
      if (board[x][y].piece && x !== newX) return false;
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
