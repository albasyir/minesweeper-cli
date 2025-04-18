import { Board } from './board';
import { CellFactory } from './cell/factory';
import { SafeCell } from './cell/safe';
import { MineCell } from './cell/mine';

describe('Board', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board(3, 3, 1, new CellFactory());
    board.init();
  });

  it('should initialize board with correct dimensions', () => {
    expect(board.cells.length).toBe(3);
    expect(board.cells[0].length).toBe(3);
  });

  it('should place the correct number of mines', () => {
    const mineCount = board.cells.flat().filter(cell => cell instanceof MineCell).length;
    expect(mineCount).toBe(1);
  });

  it('should calculate correct neighborMineCount for SafeCells', () => {
    for (let i = 0; i < board.cells.length; i++) {
      for (let j = 0; j < board.cells[i].length; j++) {
        const cell = board.cells[i][j];
        if (cell instanceof SafeCell) {
          let count = 0;
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              const ni = i + di;
              const nj = j + dj;
              if (
                ni >= 0 && ni < board.cells.length &&
                nj >= 0 && nj < board.cells[0].length &&
                !(di === 0 && dj === 0) &&
                board.cells[ni][nj] instanceof MineCell
              ) {
                count++;
              }
            }
          }
          expect(cell.neighborMineCount).toBe(count);
        }
      }
    }
  });

  it('should open only the target cell if neighborMineCount > 0', async () => {
    const safe = board.cells.flat().find(cell => cell instanceof SafeCell && cell.neighborMineCount > 0) as SafeCell;
    const openSpy = jest.spyOn(safe, 'open');
    const index = board.cells.flat().indexOf(safe);
    const row = Math.floor(index / 3);
    const col = index % 3;
    await board.autoOpen(row, col);
    expect(openSpy).toHaveBeenCalledTimes(1);
  });

  it('should recursively open cells if neighborMineCount is 0', async () => {
    // clear all mines and reset neighborMineCount
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        board.cells[i][j] = new SafeCell();
        board.cells[i][j]['neighborMineCount'] = 0;
      }
    }
    const openSpies = board.cells.flat().map(cell => jest.spyOn(cell, 'open'));
    await board.autoOpen(1, 1);
    for (const spy of openSpies) {
      expect(spy).toHaveBeenCalled();
    }
  });
});
