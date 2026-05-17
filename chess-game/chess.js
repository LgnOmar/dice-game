class ChessGame {
    constructor() {
        this.reset();
    }

    reset() {
        this.board = this.createInitialBoard();
        this.turn = 'white';
        this.castlingRights = {
            white: { kingSide: true, queenSide: true },
            black: { kingSide: true, queenSide: true }
        };
        this.enPassantTarget = null;
        this.halfMoveClock = 0;
        this.fullMoveNumber = 1;
        this.moveHistory = [];
        this.gameOver = false;
        this.result = null;
        this.resultReason = null;
    }

    createInitialBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        const backRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        
        for (let col = 0; col < 8; col++) {
            board[0][col] = { type: backRank[col], color: 'black' };
            board[1][col] = { type: 'pawn', color: 'black' };
            board[6][col] = { type: 'pawn', color: 'white' };
            board[7][col] = { type: backRank[col], color: 'white' };
        }
        
        return board;
    }

    cloneBoard(board) {
        return board.map(row => row.map(piece => piece ? { ...piece } : null));
    }

    getPiece(row, col) {
        if (row < 0 || row > 7 || col < 0 || col > 7) return null;
        return this.board[row][col];
    }

    findKing(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    isSquareAttackedBy(row, col, byColor) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === byColor) {
                    if (this.canPieceAttack(r, c, row, col, piece)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    canPieceAttack(fromRow, fromCol, toRow, toCol, piece) {
        const dr = toRow - fromRow;
        const dc = toCol - fromCol;

        switch (piece.type) {
            case 'pawn':
                const direction = piece.color === 'white' ? -1 : 1;
                return dr === direction && Math.abs(dc) === 1;
            
            case 'knight':
                return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || 
                       (Math.abs(dr) === 1 && Math.abs(dc) === 2);
            
            case 'bishop':
                if (Math.abs(dr) !== Math.abs(dc) || dr === 0) return false;
                return this.isPathClear(fromRow, fromCol, toRow, toCol);
            
            case 'rook':
                if (dr !== 0 && dc !== 0) return false;
                return this.isPathClear(fromRow, fromCol, toRow, toCol);
            
            case 'queen':
                if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return false;
                return this.isPathClear(fromRow, fromCol, toRow, toCol);
            
            case 'king':
                return Math.abs(dr) <= 1 && Math.abs(dc) <= 1 && (dr !== 0 || dc !== 0);
            
            default:
                return false;
        }
    }

    isPathClear(fromRow, fromCol, toRow, toCol) {
        const dr = Math.sign(toRow - fromRow);
        const dc = Math.sign(toCol - fromCol);
        let r = fromRow + dr;
        let c = fromCol + dc;

        while (r !== toRow || c !== toCol) {
            if (this.board[r][c] !== null) return false;
            r += dr;
            c += dc;
        }
        return true;
    }

    isInCheck(color) {
        const king = this.findKing(color);
        if (!king) return false;
        const opponent = color === 'white' ? 'black' : 'white';
        return this.isSquareAttackedBy(king.row, king.col, opponent);
    }

    getRawMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        const moves = [];
        const color = piece.color;
        const opponent = color === 'white' ? 'black' : 'white';

        switch (piece.type) {
            case 'pawn': {
                const direction = color === 'white' ? -1 : 1;
                const startRow = color === 'white' ? 6 : 1;
                
                if (this.isValidSquare(row + direction, col) && !this.board[row + direction][col]) {
                    moves.push({ row: row + direction, col });
                    if (row === startRow && !this.board[row + 2 * direction][col]) {
                        moves.push({ row: row + 2 * direction, col });
                    }
                }
                
                for (const dc of [-1, 1]) {
                    const newCol = col + dc;
                    if (this.isValidSquare(row + direction, newCol)) {
                        const target = this.board[row + direction][newCol];
                        if (target && target.color === opponent) {
                            moves.push({ row: row + direction, col: newCol });
                        }
                        if (this.enPassantTarget && 
                            this.enPassantTarget.row === row + direction && 
                            this.enPassantTarget.col === newCol) {
                            moves.push({ row: row + direction, col: newCol, enPassant: true });
                        }
                    }
                }
                break;
            }
            
            case 'knight': {
                const knightMoves = [
                    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                    [1, -2], [1, 2], [2, -1], [2, 1]
                ];
                for (const [dr, dc] of knightMoves) {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (this.isValidSquare(newRow, newCol)) {
                        const target = this.board[newRow][newCol];
                        if (!target || target.color === opponent) {
                            moves.push({ row: newRow, col: newCol });
                        }
                    }
                }
                break;
            }
            
            case 'bishop': {
                moves.push(...this.getSlidingMoves(row, col, color, [[-1, -1], [-1, 1], [1, -1], [1, 1]]));
                break;
            }
            
            case 'rook': {
                moves.push(...this.getSlidingMoves(row, col, color, [[-1, 0], [1, 0], [0, -1], [0, 1]]));
                break;
            }
            
            case 'queen': {
                moves.push(...this.getSlidingMoves(row, col, color, [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]));
                break;
            }
            
            case 'king': {
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        const newRow = row + dr;
                        const newCol = col + dc;
                        if (this.isValidSquare(newRow, newCol)) {
                            const target = this.board[newRow][newCol];
                            if (!target || target.color === opponent) {
                                moves.push({ row: newRow, col: newCol });
                            }
                        }
                    }
                }
                
                const homeRow = color === 'white' ? 7 : 0;
                if (row === homeRow && col === 4 && !this.isInCheck(color)) {
                    if (this.castlingRights[color].kingSide &&
                        !this.board[homeRow][5] && !this.board[homeRow][6] &&
                        this.board[homeRow][7]?.type === 'rook' && this.board[homeRow][7]?.color === color &&
                        !this.isSquareAttackedBy(homeRow, 5, opponent) &&
                        !this.isSquareAttackedBy(homeRow, 6, opponent)) {
                        moves.push({ row: homeRow, col: 6, castling: 'kingSide' });
                    }
                    if (this.castlingRights[color].queenSide &&
                        !this.board[homeRow][3] && !this.board[homeRow][2] && !this.board[homeRow][1] &&
                        this.board[homeRow][0]?.type === 'rook' && this.board[homeRow][0]?.color === color &&
                        !this.isSquareAttackedBy(homeRow, 3, opponent) &&
                        !this.isSquareAttackedBy(homeRow, 2, opponent)) {
                        moves.push({ row: homeRow, col: 2, castling: 'queenSide' });
                    }
                }
                break;
            }
        }

        return moves;
    }

    getSlidingMoves(row, col, color, directions) {
        const moves = [];
        const opponent = color === 'white' ? 'black' : 'white';

        for (const [dr, dc] of directions) {
            let r = row + dr;
            let c = col + dc;
            while (this.isValidSquare(r, c)) {
                const target = this.board[r][c];
                if (!target) {
                    moves.push({ row: r, col: c });
                } else {
                    if (target.color === opponent) {
                        moves.push({ row: r, col: c });
                    }
                    break;
                }
                r += dr;
                c += dc;
            }
        }
        return moves;
    }

    isValidSquare(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    getLegalMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece || piece.color !== this.turn) return [];

        const rawMoves = this.getRawMoves(row, col);
        const legalMoves = [];

        for (const move of rawMoves) {
            if (this.isLegalMove(row, col, move)) {
                legalMoves.push(move);
            }
        }

        return legalMoves;
    }

    isLegalMove(fromRow, fromCol, move) {
        const piece = this.board[fromRow][fromCol];
        const savedBoard = this.cloneBoard(this.board);
        const savedEnPassant = this.enPassantTarget;

        this.board[move.row][move.col] = piece;
        this.board[fromRow][fromCol] = null;

        if (move.enPassant) {
            const capturedRow = piece.color === 'white' ? move.row + 1 : move.row - 1;
            this.board[capturedRow][move.col] = null;
        }

        if (move.castling) {
            const homeRow = piece.color === 'white' ? 7 : 0;
            if (move.castling === 'kingSide') {
                this.board[homeRow][5] = this.board[homeRow][7];
                this.board[homeRow][7] = null;
            } else {
                this.board[homeRow][3] = this.board[homeRow][0];
                this.board[homeRow][0] = null;
            }
        }

        const inCheck = this.isInCheck(piece.color);

        this.board = savedBoard;
        this.enPassantTarget = savedEnPassant;

        return !inCheck;
    }

    makeMove(fromRow, fromCol, toRow, toCol, promotionType = null) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return null;

        const legalMoves = this.getLegalMoves(fromRow, fromCol);
        const move = legalMoves.find(m => m.row === toRow && m.col === toCol);
        if (!move) return null;

        const captured = this.board[toRow][toCol];
        const moveData = {
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: { ...piece },
            captured: captured ? { ...captured } : null,
            castling: move.castling || null,
            enPassant: move.enPassant || false,
            promotion: null
        };

        if (move.enPassant) {
            const capturedRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
            moveData.captured = { ...this.board[capturedRow][toCol] };
            this.board[capturedRow][toCol] = null;
        }

        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        if (move.castling) {
            const homeRow = piece.color === 'white' ? 7 : 0;
            if (move.castling === 'kingSide') {
                this.board[homeRow][5] = this.board[homeRow][7];
                this.board[homeRow][7] = null;
                moveData.rookFrom = { row: homeRow, col: 7 };
                moveData.rookTo = { row: homeRow, col: 5 };
            } else {
                this.board[homeRow][3] = this.board[homeRow][0];
                this.board[homeRow][0] = null;
                moveData.rookFrom = { row: homeRow, col: 0 };
                moveData.rookTo = { row: homeRow, col: 2 };
            }
        }

        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            if (promotionType) {
                this.board[toRow][toCol] = { type: promotionType, color: piece.color };
                moveData.promotion = promotionType;
            } else {
                return { needsPromotion: true, moveData, fromRow, fromCol, toRow, toCol };
            }
        }

        if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
            this.enPassantTarget = { row: (fromRow + toRow) / 2, col: fromCol };
        } else {
            this.enPassantTarget = null;
        }

        if (piece.type === 'king') {
            this.castlingRights[piece.color].kingSide = false;
            this.castlingRights[piece.color].queenSide = false;
        }
        if (piece.type === 'rook') {
            const homeRow = piece.color === 'white' ? 7 : 0;
            if (fromRow === homeRow && fromCol === 0) {
                this.castlingRights[piece.color].queenSide = false;
            }
            if (fromRow === homeRow && fromCol === 7) {
                this.castlingRights[piece.color].kingSide = false;
            }
        }
        if (captured?.type === 'rook') {
            const opponent = piece.color === 'white' ? 'black' : 'white';
            const homeRow = opponent === 'white' ? 7 : 0;
            if (toRow === homeRow && toCol === 0) {
                this.castlingRights[opponent].queenSide = false;
            }
            if (toRow === homeRow && toCol === 7) {
                this.castlingRights[opponent].kingSide = false;
            }
        }

        if (piece.type === 'pawn' || captured) {
            this.halfMoveClock = 0;
        } else {
            this.halfMoveClock++;
        }

        this.moveHistory.push(moveData);

        if (this.turn === 'black') {
            this.fullMoveNumber++;
        }
        this.turn = this.turn === 'white' ? 'black' : 'white';

        this.checkGameEnd();

        return moveData;
    }

    checkGameEnd() {
        const currentTurn = this.turn;
        let hasLegalMoves = false;

        for (let row = 0; row < 8 && !hasLegalMoves; row++) {
            for (let col = 0; col < 8 && !hasLegalMoves; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === currentTurn) {
                    const moves = this.getLegalMoves(row, col);
                    if (moves.length > 0) {
                        hasLegalMoves = true;
                    }
                }
            }
        }

        if (!hasLegalMoves) {
            this.gameOver = true;
            if (this.isInCheck(currentTurn)) {
                const winner = currentTurn === 'white' ? 'black' : 'white';
                this.result = winner;
                this.resultReason = 'checkmate';
            } else {
                this.result = 'draw';
                this.resultReason = 'stalemate';
            }
        }

        if (this.halfMoveClock >= 100) {
            this.gameOver = true;
            this.result = 'draw';
            this.resultReason = 'fifty-move-rule';
        }

        if (this.isInsufficientMaterial()) {
            this.gameOver = true;
            this.result = 'draw';
            this.resultReason = 'insufficient-material';
        }
    }

    isInsufficientMaterial() {
        const pieces = { white: [], black: [] };
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    pieces[piece.color].push(piece.type);
                }
            }
        }

        const whitePieces = pieces.white.filter(p => p !== 'king');
        const blackPieces = pieces.black.filter(p => p !== 'king');

        if (whitePieces.length === 0 && blackPieces.length === 0) return true;
        if (whitePieces.length === 0 && blackPieces.length === 1 && 
            (blackPieces[0] === 'bishop' || blackPieces[0] === 'knight')) return true;
        if (blackPieces.length === 0 && whitePieces.length === 1 && 
            (whitePieces[0] === 'bishop' || whitePieces[0] === 'knight')) return true;

        return false;
    }

    undoMove() {
        if (this.moveHistory.length === 0) return null;

        const move = this.moveHistory.pop();
        
        this.board[move.from.row][move.from.col] = move.piece;
        this.board[move.to.row][move.to.col] = move.captured;

        if (move.enPassant) {
            const capturedRow = move.piece.color === 'white' ? move.to.row + 1 : move.to.row - 1;
            this.board[capturedRow][move.to.col] = move.captured;
            this.board[move.to.row][move.to.col] = null;
        }

        if (move.castling) {
            const homeRow = move.piece.color === 'white' ? 7 : 0;
            if (move.castling === 'kingSide') {
                this.board[homeRow][7] = this.board[homeRow][5];
                this.board[homeRow][5] = null;
            } else {
                this.board[homeRow][0] = this.board[homeRow][3];
                this.board[homeRow][3] = null;
            }
        }

        this.turn = move.piece.color;
        if (move.piece.color === 'black') {
            this.fullMoveNumber--;
        }

        this.gameOver = false;
        this.result = null;
        this.resultReason = null;

        if (this.moveHistory.length > 0) {
            const prevMove = this.moveHistory[this.moveHistory.length - 1];
            if (prevMove.piece.type === 'pawn' && Math.abs(prevMove.to.row - prevMove.from.row) === 2) {
                this.enPassantTarget = { row: (prevMove.from.row + prevMove.to.row) / 2, col: prevMove.from.col };
            } else {
                this.enPassantTarget = null;
            }
        } else {
            this.enPassantTarget = null;
        }

        this.recalculateCastlingRights();

        return move;
    }

    recalculateCastlingRights() {
        this.castlingRights = {
            white: { kingSide: true, queenSide: true },
            black: { kingSide: true, queenSide: true }
        };

        for (const move of this.moveHistory) {
            if (move.piece.type === 'king') {
                this.castlingRights[move.piece.color].kingSide = false;
                this.castlingRights[move.piece.color].queenSide = false;
            }
            if (move.piece.type === 'rook') {
                const homeRow = move.piece.color === 'white' ? 7 : 0;
                if (move.from.row === homeRow && move.from.col === 0) {
                    this.castlingRights[move.piece.color].queenSide = false;
                }
                if (move.from.row === homeRow && move.from.col === 7) {
                    this.castlingRights[move.piece.color].kingSide = false;
                }
            }
        }
    }

    getMoveNotation(move) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        
        if (move.castling === 'kingSide') return 'O-O';
        if (move.castling === 'queenSide') return 'O-O-O';

        let notation = '';
        const piece = move.piece;

        if (piece.type !== 'pawn') {
            notation += piece.type.charAt(0).toUpperCase();
        }

        if (move.captured) {
            if (piece.type === 'pawn') {
                notation += files[move.from.col];
            }
            notation += 'x';
        }

        notation += files[move.to.col] + ranks[move.to.row];

        if (move.promotion) {
            notation += '=' + move.promotion.charAt(0).toUpperCase();
        }

        const nextTurn = piece.color === 'white' ? 'black' : 'white';
        if (this.isInCheck(nextTurn)) {
            if (this.gameOver && this.resultReason === 'checkmate') {
                notation += '#';
            } else {
                notation += '+';
            }
        }

        return notation;
    }

    getFEN() {
        let fen = '';
        for (let row = 0; row < 8; row++) {
            let empty = 0;
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    if (empty > 0) {
                        fen += empty;
                        empty = 0;
                    }
                    const char = piece.type === 'knight' ? 'N' : piece.type.charAt(0).toUpperCase();
                    fen += piece.color === 'white' ? char : char.toLowerCase();
                } else {
                    empty++;
                }
            }
            if (empty > 0) fen += empty;
            if (row < 7) fen += '/';
        }

        fen += ' ' + (this.turn === 'white' ? 'w' : 'b');

        let castling = '';
        if (this.castlingRights.white.kingSide) castling += 'K';
        if (this.castlingRights.white.queenSide) castling += 'Q';
        if (this.castlingRights.black.kingSide) castling += 'k';
        if (this.castlingRights.black.queenSide) castling += 'q';
        fen += ' ' + (castling || '-');

        if (this.enPassantTarget) {
            fen += ' ' + 'abcdefgh'[this.enPassantTarget.col] + '87654321'[this.enPassantTarget.row];
        } else {
            fen += ' -';
        }

        fen += ' ' + this.halfMoveClock;
        fen += ' ' + this.fullMoveNumber;

        return fen;
    }
}
