import { Minesweeper } from '.';
import { MineCell } from './cell/mine';
import { SafeCell } from './cell/safe';

describe('Minesweeper', () => {
  let game: Minesweeper;

  beforeEach(() => {
    game = new Minesweeper();
  });

  it('should initialize the board with correct number of mines', () => {
    game.newGame({ size: 5 });
    const board = game.board;

    let mineCount = 0;
    for (let row of board.cells) {
      for (let cell of row) {
        if (cell instanceof MineCell) mineCount++;
      }
    }

    expect(mineCount).toBe(5); // sizeCell == totalMineCell
  });

  it('should return current status if game is not in playing mode', async () => {
    const result = await game.openCell(1, 1);
    expect(result?.status).toBe('idle');
  });

  it('should detect game over when opening a mine cell', async () => {
    game.newGame({ size: 2 });

    const board = game.board;
    board['setCell'](1, 1, new MineCell());

    // Reset neighbor counts manually if needed
    board['cells'][0][0] = new SafeCell();
    board['cells'][0][1] = new SafeCell();
    board['cells'][1][0] = new SafeCell();

    await game.openCell(2, 2); // input is 1-based
    expect(game.gameStatus).toBe('lose');
  });

  it('should detect win when all safe cells opened', async () => {
    game.newGame({ size: 2 });

    const board = game.board;
    board['setCell'](0, 0, new MineCell());
    board['setCell'](0, 1, new SafeCell());
    board['setCell'](1, 0, new SafeCell());
    board['setCell'](1, 1, new MineCell());

    // simulate opening safe cells
    await game.openCell(1, 2); // (0,1)
    await game.openCell(2, 1); // (1,0)

    expect(game.gameStatus).toBe('win');
  });
});
