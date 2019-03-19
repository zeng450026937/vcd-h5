export class Device {
  constructor() {
    this.deviceId = null;
    this.groupId = null;
    this.kind = null;
    this.label = null;
    this.quality = null;
  }

  get id() {
    return this.deviceId + this.groupId;
  }

  constraints() {
    const constraints = {
      deviceId : this.deviceId,
      groupId  : this.groupId,
    };

    if (this.quality) {
      Object.assign(constraints, this.quality.constraints());
    }

    return constraints;
  }

  acquireStream() {
    return navigator.mediaDevices.getUserMedia(this.constraints());
  }

  closeStream(stream) {
    if (!stream) {
      return;
    }
  
    // Latest spec states that MediaStream has no stop() method and instead must
    // call stop() on every MediaStreamTrack.
    try {
      let tracks;
  
      if (stream.getTracks) {
        tracks = stream.getTracks();
        tracks.forEach((track) => {
          track.stop();
        });
      }
      else {
        tracks = stream.getAudioTracks();
        tracks.forEach((track) => {
          track.stop();
        });
        tracks = stream.getVideoTracks();
        tracks.forEach((track) => {
          track.stop();
        });
      }
    }
    catch (error) {
      // Deprecated by the spec, but still in use.
      // NOTE: In Temasys IE plugin stream.stop is a callable 'object'.
      if (typeof stream.stop === 'function' || typeof stream.stop === 'object') {
        stream.stop();
      }
    }  
  }
}
