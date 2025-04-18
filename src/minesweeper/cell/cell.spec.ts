import { Cell } from './cell';

class TestCell extends Cell {
  async openProcess(): Promise<boolean> {
    return true;
  }

  get secretSymbol(): string {
    return '💣';
  }
}

describe('Cell', () => {
  let cell: TestCell;

  beforeEach(() => {
    cell = new TestCell();
  });

  it('should show ⬜ symbol when not opened', () => {
    expect(cell.symbol).toBe('⬜');
  });

  it('should show secretSymbol after opened', async () => {
    await cell.open();
    expect(cell.symbol).toBe('💣');
  });

  it('should set isOpen to true after opening', async () => {
    await cell.open();
    expect(cell.isOpen).toBe(true);
  });

  it('should return true from open if openProcess returns true', async () => {
    const result = await cell.open();
    expect(result).toBe(true);
  });
});