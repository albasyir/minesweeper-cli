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

    this.#logger.log("opening...");
    const result = await this.board.openCell(actualRow, actualCol);

    if (!result) return {
      status: this.#gameStatus,
    }

    if (!result.isSafe) this.#gameStatus = 'lose';
    
    if (result.cell) {
      this.#logger.log(`you just open ${result.cell.symbol}`);
      return;
    }

    return {
      status: this.#gameStatus,
      cell: result.cell,
    };
  }
}