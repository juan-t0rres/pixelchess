class Queen extends Piece {
  constructor(white) {
    super(white ? white_queen : black_queen, white ? "white" : "black");
  }

  isValidMove(currX, currY, newX, newY, board) {
    const dx = Math.abs(currX - newX);
    const dy = Math.abs(currY - newY);

    if (dx === 0 && dy === 0) return false;

    if (dx !== dy && dx !== 0 && dy !== 0) return false;

    let x = currX;
    let y = currY;
    if (dy === dx) {
      while (x !== newX && y !== newY) {
        x = x < newX ? x + 1 : x - 1;
        y = y < newY ? y + 1 : y - 1;
        if (board[x][y].piece && x !== newX) return false;
      }
    } else {
      while (x !== newX) {
        x = x < newX ? x + 1 : x - 1;
        if (board[x][currY].piece && x !== newX) return false;
      }
      while (y !== newY) {
        y = y < newY ? y + 1 : y - 1;
        if (board[currX][y].piece && y !== newY) return false;
      }
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
