import { Logger } from "../logger/logger-service";
import { Board } from "./board";

export class Minesweeper {
  #logger = new Logger(Minesweeper);
  #board: Board;

  #gameStatus: "playing" | "win" | "lose" | "idle" = "idle";

  public get gameStatus() {
    return this.#gameStatus;
  }

  public get board(): Board {
    return this.#board;
  }

  constructor(board: Board = new Board()) {
    this.#board = board;
  }

  newGame() {
    this.#logger.log('starting new game...')
    this.#gameStatus = "playing";
    this.board.init();
  }

  async openCell(rowInput: number, colInput: number) {
    if (this.gameStatus !== "playing") {
      return {
        status: this.#gameStatus,
      }
    }

    const actualRow = rowInput - 1;
    const actualCol = colInput - 1;
    const cell = this.board.cells[actualRow][actualCol];

    this.#logger.log("opening...");
    const result = await cell.open();

    if (!result) this.#gameStatus = 'lose';

    this.#logger.log("auto open...");
    await this.board.autoOpen(actualRow, actualCol);

    if (cell) {
      this.#logger.log(`you just open ${cell.symbol}`);
      return;
    }

    if (this.#gameStatus == 'lose') {
      this.#logger.log('Game Over!');
      return;
    }

    if (this.#gameStatus == 'win') {
      this.#logger.log('You WIN!');
      return;
    }

    return {
      status: this.#gameStatus,
      cell: cell,
    };
  }
}