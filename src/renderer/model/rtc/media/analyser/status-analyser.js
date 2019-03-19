import Analyser from './analyser';

export const StatusAnalyzer = Analyser.extend({
  data() {
    return {
      interval : 3000,
      status   : {
        active : false,
        audio  : false,
        video  : false,
      },
    };
  },
  watch : {
    stream(stream) {
      if (!stream) return;

      let listener;

      stream.addEventListener('inactive', listener = () => {
        stream.removeEventListener('inactive', listener);

        this.status.active = false;
        this.status.audio = false;
        this.status.video = false;
      });
    },
  },
  methods : {
    analyse() {
      if (this.stream) {
        const audioTracks = this.stream.getAudioTracks();
        const videoTracks = this.stream.getVideoTracks();

        this.status.active = this.stream.active === undefined
          ? Boolean(audioTracks[0]) && Boolean(videoTracks[0])
          : this.stream.active;

        if (this.status.active) {
          this.status.audio = this._checkAvariable(audioTracks);
          this.status.video = this._checkAvariable(videoTracks);
        }
      }
      else {
        this.status.active = false;
        this.status.audio = false;
        this.status.video = false;
      }
    },
    _checkAvariable(tracks = []) {
      return tracks.some((track) => (!('readyState' in track) || track.readyState === 'live')
              && (!('muted' in track) || track.muted !== true));
    },
  },
});
