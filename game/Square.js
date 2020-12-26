class Square {
  constructor(x, y, piece) {
    this.x = x;
    this.y = y;
    this.size = SIZE / 8;
    this.piece = piece;
  }

  display(rotate, selected) {
    stroke(0);
    if (selected) {
      fill(235, 218, 91);
    } else {
      if (this.y % 2 == 0) {
        fill(this.x % 2 == 0 ? 255 : 150);
      } else {
        fill(this.x % 2 == 0 ? 150 : 255);
      }
    }

    if (rotate) {
      rect(
        (7 - this.x) * this.size,
        (7 - this.y) * this.size,
        this.size - 1,
        this.size - 1
      );
      if (this.piece) this.piece.display(7 - this.x, 7 - this.y);
    } else {
      rect(
        this.x * this.size,
        this.y * this.size,
        this.size - 1,
        this.size - 1
      );
      if (this.piece) this.piece.display(this.x, this.y);
    }
  }
}
