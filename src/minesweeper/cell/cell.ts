import { Logger } from "../../logger/logger-service";

export abstract class Cell {
  #logger = new Logger(Cell.name)

  /**
   * login to hendle specific open process
   */
  protected abstract openProcess(): Promise<boolean>;

  /**
   * symbol that should be shown only after opened
   */
   abstract get secretSymbol(): string;

  /**
   * is already opened?
   */
  isOpen: boolean = false;

  /**
   * symbol that should be shown to user
   */
  get symbol() {
    return this.isOpen ? this.secretSymbol : "⬜";
  }
  
  /**
   * open cell
   * 
   */
  async open(): Promise<boolean> {
    this.#logger.log('opening cell...');
    const result = await this.openProcess();

    this.#logger.log(`you get ${this.secretSymbol}`);
    this.isOpen = true;
    return result;
  }
}