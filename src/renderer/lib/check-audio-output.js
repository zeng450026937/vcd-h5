let featureDetectionAudioElement = document.createElement('audio');

export const audioOutputChangeable = typeof featureDetectionAudioElement.setSinkId !== 'undefined';

featureDetectionAudioElement = null;
