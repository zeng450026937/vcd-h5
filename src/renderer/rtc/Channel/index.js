/* eslint-disable import/no-extraneous-dependencies */
import Vue from 'vue';
import { Call as Channel } from 'apollosip';
import { setupEventHandlers, removeEventHandlers } from '../Utils';

export default Vue.extend({
  props : {
    name : {
      type    : String,
      default : 'rtc-channel',
    },
  },
  data() {
    return {
      // private
      channel         : null,
      referedChannels : [],
      // public
      status          : 'finished',
      error           : null,
      reason          : null,
      localStream     : null,
      remoteStream    : null,
      direction       : null,
      localIdentity   : null,
      remoteIdentity  : null,
      startTime       : null,
      endTime         : null,
    };
  },
  computed : {
    type() {
      return this.channel.type;
    },
    target : {
      get() {
        return this.channel.target;
      },
      set(val) {
        // Should not change the target of conference channel.
        this.channel.target = val;
      },
    },
    options : {
      get() {
        return this.channel.options;
      },
      set(val) {
        this.channel.options = val;
      },
    },
    localMedia() {
      return this.$root.media.localMedia;
    },
    screenMedia() {
      return this.$root.media.screenMedia;
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
    channel(val, oldVal) {
      removeEventHandlers(oldVal, this.$data.handlers);
      setupEventHandlers(val, this.$data.handlers);

      if (!val) {
        this.localStream = null;
        this.remoteStream = null;
        this.status = 'finished';
        this.direction = null;
        this.localIdentity = null;
        this.remoteIdentity = null;
        this.startTime = null;
        this.endTime = null;

        return;
      }

      this.localStream = val.localStream;
      this.remoteStream = val.remoteStream;
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
    status() {
      if (!this.channel) return;

      this.direction = this.channel.direction;
      this.localIdentity = this.channel.localIdentity;
      this.remoteIdentity = this.channel.remoteIdentity;
      this.startTime = this.channel.startTime;
      this.endTime = this.channel.endTime;
    },
    'localMedia.stream' : function(stream) {
      if (this.type !== 'main' || !this.connected) return;
      this.channel.replaceLocalStream(stream);
    },
    'screenMedia.stream' : function(stream) {
      if (this.type !== 'slides' || !this.connected) return;
      if (this.$parent.sharingDirection !== 'send') return;
      this.channel.replaceLocalStream(stream);
    },
  },
  methods : {
    connect(direction = 'send') {
      const { localMedia, screenMedia, type, channel, $parent } = this;

      if (type === 'main') {
        if (direction === 'send') {
          return localMedia.acquireStream()
            .then(() => channel.disconnect())
            .then(() => {
              channel.media.constraints = localMedia.constraints;
              channel.media.stream = localMedia.stream;
            })
            .catch(() => {
              localMedia.releaseStream();
              channel.media.constraints = {
                audio : false,
                video : false,
              };
              channel.media.stream = null;
              channel.media.receiveAudio = true;
              channel.media.receiveVideo = true;
            })
            .then(() => channel.connect());
        }

        if (direction === 'receive') {
          return channel.disconnect()
            .then(() => {
              channel.media.constraints = { audio: false, video: false };
              channel.media.stream = null;
              channel.media.receiveAudio = true;
              channel.media.receiveVideo = true;
  
              return channel.connect();
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
            .then(() => channel.disconnect())
            .then(() => {
              $parent.sharingDirection = direction;
              channel.media.constraints = screenMedia.constraints;
              channel.media.stream = screenMedia.stream;
              channel.media.receiveAudio = false;
              channel.media.receiveVideo = false;

              return channel.connect();
            })
            .catch(() => {
              $parent.sharingDirection = null;
              screenMedia.releaseStream();
            });
        }
        
        if (direction === 'receive') {
          return channel.disconnect()
            .then(() => {
              $parent.sharingDirection = direction;
              channel.media.constraints = { audio: false, video: false };
              channel.media.stream = null;
              channel.media.receiveAudio = false;
              channel.media.receiveVideo = true;

              return channel.connect();
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
      return this.channel.disconnect();
    },
    toggleAudio(enabled) {
      const operation = enabled ? 'unmute' : 'mute';

      return this.channel[operation]({ audio: true, video: false });
    },
    toggleVideo(enabled) {
      const operation = enabled ? 'unmute' : 'mute';
      
      return this.channel[operation]({ audio: false, video: true });
    },
    adjustBandWith(options) {
      // const { audio, video } = options; // kbps
      // audio : 0  =>  unlimited
      return this.channel.adjustBandWith(options);
    },
    getStats() {
      return this.channel.getStats();
    },
  },
  created() {
    this.$data.handlers = {
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

        if (this.type === 'slides' || !this.isCall) return;
        // this channel is an conference media channel
        if (this.channel.entity && this.channel.focusUri) {
          this.conference.attachMediaChannel(this.channel);

          const channel = new Channel(this.ua);

          channel._isVue = true;
          this.channel = channel;
        }
      },
      ended : (data) => {
        this.status = 'ended';
        this.reason = data;
      },
      finished : () => {
        this.status = 'finished';

        const { localMedia, screenMedia, isCall, type, $parent } = this;
  
        if (type === 'main' && isCall) {
          localMedia.releaseStream();
        }
        else if (type === 'slides') {
          if ($parent.sharingDirection === 'send') {
            screenMedia.releaseStream();
          }
          $parent.sharingDirection = null;
        }
      },
      failed : (data) => {
        this.status = 'failed';
        this.error = data;

        if (this.referedChannels.length) {
          this.channel = this.referedChannels.pop();
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
          const channel = new Channel(this.ua);

          channel._isRefer = true;
          channel._isVue = true;
          channel.session = session;
          
          this.referedChannels.push(this.channel);
          this.channel = channel;
        });
      },
      replace : (data) => {
        data.accept((session) => {
          const channel = new Channel(this.ua);

          channel._isRefer = true;
          channel._isVue = true;
          channel.session = session;

          this.referedChannels.push(this.channel);
          this.channel = channel;
        });
      },
    };

    const channel = new Channel();

    channel._isVue = true;
    this.channel = channel;
  },
  destroyed() {
    if (this.channel) {
      this.channel.disconnect();
      this.channel.removeAllListeners();
      this.channel.ua = null;
      this.channel = null;
    }
  },
});
