import { closeMediaStream } from './close-stream';

export function getUserMedia(constraints) {
  return navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
      stream.close = stream.stop = function() {
        closeMediaStream(this);
      };
      stream.pause = function() {
        this.getTracks().forEach((track) => track.enabled = false);
      };
      stream.play = function() {
        this.getTracks().forEach((track) => track.enabled = true);
      };
      stream.muteAudio = function(mute) {
        this.getAudioTracks().forEach((track) => track.enabled = !mute);
      };
      stream.muteVideo = function(mute) {
        this.getVideoTracks().forEach((track) => track.enabled = !mute);
      };

      return stream;
    });
}
