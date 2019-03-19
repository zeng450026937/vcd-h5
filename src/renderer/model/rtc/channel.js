import Vue from 'vue';
import { MediaChannel } from 'apollosip';
import { setupEventHandlers, removeEventHandlers } from '@/renderer/lib/event-handler';

const reactiveKeys = [
  'target', 'session', 'options',
  'direction', 'localIdentity', 'remoteIdentity',
  'startTime', 'endTime', 'localStream', 'remoteStream',
];

export const Channel = Vue.extend({
  data() {
    return {
      internal        : null,
      referedChannels : [],
      // public
      status          : 'finished',
      error           : null,
      reason          : null,
    };
  },

  computed : {
    localMedia() {
      return this.$root.media.localMedia;
    },

    screenMedia() {
      return this.$root.media.screenMedia;
    },

    type() {
      return this.internal.type;
    },

    target : {
      get() {
        return this.internal.target;
      },
      set(val) {
        this.internal.target = val;
      },
    },

    options : {
      get() {
        return this.internal.options;
      },
      set(val) {
        this.internal.options = val;
      },
    },

    direction() {
      return this.internal.direction;
    },

    localIdentity() {
      return this.internal.localIdentity;
    },

    remoteIdentity() {
      return this.internal.remoteIdentity;
    },

    startTime() {
      return this.internal.startTime;
    },

    endTime() {
      return this.internal.endTime;
    },

    localStream() {
      return this.internal.localStream;
    },

    remoteStream() {
      return this.internal.remoteStream;
    },

    connecting() {
      return this.status === 'connecting'
          || this.status === 'progress'
          || this.status === 'refering';
    },

    refering() {
      return this.status === 'refering';
    },

    connected() {
      return this.status === 'accepted'
          || this.status === 'confirmed';
    },

    disconnected() {
      return this.status === 'finished'
          || this.status === 'failed';
    },

    progress() {
      return this.status === 'progress';
    },

    accepted() {
      return this.status === 'accepted';
    },

    ended() {
      return this.status === 'ended';
    },
    
    finished() {
      return this.status === 'finished';
    },

    failed() {
      return this.status === 'failed';
    },

    hasRefer() {
      return Boolean(this.referedChannels.length);
    },
  },

  watch : {
    internal : {
      immediate : true,
      handler(val, oldVal) {
        removeEventHandlers(oldVal, this.handlers);
        setupEventHandlers(val, this.handlers);

        if (!val) {
          this.status = 'finished';

          return;
        }

        // shallow reactive
        reactiveKeys.forEach((key) => {
          Vue.util.defineReactive(val, '', val[key], null, true);
        });

        this.status = val.isEnded()
          ? 'finished'
          : val.isEstablished()
            ? 'confirmed'
            : val.isInProgress()
              ? val._isRefer 
                ? 'refering'
                : 'progress'
              : 'finished';
      },
    },
  },

  methods : {
    connect(direction = 'send') {
      const { localMedia, screenMedia, type, internal, $parent } = this;

      if (type === 'main') {
        if (direction === 'send') {
          return localMedia.acquireStream()
            .then(() => internal.disconnect())
            .then(() => {
              internal.media.constraints = localMedia.constraints;
              internal.media.stream = localMedia.stream;
            })
            .catch(() => {
              localMedia.releaseStream();
              internal.media.constraints = {
                audio : false,
                video : false,
              };
              internal.media.stream = null;
              internal.media.receiveAudio = true;
              internal.media.receiveVideo = true;
            })
            .then(() => internal.connect());
        }

        if (direction === 'receive') {
          return internal.disconnect()
            .then(() => {
              internal.media.constraints = { audio: false, video: false };
              internal.media.stream = null;
              internal.media.receiveAudio = true;
              internal.media.receiveVideo = true;
  
              return internal.connect();
            });
        }
      }

      if (type === 'slides') {
        // fixme: should not use $parent
        if ($parent.sharingDirection === direction) {
          return Promise.resolve();
        }

        $parent.sharingDirection = direction;

        if (direction === 'send') {
          return screenMedia.acquireStream()
            .then(() => internal.disconnect())
            .then(() => {
              $parent.sharingDirection = direction;
              internal.media.constraints = screenMedia.constraints;
              internal.media.stream = screenMedia.stream;
              internal.media.receiveAudio = false;
              internal.media.receiveVideo = false;

              return internal.connect();
            })
            .catch(() => {
              $parent.sharingDirection = null;
              screenMedia.releaseStream();
            });
        }
        
        if (direction === 'receive') {
          return internal.disconnect()
            .then(() => {
              $parent.sharingDirection = direction;
              internal.media.constraints = { audio: false, video: false };
              internal.media.stream = null;
              internal.media.receiveAudio = false;
              internal.media.receiveVideo = true;

              return internal.connect();
            })
            .catch(() => {
              $parent.sharingDirection = null;
            });
        }
      }

      return Promise.reject();
    },
    receive() {
      return this.connect('receive');
    },
    disconnect() {
      return this.internal.disconnect();
    },
    toggleAudio(enabled) {
      const operation = enabled ? 'unmute' : 'mute';

      return this.internal[operation]({ audio: true, video: false });
    },
    toggleVideo(enabled) {
      const operation = enabled ? 'unmute' : 'mute';
      
      return this.internal[operation]({ audio: false, video: true });
    },
    adjustBandWith(options) {
      // const { audio, video } = options; // kbps
      // audio : 0  =>  unlimited
      return this.internal.adjustBandWith(options);
    },
    getStats() {
      return this.internal.getStats();
    },
  },

  created() {
    this.internal = null;

    this.handlers = {
      connecting : () => {
        this.status = 'connecting';
      },
      progress : () => {
        this.status = 'progress';
      },
      accepted : () => {
        this.status = 'accepted';

        this.referedChannels = [];
      },
      confirmed : () => {
        this.status = 'confirmed';

        if (this.type === 'slides' || !this._isCall) return;
        // this channel is an conference media channel
        if (this.internal.entity && this.internal.focusUri) {
          this.conference.attachMediaChannel(this.internal);

          const channel = new MediaChannel(this.ua);

          channel._isVue = true;
          this.internal = channel;
        }
      },
      ended : (data) => {
        this.status = 'ended';
        this.reason = data;
      },
      finished : () => {
        this.status = 'finished';
      },
      failed : (data) => {
        this.status = 'failed';
        this.error = data;

        if (this.referedChannels.length) {
          this.internal = this.referedChannels.pop();
        }
      },
      localStreamChanged : (stream) => {
        this.localStream = stream;
      },
      remoteStreamChanged : (stream) => {
        this.remoteStream = stream;
      },
      refer : (data) => {
        data.accept((session) => {
          const channel = new MediaChannel(this.ua);

          channel._isRefer = true;
          channel._isVue = true;
          channel.session = session;
          
          this.referedChannels.push(this.internal);
          this.internal = channel;
        });
      },
      replace : (data) => {
        data.accept((session) => {
          const channel = new MediaChannel(this.ua);

          channel._isRefer = true;
          channel._isReplace = true;
          channel._isVue = true;
          channel.session = session;

          this.referedChannels.push(this.internal);
          this.internal = channel;
        });
      },
    };

    const channel = new MediaChannel();

    channel._isVue = true;
    this.internal = channel;
  },

  destroyed() {
    if (this.internal) {
      this.internal.disconnect();
      this.internal.removeAllListeners();
      this.internal.ua = null;
      this.internal = null;
    }
  },
});

export default Channel;
