import { Quality } from './quality';

export class AudioQuality extends Quality {
  constructor() {
    super();

    this.kind = 'audio';
    this.autoGainControl = true;
    this.channelCount = 2;
    this.echoCancellation = true;
    this.latency = 3.0;
    this.noiseSuppression = true;
    this.sampleRate = 16000;
    this.sampleSize = 16;
    this.volume = 1.0;
  }

  get id() {
    return this.sampleRate + this.sampleSize + this.channelCount;
  }
  
  constraints() {
    return {
      autoGainControl  : this.autoGainControl,
      channelCount     : this.channelCount,
      echoCancellation : this.echoCancellation,
      latency          : this.latency,
      noiseSuppression : this.noiseSuppression,
      sampleRate       : this.sampleRate,
      sampleSize       : this.sampleSize,
      volume           : this.volume,
    };
  }
}
