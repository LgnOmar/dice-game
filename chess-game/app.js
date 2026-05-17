document.addEventListener('DOMContentLoaded', () => {
    const game = new ChessGame();
    const ui = new ChessUI(game);
    
    console.log('Chess game initialized!');
    console.log('Controls:');
    console.log('- Click or drag pieces to move');
    console.log('- Double-click to set premove (when opponent\'s turn)');
    console.log('- Use buttons to: new game, flip board, undo, resign, draw');
});
