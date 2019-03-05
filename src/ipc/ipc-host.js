import { EventEmitter } from 'events';

const events = [];
const requests = [];

export class IPCHost extends EventEmitter {
  constructor() {
    super();

    events.forEach((event) => {});
  }
}
