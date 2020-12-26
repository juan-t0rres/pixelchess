class Piece {
    constructor(img, color) {
        this.img = img;
        this.color = color;
        this.size = SIZE / 8;
    }

    display(x, y) {
        noSmooth();
        image(this.img, x * this.size, y * this.size, this.size, this.size);
    }

    makeMove(currX, currY, newX, newY) {
        board[currX][currY].piece = null;
        board[newX][newY].piece = this;
        this.hasMoved = true;
        return true;
    }
}