import { MineCell } from './mine';

describe('MineCell', () => {
  let cell: MineCell;

  beforeEach(() => {
    cell = new MineCell();
  });

  it('should show ⬜ symbol when not opened', () => {
    expect(cell.symbol).toBe('⬜');
  });

  it('should show 💣 symbol after opened', async () => {
    await cell.open();
    expect(cell.symbol).toBe('💣');
  });

  it('should return false when opened (since it is a mine)', async () => {
    const result = await cell.open();
    expect(result).toBe(false);
  });

  it('should set isOpen to true after opening', async () => {
    await cell.open();
    expect(cell.isOpen).toBe(true);
  });
});
