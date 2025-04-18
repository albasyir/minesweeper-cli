import { Logger } from "../logger/logger-service";
import { Cell } from "./cell/cell";
import { CellFactory } from "./cell/factory";
import { MineCell } from "./cell/mine";
import { SafeCell } from "./cell/safe";

export class Board {
  #logger = new Logger(Board);
  #cells: Cell[][] = [];
  #totalMineCell: number = 10;
  #sizeCell: number = 10;
  #totalOpenedCells = 0;

  get sizeCell() {
    return this.#sizeCell;
  }

  set sizeCell(value: number) {
    this.#sizeCell = value;
    this.#totalMineCell = this.#sizeCell;
  }

  get cells() {
    return this.#cells;
  }

  get totalMineCell() {
    return this.#totalMineCell;
  }

  get totalOpenedCells() {
    return this.#totalOpenedCells;
  }

  get totalCell() {
    return this.sizeCell * this.sizeCell;
  }

  get totalSafeCells() {
    return this.totalCell - this.totalMineCell
  }

  constructor(
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

  protected getCell(row: number, col: number): Cell | void {
    if (row < 0 || row >= this.sizeCell || col < 0 || col >= this.sizeCell) return;
    return this.#cells[row][col];
  }

  protected setCell(row: number, col: number, cell: Cell): Cell | void{
    if (row < 0 || row >= this.sizeCell || col < 0 || col >= this.sizeCell) return;
    this.#cells[row][col] = cell;
    return cell;
  }

  /**
   * initial board, just like make fresh again
   */
  init(options?: {
    size?: number
  }) {
    this.#cells = [];
    this.#totalOpenedCells = 0;

    //
    // resize as needed
    //
    if (options?.size) {
      this.#logger.log('size changed to', options?.size);
      this.sizeCell = options.size;
    }

    //
    // initial cells (with safe cells)
    //
    this.#logger.log('initialize with size', this.sizeCell, '...');
    for (let row = 0; row < this.sizeCell; row++) {
      this.#cells[row] = [];
      for (let col = 0; col < this.sizeCell; col++) {
        this.setCell(row, col, this.cellFactory.createSafeCell());
      }
    }

    
    //
    // planting mines
    //
    this.#logger.log('planting mines...');
    for (let minesPlanted = 0; minesPlanted < this.#totalMineCell;) {
      const randomRow = this.randomNumber(this.sizeCell);
      const randomCol = this.randomNumber(this.sizeCell);

      if (!(this.#cells[randomRow][randomCol] instanceof MineCell)) {
        this.setCell(randomRow, randomCol, this.cellFactory.createMineCell());
        minesPlanted++;
      }
    }

    //
    // calculate neighbor mine count
    //
    this.#logger.log('calculate safe cell mines count...')
    for (let currentRow = 0; currentRow < this.sizeCell; currentRow++) {
      for (let currentCol = 0; currentCol < this.sizeCell; currentCol++) {
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

              const neighborCell = this.getCell(neighborRow, neighborCol);
              if (!neighborCell) continue;
              const is_mine = neighborCell instanceof MineCell;

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
    const cell = this.getCell(row, col);
    if (!cell || cell.isOpen) return;
 
    const isSafe = await cell.open();

    if (!isSafe) return {
      cell,
      isSafe
    }

    this.#totalOpenedCells++;

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

      const cell = this.getCell(r, c);
      if (!cell || !(cell instanceof SafeCell)) return;

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