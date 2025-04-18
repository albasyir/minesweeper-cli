import { CellFactory } from './factory';
import { SafeCell } from './safe';
import { MineCell } from './mine';

describe('CellFactory', () => {
  let factory: CellFactory;

  beforeEach(() => {
    factory = new CellFactory();
  });

  it('should create a SafeCell instance', () => {
    const cell = factory.createSafeCell();
    expect(cell).toBeInstanceOf(SafeCell);
  });

  it('should create a MineCell instance', () => {
    const cell = factory.createMineCell();
    expect(cell).toBeInstanceOf(MineCell);
  });
});
