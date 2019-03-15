import { VideoQuality } from './video-quality';

export class ScreenQuality extends VideoQuality {
  constructor() {
    super();

    this.kind = 'screen';
    this.cursor = 'always';
    this.displaySurface = [
      'application', 'browser', 'monitor', 'window',
    ];
    this.logicalSurface = true;
  }

  get id() {
    return this.sampleRate + this.sampleSize + this.channelCount;
  }
  
  constraints() {
    const object = super.constraints();

    object.cursor = this.cursor;
    object.displaySurface = this.displaySurface;
    object.logicalSurface = this.logicalSurface;

    return object;
  }
}
