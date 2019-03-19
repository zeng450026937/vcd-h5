export class Quality {
  constructor() {
    this.kind = '';
    this.label = '';
  }

  get id() {
    return this.kind + this.label;
  }

  constraints() {
    return {};
  }
}
