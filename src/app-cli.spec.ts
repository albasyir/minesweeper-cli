import { MinesweeperCLI } from './app-cli';
import { Minesweeper } from './minesweeper';

describe('MinesweeperCLI', () => {
  let cli: MinesweeperCLI;
  let spyLog: jest.SpyInstance;
  let mockExit: jest.SpyInstance;

  beforeEach(() => {
    spyLog = jest.spyOn(console, 'log').mockImplementation(() => { });
    mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    cli = new MinesweeperCLI(new Minesweeper());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should handle invalid open input', async () => {
    const result = (cli as any).getRowAndColFromInput('open a b');
    expect(result).toBeUndefined();
  });

  it('should return default size on invalid new input', () => {
    const result = (cli as any).getSizeFromInput('new x');
    expect(result).toBe(10);
  });
});
