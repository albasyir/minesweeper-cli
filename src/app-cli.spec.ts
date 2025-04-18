import { Readable } from 'stream';
import { createInterface } from 'readline';
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

describe('MinesweeperCLI Input Handling', () => {
  let cli: MinesweeperCLI;
  let stdin: Readable;
  let spyLog: jest.SpyInstance;
  let mockExit: jest.SpyInstance;

  beforeEach(() => {
    stdin = new Readable({
      read() {}
    });
    spyLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const minesweeper = new Minesweeper();
    cli = new MinesweeperCLI(minesweeper);

    (cli as any)['#cli'] = createInterface({
      input: stdin,
      output: process.stdout,
      terminal: false
    });

    jest.spyOn(cli as any, 'render').mockImplementation(() => {});
    jest.spyOn(cli as any, 'renderAnsweredBoardCells').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should process "new" input and call newGame()', () => {
    const newGameSpy = jest.spyOn((cli as any).minesweeper, 'newGame');
    (cli as any).handleInput('new 6');
    expect(newGameSpy).toHaveBeenCalledWith({ size: 6 });
  });

  it('should process "inspect" input and call renderAnsweredBoardCells', () => {
    const renderAnsweredSpy = jest.spyOn(cli as any, 'renderAnsweredBoardCells');
    (cli as any).handleInput('inspect');
    expect(renderAnsweredSpy).toHaveBeenCalled();
  });

  it('should process valid "open" input', async () => {
    const openSpy = jest.spyOn((cli as any).minesweeper, 'openCell').mockResolvedValue(undefined);
    await (cli as any).handleInput('open 1 1');
    expect(openSpy).toHaveBeenCalledWith(1, 1);
  });

  it('should skip invalid "open" input', async () => {
    const openSpy = jest.spyOn((cli as any).minesweeper, 'openCell');
    await (cli as any).handleInput('open x y');
    expect(openSpy).not.toHaveBeenCalled();
  });
});
