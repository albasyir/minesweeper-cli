import { MineCell } from "./mine";
import { SafeCell } from "./safe";

export class CellFactory {
  createSafeCell() {
    return new SafeCell(); 
  }

  createMineCell() {
    return new MineCell(); 
  }
}