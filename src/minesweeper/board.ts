
import { Logger } from "../logger/logger-service";
import { Cell } from "./cell/cell";
import { CellFactory } from "./cell/factory";
import { MineCell } from "./cell/mine";
import { SafeCell } from "./cell/safe";

export class Board {
  #logger = new Logger(Board)

  #cells: Cell[][] = [];

  /**
   * Detail of cells on ran board
   */
  public get cells() {
    return this.#cells;
  }

  constructor(
    private rows: number = 10,
    private cols: number = 10,
    private mines: number = 10,
    private cellFactory: CellFactory = new CellFactory(),
  ) { }

  /**
   * make random number
   * 
   * @param max maximum number can be random
   */
  protected randomNumber(max: number) {
    return Math.floor(Math.random() * max);
  }

  /**
   * initial board, just like make fresh again
   * 
   */
  init() {
    console.log('[Board] initialize...');
    // initialize cells
    for (let i = 0; i < this.rows; i++) {
      this.#cells[i] = [];
      for (let j = 0; j < this.cols; j++) {
        this.#cells[i][j] = this.cellFactory.createSafeCell();
      }
    }

    // place random mines using for loop
    console.log('[Board] store mines...');
    for (let minesPlaced = 0; minesPlaced < this.mines;) {
      const randomRow = this.randomNumber(this.rows);
      const randomCol = this.randomNumber(this.cols);

      if (!(this.#cells[randomRow][randomCol] instanceof MineCell)) {
        this.#cells[randomRow][randomCol] = this.cellFactory.createMineCell();
        minesPlaced++;
      }
    }

    // calculate neighbor mine count
    // TODO: can be optimized by counting from Mine iteraton, now it's focus on acuracy and dev speed
    console.log('[Board] calculate safe cell mines count...');
    for (let currentRow = 0; currentRow < this.rows; currentRow++) {
      for (let currentCol = 0; currentCol < this.cols; currentCol++) {
        const cell = this.#cells[currentRow][currentCol];

        // only SafeCell can be count
        if (cell instanceof SafeCell) {
          let mineCount = 0;

          // search from offset -1,1 until 1,1
          for (let offsetRow = -1; offsetRow <= 1; offsetRow++) {
            for (let offsetCol = -1; offsetCol <= 1; offsetCol++) {
              // skip current cell
              const is_self = offsetRow === 0 && offsetCol === 0;
              if (is_self) continue;

              const neighborRow = currentRow + offsetRow;
              const neighborCol = currentCol + offsetCol;

              // edge checking
              const is_out_of_bounds =
                neighborRow < 0 || neighborRow >= this.rows ||
                neighborCol < 0 || neighborCol >= this.cols;

              if (is_out_of_bounds) continue;

              const is_mine = this.#cells[neighborRow][neighborCol] instanceof MineCell;

              if (is_mine) mineCount++;
            }
          }

          cell.neighborMineCount = mineCount;
        }
      }
    }
  }

  async openCell(row: number, col: number): Promise<void | {
    cell: Cell,
    isSafe: boolean
  }> {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
 
    const cell = this.#cells[row][col];
    if (cell.isOpen) return;
 
    const isSafe = await cell.open();

    if (!isSafe) return {
      cell,
      isSafe
    }

    await this.autoOpen(row, col);

    return {
      cell,
      isSafe
    };
  }

  /**
   * auto open for "0"
   */
  async autoOpen(row: number, col: number) {
    this.#logger.log('processing to auto open neighbor')
    const visited = new Set<string>();

    const dfs = async (r: number, c: number) => {
      const key = `${r},${c}`;
      if (visited.has(key)) return;
      visited.add(key);

      this.#logger.log('processing for key', key)

      if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return;

      const cell = this.#cells[r][c];
      this.#logger.log('processing', cell)
      if (!(cell instanceof SafeCell)) return;

      this.#logger.log('opening cell', key);
      await this.openCell(r, c);

      if (cell.neighborMineCount === 0) {
        this.#logger.log('open neighbor')
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            await dfs(r + dr, c + dc);
          }
        }
      }
    }

    await dfs(row, col);
  }
}