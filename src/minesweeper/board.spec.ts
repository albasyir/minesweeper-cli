import { Board } from './board';
import { CellFactory } from './cell/factory';
import { SafeCell } from './cell/safe';
import { MineCell } from './cell/mine';

describe('Board', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board(new CellFactory());
  });

  it('should initialize board with correct size and mine count', () => {
    board.init({ size: 5 });
    expect(board.sizeCell).toBe(5);
    expect(board.cells.length).toBe(5);
    expect(board.cells[0].length).toBe(5);

    let mineCount = 0;
    for (let row of board.cells) {
      for (let cell of row) {
        if (cell instanceof MineCell) mineCount++;
      }
    }

    expect(mineCount).toBe(5); // totalMineCell equals sizeCell
  });

  it('should calculate correct neighbor mine count', () => {
    board.init({ size: 3 });
    const cells = board.cells;

    // Count SafeCell neighbor mines
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const cell = cells[r][c];
        if (cell instanceof SafeCell) {
          let expectedCount = 0;

          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3) {
                if (cells[nr][nc] instanceof MineCell) expectedCount++;
              }
            }
          }

          expect(cell.neighborMineCount).toBe(expectedCount);
        }
      }
    }
  });

  it('should open a cell and return result', async () => {
    board.init({ size: 3 });

    const result = await board.openCell(0, 0);
    if (result) {
      expect(result.cell.isOpen).toBe(true);
      expect(typeof result.isSafe).toBe('boolean');
    }
  });

  it('should not reopen the same cell', async () => {
    board.init({ size: 3 });
    const cell = board['cells'][0][0];

    const first = await board.openCell(0, 0);
    expect(cell.isOpen).toBe(true);

    const second = await board.openCell(0, 0);
    expect(second).toBeUndefined();
  });
});