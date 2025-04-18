import { Cell } from "./cell";

/**
 * Safe cell
 */
export class SafeCell extends Cell {
  public neighborMineCount = 0;

  /**
   * 
   */
  private availArea = [
    "0️⃣ ", "1️⃣ ", "2️⃣ ", "3️⃣ ", "4️⃣ ", "5️⃣ ", "6️⃣ ", "7️⃣ ", "8️⃣ ", "9️⃣ "
  ];

  get secretSymbol() {
    return this.availArea[this.neighborMineCount];
  }
  
  protected async openProcess() {
    console.log(`[${SafeCell.name}] cell opened`);

    return true;
  }
}