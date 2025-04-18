import { SafeCell } from './safe';

describe('SafeCell', () => {
  let cell: SafeCell;

  beforeEach(() => {
    cell = new SafeCell();
  });

  it('should show ⬜ symbol when not opened', () => {
    expect(cell.symbol).toBe('⬜');
  });

  it('should return correct emoji based on neighborMineCount after open', async () => {
    const availArea = [
      "0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"
    ];

    for (let i = 0; i <= 9; i++) {
      const testCell = new SafeCell();
      testCell.neighborMineCount = i;
      await testCell.open();
      expect(testCell.symbol.trim()).toBe(`${availArea[i]}`.trim());
    }
  });

  it('should return true when opened', async () => {
    const result = await cell.open();
    expect(result).toBe(true);
  });

  it('should set isOpen to true after opening', async () => {
    await cell.open();
    expect(cell.isOpen).toBe(true);
  });
});
