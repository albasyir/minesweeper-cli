import { Logger } from "./logger/logger-service";
import { Minesweeper } from "./minesweeper";
import { createInterface } from "readline";

export class MinesweeperCLI {
  #logger = new Logger(MinesweeperCLI);
  #cli = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "Action: ",
  });

  constructor(
    private minesweeper = new Minesweeper()
  ) {}

  start() {
    this.minesweeper.newGame();
    this.render();
    this.#cli.prompt();
    this.#cli.on("line", this.handleInput.bind(this));
    this.#cli.on("close", this.onClose.bind(this));
  }

  renderBoardCells() {
    if (this.minesweeper.gameStatus === 'lose') {
      return this.renderAnsweredBoardCells();
    }

    this.minesweeper.board.cells.forEach((row) => {
      console.log(row.map((cell) => cell.symbol).join(""));
    });
  }

  renderAnsweredBoardCells() {
    this.minesweeper.board.cells.forEach((row) => {
      console.log(row.map((cell) => cell.secretSymbol).join(""));
    });
  }

  renderHelp() {
    console.log("Actions:");
    console.log("new = new game");
    console.log("open = open cell, ex: 'open 1 5' to open row 1 col 5");
    console.log("secret = inspect board (cheating)");
    console.log("exit = quite from game")
  }

  renderHeader() {
    console.log("Minesweeper CLI");
    console.log('status:', this.minesweeper.gameStatus);
  }

  private render() {
    console.clear();

    console.log("========================================");
    this.renderHeader();
    this.renderBoardCells();
    this.renderHelp();
    console.log("========================================");
  }

  private async handleInput(line: string) {
    const input = line.trim();

    if (input === "exit") {
      this.#cli.close();
    } else if (input === "new") {
      this.minesweeper.newGame();
      this.render();
    } else if (input === "secret") {
      this.render();
      this.renderAnsweredBoardCells();
    } else if (input.startsWith("open")) {
      const [_, row, col] = input.split(" ");
      const rowNum = parseInt(row);
      const colNum = parseInt(col);
      if (isNaN(rowNum) || isNaN(colNum)) {
        this.#logger.log("Invalid row or column number");
      } else {
        await this.minesweeper.openCell(rowNum, colNum);
        this.render();
      }
    }

    this.#cli.prompt();
  }

  private onClose() {
    this.#logger.log("Bye!");
    process.exit(0);
  }
}