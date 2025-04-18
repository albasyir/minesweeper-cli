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
    console.log("new = new game, ex 'new 7' to play new game 7x7");
    console.log("open = open cell, ex: 'open 1 5' to open row 1 col 5");
    console.log("inspect = inspect board to know exactly behind the cell");
    console.log("exit = quite from game");
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

  private getRowAndColFromInput(inputLine: string) {
    const [_, row, col] = inputLine.split(" ");
    const rowNum = parseInt(row);
    const colNum = parseInt(col);
    if (isNaN(rowNum) || isNaN(colNum)) {
      this.#logger.log("Invalid row or column number");
      return;
    }

    return {
      row: rowNum,
      col: colNum,
    }
  }

  private getSizeFromInput(inputLine: string) {
    const [_, inputedSize] = inputLine.split(" ");
    const size = parseInt(inputedSize);
    if (isNaN(size)) return 10;

    return size
  }

  private async handleInput(line: string) {
    const input = line.trim();

    //
    // exit
    //
    if (input === "exit") {
      this.#cli.close();
    }
    
    //
    // new game
    //
    else if (input.startsWith("new")) {
      const size = this.getSizeFromInput(input);
      this.minesweeper.newGame({ size });
      this.render();
    }
    
    //
    // inspect
    //
    else if (input === "inspect") {
      this.render();
      this.renderAnsweredBoardCells();
    }
    
    //
    // open cell
    //
    else if (input.startsWith("open")) {
      const selection = this.getRowAndColFromInput(input);

      if (!selection) return;

      await this.minesweeper.openCell(selection.row, selection.col);
      this.render();
    }
  }

  private onClose() {
    this.#logger.log("Bye!");
    process.exit(0);
  }
}