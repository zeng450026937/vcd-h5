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

  connect(stream) {
    const node = this.context.createMediaStreamSource(stream);

    node.connect(this.destination);

    this.sources.push(node);

    return this;
  }

  disconnect(stream) {
    const index = this.sources.findIndex((s) => s.mediaStream === stream);

    if (index === -1) return;

    const source = this.sources[index];

    source.disconnect();

    this.sources.splice(index, 1);
  }

  reset() {
    this.sources.forEach((s) => s.disconnect());
    this.sources.length = 0;
  }
}
