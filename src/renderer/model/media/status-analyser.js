import Analyser from './analyser';

const StatusAnalyser = Analyser.extend({
  data() {
    return {
      status : {
        active : false,
        audio  : false,
        video  : false,
      },
    };
  },
  watch : {
    stream(val, oldVal) {
      if (oldVal) {
        oldVal.removeEventListener('inactive', this.streamInactive);
      }

      if (!val) return;

      val.addEventListener('inactive', this.streamInactive);
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
          this.status.audio = this.checkAvariable(audioTracks);
          this.status.video = this.checkAvariable(videoTracks);
        }
      }
      else {
        this.status.active = false;
        this.status.audio = false;
        this.status.video = false;
      }
    },

    streamInactive() {
      this.status.active = false;
      this.status.audio = false;
      this.status.video = false;
    },
    
    checkAvariable(tracks = []) {
      return tracks.some((track) => (!('readyState' in track) || track.readyState === 'live')
              && (!('muted' in track) || track.muted !== true));
    },
  },

  created() {
    this.interval = 3000;
  },
});

export default StatusAnalyser;
