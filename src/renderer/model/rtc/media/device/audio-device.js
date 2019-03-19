import { Device } from './device';
import { AudioQuality } from '../quality/audio-quality';

export class AudioDevice extends Device {
  constructor() {
    super();

    this.kind = 'audioinput';
    this.quality = new AudioQuality();
  }
}
