module.exports.isValidMove = (board, row, col) => {
  if (row < 0 || row > 2 || col < 0 || col > 2) {
    return false;
  }

  return board[row][col] === '-';
}

module.exports.gameOver = board => {
  const totalMoves = board.reduce((count, curRow) => {
    return count + curRow.filter(slot => slot !== '-').length;
  }, 0);

  return totalMoves === 9;
}

module.exports.wonGame = (board, row, col, move) => {
  const wonRow = checkRow(board, row, move);
  const wonCol = checkCol(board, col, move);
  const wonDiagonal = checkDiagonal(board, move);

  return wonRow || wonCol || wonDiagonal;
}

function checkRow(board, row, move) {
  return board[row].filter(slot => slot === move).length === 3;
}

function checkCol(board, col, move) {
  return board.filter(row => row[col] === move).length === 3;
}

function checkDiagonal(board, move) {
  const leftDiag = board.filter((row, i) => {
    return board[i][i] === move;
  }).length;

  const rightDiag = board.filter((row, i) => {
    return board[i][2 - i] === move;
  }).length;

  return leftDiag === 3 || rightDiag === 3;
}

