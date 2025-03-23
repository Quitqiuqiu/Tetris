class Tetris {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        this.blockSize = 30;
        this.cols = this.canvas.width / this.blockSize;
        this.rows = this.canvas.height / this.blockSize;
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.currentPiece = null;
        this.nextPiece = null;
        this.dropInterval = 1000;
        this.lastDrop = 0;

        this.pieces = [
            [[1, 1, 1, 1]], // I
            [[1, 1, 1], [0, 1, 0]], // T
            [[1, 1, 1], [1, 0, 0]], // L
            [[1, 1, 1], [0, 0, 1]], // J
            [[1, 1], [1, 1]], // O
            [[1, 1, 0], [0, 1, 1]], // Z
            [[0, 1, 1], [1, 1, 0]] // S
        ];

        this.colors = [
            '#00f0f0', // cyan
            '#a000f0', // purple
            '#f0a000', // orange
            '#0000f0', // blue
            '#f0f000', // yellow
            '#f00000', // red
            '#00f000'  // green
        ];

        this.bindControls();
        this.init();
    }

    init() {
        this.generatePiece();
        this.update();
    }

    generatePiece() {
        if (!this.nextPiece) {
            const index = Math.floor(Math.random() * this.pieces.length);
            this.nextPiece = {
                shape: this.pieces[index],
                color: this.colors[index],
                x: Math.floor(this.cols / 2) - Math.floor(this.pieces[index][0].length / 2),
                y: 0
            };
        }

        this.currentPiece = this.nextPiece;
        const index = Math.floor(Math.random() * this.pieces.length);
        this.nextPiece = {
            shape: this.pieces[index],
            color: this.colors[index],
            x: Math.floor(this.cols / 2) - Math.floor(this.pieces[index][0].length / 2),
            y: 0
        };

        if (this.checkCollision()) {
            this.gameOver = true;
        }

        this.drawNextPiece();
    }

    drawNextPiece() {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * this.blockSize) / 2;
        const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * this.blockSize) / 2;

        this.nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.nextCtx.fillStyle = this.nextPiece.color;
                    this.nextCtx.fillRect(
                        offsetX + x * this.blockSize,
                        offsetY + y * this.blockSize,
                        this.blockSize - 1,
                        this.blockSize - 1
                    );
                }
            });
        });
    }

    bindControls() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;

            switch (e.key) {
                case 'ArrowLeft':
                    this.moveLeft();
                    break;
                case 'ArrowRight':
                    this.moveRight();
                    break;
                case 'ArrowDown':
                    this.moveDown();
                    break;
                case 'ArrowUp':
                    this.rotate();
                    break;
                case ' ':
                    this.hardDrop();
                    break;
            }
        });
    }

    checkCollision(piece = this.currentPiece) {
        return piece.shape.some((row, dy) => {
            return row.some((value, dx) => {
                if (!value) return false;
                const newX = piece.x + dx;
                const newY = piece.y + dy;
                return newX < 0 || newX >= this.cols ||
                       newY >= this.rows ||
                       (newY >= 0 && this.board[newY][newX]);
            });
        });
    }

    merge() {
        this.currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.board[y + this.currentPiece.y][x + this.currentPiece.x] = this.currentPiece.color;
                }
            });
        });
    }

    clearLines() {
        let linesCleared = 0;
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.cols).fill(0));
                linesCleared++;
                y++;
            }
        }

        if (linesCleared > 0) {
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.score / 1000) + 1;
            document.getElementById('score').textContent = this.score;
            document.getElementById('level').textContent = this.level;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
        }
    }

    moveLeft() {
        this.currentPiece.x--;
        if (this.checkCollision()) {
            this.currentPiece.x++;
        }
    }

    moveRight() {
        this.currentPiece.x++;
        if (this.checkCollision()) {
            this.currentPiece.x--;
        }
    }

    moveDown() {
        this.currentPiece.y++;
        if (this.checkCollision()) {
            this.currentPiece.y--;
            this.merge();
            this.clearLines();
            this.generatePiece();
        }
    }

    hardDrop() {
        while (!this.checkCollision()) {
            this.currentPiece.y++;
        }
        this.currentPiece.y--;
        this.merge();
        this.clearLines();
        this.generatePiece();
    }

    rotate() {
        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[row.length - 1 - i])
        );

        const previousShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;

        if (this.checkCollision()) {
            this.currentPiece.shape = previousShape;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw the board
        this.board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.ctx.fillStyle = value;
                    this.ctx.fillRect(
                        x * this.blockSize,
                        y * this.blockSize,
                        this.blockSize - 1,
                        this.blockSize - 1
                    );
                }
            });
        });

        // Draw the current piece
        if (this.currentPiece) {
            this.ctx.fillStyle = this.currentPiece.color;
            this.currentPiece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        this.ctx.fillRect(
                            (this.currentPiece.x + x) * this.blockSize,
                            (this.currentPiece.y + y) * this.blockSize,
                            this.blockSize - 1,
                            this.blockSize - 1
                        );
                    }
                });
            });
        }

        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('游戏结束', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    update(timestamp = 0) {
        const deltaTime = timestamp - this.lastDrop;

        if (deltaTime > this.dropInterval) {
            this.moveDown();
            this.lastDrop = timestamp;
        }

        this.draw();

        if (!this.gameOver) {
            requestAnimationFrame(this.update.bind(this));
        }
    }
}

// Start the game
const game = new Tetris();