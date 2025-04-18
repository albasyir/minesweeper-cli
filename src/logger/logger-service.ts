type Constructor<T = any> = new (...args: any[]) => T;

export class Logger {
  constructor(
    private _classOrName: Constructor | string
  ) { }

  get context() {
    return typeof this._classOrName == 'string'
      ? this._classOrName
      : this._classOrName.name
  }
  
  log(...args: any) {
    console.log(`[${this.context}]`, ...args);
  }
}