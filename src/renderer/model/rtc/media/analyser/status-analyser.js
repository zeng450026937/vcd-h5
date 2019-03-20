import Analyser from './analyser';

export const StatusAnalyzer = Analyser.extend({
  data() {
    return {
      status: {
        active: false,
        audio: false,
        video: false,
      },
    };
  },

  watch: {
    stream(val) {
      if (!val) return;

      let listener;

      val.addEventListener('inactive', listener = () => {
        val.removeEventListener('inactive', listener);

        this.status.active = false;
        this.status.audio = false;
        this.status.video = false;
      });
    },
  },
  
  methods: {
    analyse() {
      if (this.stream) {
        const audioTracks = this.stream.getAudioTracks();
        const videoTracks = this.stream.getVideoTracks();

        this.status.active = this.stream.active === undefined ?
          Boolean(audioTracks[0]) && Boolean(videoTracks[0]) :
          this.stream.active;

        if (this.status.active) {
          this.status.audio = this.checkAvariable(audioTracks);
          this.status.video = this.checkAvariable(videoTracks);
        }
      } else {
        this.status.active = false;
        this.status.audio = false;
        this.status.video = false;
      }
    },

    checkAvariable(tracks = []) {
      return tracks.some((track) => (!('readyState' in track) || track.readyState === 'live') &&
        (!('muted' in track) || track.muted !== true));
    },
  },

  created() {
    this.interval = 3000;
  },
});