import { Cell } from "./cell";

export class MineCell extends Cell {
  get secretSymbol() {
    return "💣";
  }
  
  protected async openProcess() {
    return false;
  }
}