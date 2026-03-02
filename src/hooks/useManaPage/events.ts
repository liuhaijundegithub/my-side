type Callback = (...args: any[]) => void;


class Events {
  constructor () {}
  map = new Map<string, Callback>();
  subscripe (name: string, fn: Callback) {
    this.map.set(name, fn);
  }

  send (name: string, ...args: any[]) {
    const fn = this.map.get(name);
    fn && fn(...args);
  }

}

const evt = new Events();

export default evt;
