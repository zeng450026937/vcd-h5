export class AudioMixer {
  constructor() {
    this.context = new AudioContext();
    this.destination = this.context.createMediaStreamDestination();
    this.sources = [];
  }

  // only contains one audio track
  get stream() {
    return this.destination.stream;
  }

  // pipe audio track
  connect(stream) {
    const node = this.context.createMediaStreamSource(stream);

    node.connect(this.destination);

    this.sources.push(node);

    return this;
  }

  reset() {
    this.sources.forEach((s) => s.disconnect());
  }
}
