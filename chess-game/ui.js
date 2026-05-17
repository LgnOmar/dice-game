class ChessUI {
    constructor(game) {
        this.game = game;
        this.selectedSquare = null;
        this.legalMoves = [];
        this.lastMove = null;
        this.premove = null;
        this.isFlipped = false;
        this.isDragging = false;
        this.dragPiece = null;
        this.dragSource = null;
        this.boardElement = document.getElementById('chess-board');
        this.dragElement = document.getElementById('drag-piece');
        this.moveHistoryElement = document.getElementById('move-history');
        this.whiteTimerElement = document.getElementById('white-timer');
        this.blackTimerElement = document.getElementById('black-timer');
        this.capturedWhiteElement = document.getElementById('captured-white');
        this.capturedBlackElement = document.getElementById('captured-black');
        this.promotionModal = document.getElementById('promotion-modal');
        this.promotionOptions = document.getElementById('promotion-options');
        this.gameOverModal = document.getElementById('game-over-modal');
        this.whiteTime = 600;
        this.blackTime = 600;
        this.timerInterval = null;
        this.capturedPieces = { white: [], black: [] };
        this.pendingPromotion = null;
        
        this.pieceSVGs = {
            'white-pawn': `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03C15.41 27.09 11 31.58 11 39.5H34c0-7.92-4.41-12.41-7.41-13.47C28.06 24.84 29 23.03 29 21c0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"/></g></svg>`,
            'white-rook': `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" stroke-linecap="butt"/><path d="M34 14l-3 3H14l-3-3"/><path d="M31 17v12.5H14V17" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23" fill="none" stroke-linejoin="miter"/></g></svg>`,
            'white-knight': `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"/><path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z"/><path d="M14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z"/></g></svg>`,
            'white-bishop': `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#fff" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke-linejoin="miter"/></g></svg>`,
            'white-queen': `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM10.5 20a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM38.5 20a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-13.5V25l-7-11 2 12z" stroke-linecap="butt"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1.5 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" stroke-linecap="butt"/><path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none"/></g></svg>`,
            'white-king': `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#fff" stroke-linecap="butt"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill="#fff"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" fill="none"/></g></svg>`,
            'black-pawn': `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#000" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03C15.41 27.09 11 31.58 11 39.5H34c0-7.92-4.41-12.41-7.41-13.47C28.06 24.84 29 23.03 29 21c0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"/></g></svg>`,
            'black-rook': `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#000" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" stroke-linecap="butt"/><path d="M34 14l-3 3H14l-3-3"/><path d="M31 17v12.5H14V17" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23" fill="none" stroke-linejoin="miter"/></g></svg>`,
            'black-knight': `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#000" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"/><path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" fill="#fff"/><path d="M14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z" fill="#fff"/></g></svg>`,
            'black-bishop': `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#000" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#000" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke="#fff" stroke-linejoin="miter"/></g></svg>`,
            'black-queen': `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#000" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#000"><circle cx="6" cy="12" r="2.75"/><circle cx="14" cy="9" r="2.75"/><circle cx="22.5" cy="8" r="2.75"/><circle cx="31" cy="9" r="2.75"/><circle cx="39" cy="12" r="2.75"/></g><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-13.5V25l-7-11 2 12z" stroke-linecap="butt"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1.5 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" stroke-linecap="butt"/><path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none" stroke="#fff"/></g></svg>`,
            'black-king': `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#000" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter" stroke="#fff"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#000" stroke-linecap="butt"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill="#000"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" fill="none" stroke="#fff"/></g></svg>`
        };
        
        this.init();
    }

    init() {
        this.createBoard();
        this.createCoordinates();
        this.setupEventListeners();
        this.render();
    }

    createBoard() {
        this.boardElement.innerHTML = '';
        for (let displayRow = 0; displayRow < 8; displayRow++) {
            for (let displayCol = 0; displayCol < 8; displayCol++) {
                const square = document.createElement('div');
                const actualRow = this.isFlipped ? 7 - displayRow : displayRow;
                const actualCol = this.isFlipped ? 7 - displayCol : displayCol;
                
                square.className = `square ${(displayRow + displayCol) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = actualRow;
                square.dataset.col = actualCol;
                
                this.boardElement.appendChild(square);
            }
        }
    }

    createCoordinates() {
        const files = 'abcdefgh';
        const ranks = '87654321';
        
        const fileCoordsTop = document.querySelector('.file-coords-top');
        const fileCoordsBottom = document.querySelector('.file-coords-bottom');
        const rankCoordsLeft = document.querySelector('.rank-coords-left');
        const rankCoordsRight = document.querySelector('.rank-coords-right');
        
        fileCoordsTop.innerHTML = '';
        fileCoordsBottom.innerHTML = '';
        rankCoordsLeft.innerHTML = '';
        rankCoordsRight.innerHTML = '';
        
        for (let i = 0; i < 8; i++) {
            const file = this.isFlipped ? files[7 - i] : files[i];
            fileCoordsTop.innerHTML += `<span>${file}</span>`;
            fileCoordsBottom.innerHTML += `<span>${file}</span>`;
        }
        
        for (let i = 0; i < 8; i++) {
            const rank = this.isFlipped ? ranks[7 - i] : ranks[i];
            rankCoordsLeft.innerHTML += `<span>${rank}</span>`;
            rankCoordsRight.innerHTML += `<span>${rank}</span>`;
        }
    }

    setupEventListeners() {
        this.boardElement.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        this.boardElement.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
        document.getElementById('flip-btn').addEventListener('click', () => this.flipBoard());
        document.getElementById('undo-btn').addEventListener('click', () => this.undoMove());
        document.getElementById('resign-btn').addEventListener('click', () => this.resign());
        document.getElementById('draw-btn').addEventListener('click', () => this.offerDraw());
        document.getElementById('play-again-btn').addEventListener('click', () => this.newGame());
    }

    handleMouseDown(e) {
        if (this.game.gameOver) return;
        
        const square = e.target.closest('.square');
        if (!square) return;
        
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const piece = this.game.getPiece(row, col);
        
        if (piece && piece.color === this.game.turn) {
            e.preventDefault();
            this.isDragging = true;
            this.dragSource = { row, col };
            this.selectSquare(row, col);
            
            const pieceKey = `${piece.color}-${piece.type}`;
            this.dragElement.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(this.pieceSVGs[pieceKey])}")`;
            this.dragElement.classList.add('active');
            this.updateDragPosition(e.clientX, e.clientY);
            
            square.querySelector('.piece')?.classList.add('dragging');
        } else if (this.selectedSquare) {
            this.tryMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
        }
    }

    handleMouseMove(e) {
        if (this.isDragging) {
            e.preventDefault();
            this.updateDragPosition(e.clientX, e.clientY);
        }
    }

    handleMouseUp(e) {
        if (this.isDragging) {
            this.isDragging = false;
            this.dragElement.classList.remove('active');
            
            const square = document.elementFromPoint(e.clientX, e.clientY)?.closest('.square');
            if (square && this.dragSource) {
                const row = parseInt(square.dataset.row);
                const col = parseInt(square.dataset.col);
                this.tryMove(this.dragSource.row, this.dragSource.col, row, col);
            }
            
            this.dragSource = null;
        }
    }

    handleTouchStart(e) {
        if (this.game.gameOver) return;
        
        const touch = e.touches[0];
        const square = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.square');
        if (!square) return;
        
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const piece = this.game.getPiece(row, col);
        
        if (piece && piece.color === this.game.turn) {
            e.preventDefault();
            this.isDragging = true;
            this.dragSource = { row, col };
            this.selectSquare(row, col);
            
            const pieceKey = `${piece.color}-${piece.type}`;
            this.dragElement.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(this.pieceSVGs[pieceKey])}")`;
            this.dragElement.classList.add('active');
            this.updateDragPosition(touch.clientX, touch.clientY);
            
            square.querySelector('.piece')?.classList.add('dragging');
        }
    }

    handleTouchMove(e) {
        if (this.isDragging) {
            e.preventDefault();
            const touch = e.touches[0];
            this.updateDragPosition(touch.clientX, touch.clientY);
        }
    }

    handleTouchEnd(e) {
        if (this.isDragging) {
            this.isDragging = false;
            this.dragElement.classList.remove('active');
            
            const touch = e.changedTouches[0];
            const square = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.square');
            if (square && this.dragSource) {
                const row = parseInt(square.dataset.row);
                const col = parseInt(square.dataset.col);
                this.tryMove(this.dragSource.row, this.dragSource.col, row, col);
            }
            this.dragSource = null;
        }
    }

    updateDragPosition(x, y) {
        this.dragElement.style.left = `${x}px`;
        this.dragElement.style.top = `${y}px`;
    }

    selectSquare(row, col) {
        this.selectedSquare = { row, col };
        this.legalMoves = this.game.getLegalMoves(row, col);
        this.render();
    }

    clearSelection() {
        this.selectedSquare = null;
        this.legalMoves = [];
        this.render();
    }

    tryMove(fromRow, fromCol, toRow, toCol) {
        if (this.game.gameOver) return;
        
        const isLegalMove = this.legalMoves.some(m => m.row === toRow && m.col === toCol);
        if (!isLegalMove) {
            const piece = this.game.getPiece(toRow, toCol);
            if (piece && piece.color === this.game.turn) {
                this.selectSquare(toRow, toCol);
            } else {
                this.clearSelection();
            }
            return;
        }
        
        const result = this.game.makeMove(fromRow, fromCol, toRow, toCol);
        
        if (result?.needsPromotion) {
            this.pendingPromotion = result;
            this.showPromotionDialog(this.game.turn);
            this.clearSelection();
            return;
        }
        
        if (result) {
            this.animateMove(result, () => {
                this.lastMove = result;
                this.clearPremove();
                this.clearSelection();
                this.updateCapturedPieces(result);
                this.updateMoveHistory();
                this.render();
                this.startTimer();
                
                if (this.game.gameOver) {
                    this.showGameOver();
                } else if (this.premove) {
                    this.executePremove();
                }
            });
        }
    }

    animateMove(move, callback) {
        const fromSquare = this.getSquareElement(move.from.row, move.from.col);
        const toSquare = this.getSquareElement(move.to.row, move.to.col);
        
        if (!fromSquare || !toSquare) {
            callback();
            return;
        }
        
        const pieceEl = fromSquare.querySelector('.piece');
        if (!pieceEl) {
            callback();
            return;
        }
        
        const fromRect = fromSquare.getBoundingClientRect();
        const toRect = toSquare.getBoundingClientRect();
        const deltaX = toRect.left - fromRect.left;
        const deltaY = toRect.top - fromRect.top;
        
        pieceEl.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        pieceEl.classList.add('animating');
        pieceEl.style.zIndex = '100';
        
        setTimeout(() => {
            pieceEl.classList.remove('animating');
            pieceEl.style.transform = '';
            pieceEl.style.zIndex = '';
            callback();
        }, 200);
    }

    getSquareElement(row, col) {
        return this.boardElement.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
    }

    showPromotionDialog(color) {
        this.promotionOptions.innerHTML = '';
        const pieces = ['queen', 'rook', 'bishop', 'knight'];
        
        for (const pieceType of pieces) {
            const button = document.createElement('button');
            button.className = 'promotion-option';
            button.innerHTML = `<div class="piece" style="background-image: url('data:image/svg+xml,${encodeURIComponent(this.pieceSVGs[`${color}-${pieceType}`])}')"></div>`;
            button.addEventListener('click', () => this.completePromotion(pieceType));
            this.promotionOptions.appendChild(button);
        }
        
        this.promotionModal.classList.add('active');
    }

    completePromotion(pieceType) {
        if (!this.pendingPromotion) return;
        
        const { moveData, fromRow, fromCol, toRow, toCol } = this.pendingPromotion;
        const result = this.game.makeMove(fromRow, fromCol, toRow, toCol, pieceType);
        
        this.promotionModal.classList.remove('active');
        this.pendingPromotion = null;
        
        if (result) {
            this.lastMove = result;
            this.updateCapturedPieces(result);
            this.updateMoveHistory();
            this.render();
            this.startTimer();
            
            if (this.game.gameOver) {
                this.showGameOver();
            }
        }
    }

    updateCapturedPieces(move) {
        if (move.captured) {
            const capturedColor = move.captured.color;
            this.capturedPieces[capturedColor].push(move.captured.type);
        }
        this.renderCapturedPieces();
    }

    renderCapturedPieces() {
        const pieceValues = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9 };
        
        const sortPieces = (pieces) => {
            return [...pieces].sort((a, b) => pieceValues[b] - pieceValues[a]);
        };
        
        this.capturedWhiteElement.innerHTML = sortPieces(this.capturedPieces.white)
            .map(type => `<div class="captured-piece" style="background-image: url('data:image/svg+xml,${encodeURIComponent(this.pieceSVGs[`white-${type}`])}')"></div>`)
            .join('');
            
        this.capturedBlackElement.innerHTML = sortPieces(this.capturedPieces.black)
            .map(type => `<div class="captured-piece" style="background-image: url('data:image/svg+xml,${encodeURIComponent(this.pieceSVGs[`black-${type}`])}')"></div>`)
            .join('');
    }

    updateMoveHistory() {
        this.moveHistoryElement.innerHTML = '';
        const moves = this.game.moveHistory;
        
        for (let i = 0; i < moves.length; i += 2) {
            const moveNumber = Math.floor(i / 2) + 1;
            const whiteMove = moves[i];
            const blackMove = moves[i + 1];
            
            const row = document.createElement('div');
            row.className = 'move-row';
            
            const numberSpan = document.createElement('span');
            numberSpan.className = 'move-number';
            numberSpan.textContent = moveNumber;
            row.appendChild(numberSpan);
            
            const whiteMoveEl = document.createElement('span');
            whiteMoveEl.className = 'move' + (i === moves.length - 1 ? ' last' : '');
            whiteMoveEl.textContent = this.game.getMoveNotation(whiteMove);
            row.appendChild(whiteMoveEl);
            
            if (blackMove) {
                const blackMoveEl = document.createElement('span');
                blackMoveEl.className = 'move' + (i + 1 === moves.length - 1 ? ' last' : '');
                blackMoveEl.textContent = this.game.getMoveNotation(blackMove);
                row.appendChild(blackMoveEl);
            }
            
            this.moveHistoryElement.appendChild(row);
        }
        
        this.moveHistoryElement.scrollTop = this.moveHistoryElement.scrollHeight;
    }

    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.whiteTimerElement.classList.toggle('active', this.game.turn === 'white');
        this.blackTimerElement.classList.toggle('active', this.game.turn === 'black');
        
        this.timerInterval = setInterval(() => {
            if (this.game.gameOver) {
                clearInterval(this.timerInterval);
                return;
            }
            
            if (this.game.turn === 'white') {
                this.whiteTime--;
                if (this.whiteTime <= 0) {
                    this.whiteTime = 0;
                    this.game.gameOver = true;
                    this.game.result = 'black';
                    this.game.resultReason = 'timeout';
                    this.showGameOver();
                    clearInterval(this.timerInterval);
                }
            } else {
                this.blackTime--;
                if (this.blackTime <= 0) {
                    this.blackTime = 0;
                    this.game.gameOver = true;
                    this.game.result = 'white';
                    this.game.resultReason = 'timeout';
                    this.showGameOver();
                    clearInterval(this.timerInterval);
                }
            }
            
            this.updateTimerDisplay();
        }, 1000);
    }

    updateTimerDisplay() {
        this.whiteTimerElement.textContent = this.formatTime(this.whiteTime);
        this.blackTimerElement.textContent = this.formatTime(this.blackTime);
        
        this.whiteTimerElement.classList.toggle('low-time', this.whiteTime < 30);
        this.blackTimerElement.classList.toggle('low-time', this.blackTime < 30);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    setPremove(fromRow, fromCol, toRow, toCol) {
        this.premove = { from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } };
        this.render();
    }

    clearPremove() {
        this.premove = null;
        this.render();
    }

    executePremove() {
        if (!this.premove) return;
        
        const { from, to } = this.premove;
        const legalMoves = this.game.getLegalMoves(from.row, from.col);
        const isValid = legalMoves.some(m => m.row === to.row && m.col === to.col);
        
        if (isValid) {
            this.tryMove(from.row, from.col, to.row, to.col);
        } else {
            this.clearPremove();
        }
    }

    flipBoard() {
        this.isFlipped = !this.isFlipped;
        this.createBoard();
        this.createCoordinates();
        this.render();
    }

    newGame() {
        this.game.reset();
        this.selectedSquare = null;
        this.legalMoves = [];
        this.lastMove = null;
        this.premove = null;
        this.whiteTime = 600;
        this.blackTime = 600;
        this.capturedPieces = { white: [], black: [] };
        this.pendingPromotion = null;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.gameOverModal.classList.remove('active');
        this.promotionModal.classList.remove('active');
        
        this.updateTimerDisplay();
        this.renderCapturedPieces();
        this.moveHistoryElement.innerHTML = '';
        this.render();
    }

    undoMove() {
        if (this.game.moveHistory.length === 0) return;
        
        const move = this.game.undoMove();
        if (move) {
            if (move.captured) {
                const capturedColor = move.captured.color;
                const idx = this.capturedPieces[capturedColor].lastIndexOf(move.captured.type);
                if (idx !== -1) {
                    this.capturedPieces[capturedColor].splice(idx, 1);
                }
            }
            
            this.lastMove = this.game.moveHistory.length > 0 ? this.game.moveHistory[this.game.moveHistory.length - 1] : null;
            this.clearSelection();
            this.renderCapturedPieces();
            this.updateMoveHistory();
            this.render();
        }
    }

    resign() {
        if (this.game.gameOver) return;
        this.game.gameOver = true;
        this.game.result = this.game.turn === 'white' ? 'black' : 'white';
        this.game.resultReason = 'resignation';
        this.showGameOver();
    }

    offerDraw() {
        if (this.game.gameOver) return;
        this.game.gameOver = true;
        this.game.result = 'draw';
        this.game.resultReason = 'agreement';
        this.showGameOver();
    }

    showGameOver() {
        const title = document.getElementById('game-over-title');
        const message = document.getElementById('game-over-message');
        
        if (this.game.result === 'draw') {
            title.textContent = 'Draw';
            switch (this.game.resultReason) {
                case 'stalemate':
                    message.textContent = 'Game drawn by stalemate';
                    break;
                case 'fifty-move-rule':
                    message.textContent = 'Game drawn by 50-move rule';
                    break;
                case 'insufficient-material':
                    message.textContent = 'Game drawn - insufficient material';
                    break;
                case 'agreement':
                    message.textContent = 'Draw by agreement';
                    break;
                default:
                    message.textContent = 'Game drawn';
            }
        } else {
            const winner = this.game.result === 'white' ? 'White' : 'Black';
            title.textContent = `${winner} wins!`;
            switch (this.game.resultReason) {
                case 'checkmate':
                    message.textContent = 'by checkmate';
                    break;
                case 'timeout':
                    message.textContent = 'on time';
                    break;
                case 'resignation':
                    message.textContent = 'by resignation';
                    break;
                default:
                    message.textContent = '';
            }
        }
        
        this.gameOverModal.classList.add('active');
    }

    render() {
        const squares = this.boardElement.querySelectorAll('.square');
        
        squares.forEach(square => {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            const piece = this.game.getPiece(row, col);
            
            square.classList.remove('selected', 'last-move', 'legal-move', 'legal-capture', 'check', 'premove-source', 'premove-target');
            
            square.innerHTML = '';
            
            if (piece) {
                const pieceEl = document.createElement('div');
                pieceEl.className = 'piece';
                const pieceKey = `${piece.color}-${piece.type}`;
                pieceEl.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(this.pieceSVGs[pieceKey])}")`;
                square.appendChild(pieceEl);
            }
            
            if (this.selectedSquare && this.selectedSquare.row === row && this.selectedSquare.col === col) {
                square.classList.add('selected');
            }
            
            if (this.lastMove) {
                if ((this.lastMove.from.row === row && this.lastMove.from.col === col) ||
                    (this.lastMove.to.row === row && this.lastMove.to.col === col)) {
                    square.classList.add('last-move');
                }
            }
            
            if (this.selectedSquare) {
                const isLegalMove = this.legalMoves.some(m => m.row === row && m.col === col);
                if (isLegalMove) {
                    if (piece) {
                        square.classList.add('legal-capture');
                    } else {
                        square.classList.add('legal-move');
                    }
                }
            }
            
            if (this.game.isInCheck(this.game.turn)) {
                const king = this.game.findKing(this.game.turn);
                if (king && king.row === row && king.col === col) {
                    square.classList.add('check');
                }
            }
            
            if (this.premove) {
                if (this.premove.from.row === row && this.premove.from.col === col) {
                    square.classList.add('premove-source');
                }
                if (this.premove.to.row === row && this.premove.to.col === col) {
                    square.classList.add('premove-target');
                }
            }
        });
        
        if (this.game.turn === 'black' && !this.game.gameOver && !this.isDragging) {
            this.setupPmoveDetection();
        }
    }

    setupPmoveDetection() {
        const squares = this.boardElement.querySelectorAll('.square');
        
        squares.forEach(square => {
            square.ondblclick = (e) => {
                if (this.game.gameOver || this.game.turn !== 'black') return;
                
                const row = parseInt(square.dataset.row);
                const col = parseInt(square.dataset.col);
                const piece = this.game.getPiece(row, col);
                
                if (this.selectedSquare && piece && piece.color === this.game.turn) {
                    const isLegalMove = this.legalMoves.some(m => m.row === row && m.col === col);
                    if (isLegalMove) {
                        this.setPremove(this.selectedSquare.row, this.selectedSquare.col, row, col);
                        this.clearSelection();
                    }
                }
            };
        });
    }
}
