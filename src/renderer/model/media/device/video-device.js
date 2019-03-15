import { Device } from './device';
import { VideoQuality } from '../quality/video-quality';

export class VideoDevice extends Device {
  constructor() {
    super();

    this.kind = 'videoinput';
    this.quality = new VideoQuality();
  }
}
