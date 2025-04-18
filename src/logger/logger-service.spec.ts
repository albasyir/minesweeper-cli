import { Logger } from './logger-service';

class DummyClass { }

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => { }); // mock console.log
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log message with pure class', () => {
    logger = new Logger(DummyClass);

    logger.log('hello', 123);

    expect(console.log).toHaveBeenCalledWith(`[${DummyClass.name}]`, 'hello', 123);
  });

  it('should log message with any string name', () => {
    logger = new Logger(DummyClass.name);

    logger.log('hello', 123);

    expect(console.log).toHaveBeenCalledWith(`[${DummyClass.name}]`, 'hello', 123);
  });
});