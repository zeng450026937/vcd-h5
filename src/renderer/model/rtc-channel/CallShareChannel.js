/* eslint-disable import/no-extraneous-dependencies */
import Vue from 'vue';
import { Call as Channel } from 'apollosip';
import { removeEventHandlers, setupEventHandlers } from '../../lib/event-handler';
import { defer } from '../../lib/defer';
import rtc from '../../rtc';

const INFO_CONTENT_TYPE = 'application/json';
const INFO_SERVER_TO_CLIENT_S = JSON.stringify({
  m           : 'FloorStatus',
  share_state : 'S',
  sseq        : 1,
});

const INFO_SERVER_TO_CLIENT_N = JSON.stringify({
  m           : 'FloorStatus',
  share_state : 'N',
  sseq        : 1,
});

const INFO_CLIENT_TO_SERVER_REQUEST = JSON.stringify({
  m    : 'FloorRequest',
  cseq : 1,
});

const INFO_CLIENT_TO_SERVER_C = JSON.stringify({
  share_state : 'C',
  sseq        : 1,
});

const INFO_CLIENT_TO_SERVER_RELEASE = JSON.stringify({
  m    : 'FloorRelease',
  cseq : 2,
});

const INFO_CLIENT_TO_SERVER_N = JSON.stringify({
  share_state : 'N',
  sseq        : 2,
});


export default Vue.extend({
  data() {
    return {
      channel      : null,
      localStream  : null,
      remoteStream : null,
    };
  },
  computed : {
    screenMedia() {
      return rtc.media.screenMedia;
    },
    ua() {
      return rtc.account.ua;
    },
    direction() {
      return this.$parent.mediaChannel.direction;
    },
    callStatus() {
      return this.$parent.mediaChannel.status;
    },
  },
  methods : {
    connect(direction = 'send', options = {}) {
      const { screenMedia, channel } = this;

      const { remoteIdentity } = this.$parent.channel;

      if (!remoteIdentity) return Promise.reject();
      this.channel.target = remoteIdentity.display_name
        || remoteIdentity.uri.user;

      if (direction === 'send') { // 本地发送辅流
        const constraints = {
          audio : screenMedia.constraints.audio,
          video : screenMedia.constraints.video,
        };

        return channel.disconnect()
          .then(() => {
            channel.media.constraints = constraints;
            channel.media.stream = null;
            channel.media.receiveAudio = false;
            channel.media.receiveVideo = false;

            if (!channel.ua) {
              channel.ua = this.ua;
            }
            if (this.direction === 'outgoing') { // Client 发 Server 收 （被呼叫方发给护叫方）
              this.sendInfo(INFO_CONTENT_TYPE, INFO_SERVER_TO_CLIENT_S);

              return channel.connect();
            }
            else { // Server 发 Client收 (呼叫方发给被呼叫方)
              return channel.connect().then(() => {
                this.sendInfo(
                  INFO_CONTENT_TYPE,
                  INFO_CLIENT_TO_SERVER_REQUEST
                ).then(() => {
                  this.sendInfo(INFO_CONTENT_TYPE, INFO_CLIENT_TO_SERVER_C);
                });
              });
            }
          });
      }

      return Promise.reject();
    },

    disconnect() {
      if (this.direction === 'outgoing') {
        this.sendInfo(INFO_CONTENT_TYPE, INFO_SERVER_TO_CLIENT_N);
        this.channel.disconnect();
      }
      else {
        this.sendInfo(
          INFO_CONTENT_TYPE,
          INFO_CLIENT_TO_SERVER_RELEASE
        ).then(() => {
          this.sendInfo(
            INFO_CONTENT_TYPE,
            INFO_CLIENT_TO_SERVER_N
          ).then(() => {
            this.channel.disconnect();
          });
        });
      }
    },
    answer() {
      const { channel } = this;

      channel.media.constraints = { audio: false, video: false };
      channel.media.stream = null;
      channel.media.receiveAudio = false;
      channel.media.receiveVideo = true;

      return channel.connect().then(() => {
        if (this.direction === 'outgoing') {
          channel.mute();
        }
      });
    },

    sendInfo(contentType, content) {
      const dfer = defer();

      this.channel.sendInfo(contentType, content)
        .on('succeeded',
          () => {
            dfer.resolve();
          })
        .on('failed',
          () => {
            dfer.reject();
          });

      return dfer.promise;
    },
  },
  created() {
    this.$data.handlers = {
      newRTCSession : (data) => {
        if (data.originator !== 'remote') return;
        if (data.session._is_refer) return; // is refer refer

        if (!data.request.sdp) {
          data.request.parseSDP();
        }
        const medias = (data.request.sdp && data.request.sdp.media) || [];

        if (medias.some((media) => media.content === Channel.TYPE.SLIDES)) {
          const channel = new Channel(this.ua);

          channel.data = data;
          channel._isVue = true;
          channel.session = data.session;
          channel.parseRequestHeader(data.request);
          channel._isVue = true;
          channel.type = Channel.TYPE.SLIDES;

          data.session.data.id = channel.id;
          this.channel = channel;
          this.answer();
        }
      },
      localStreamChanged : (stream) => {
        this.localStream = stream;
      },
      remoteStreamChanged : (stream) => {
        this.remoteStream = stream;
      },
      newInfo : (info) => {
        if (info.originator === 'local') return;
        let body = info.request.body;

        if (!body) return;

        body = JSON.parse(body);

        if (body.share_state === 'C') {
          this.channel.unmute();
        }
      },
    };

    this.channel = new Channel();

    this.channel._isVue = true;
    this.channel.type = Channel.TYPE.SLIDES;
  },
  destroyed() {
    if (this.channel) {
      this.channel.disconnect();
      this.channel.removeAllListeners();
      this.channel.ua = null;
      this.channel = null;
    }
  },
  watch : {
    callStatus(val) {
      if (val !== 'connected' && this.channel) {
        this.channel.disconnect();
      }
    },
    ua(val, oldVal) {
      removeEventHandlers(oldVal, this.$data.handlers);
      setupEventHandlers(val, this.$data.handlers);
    },
    channel(val, oldVal) {
      removeEventHandlers(oldVal, this.$data.handlers);
      setupEventHandlers(val, this.$data.handlers);

      if (!val) {
        this.localStream = null;
        this.remoteStream = null;

        return;
      }

      this.localStream = val.localStream;
      this.remoteStream = val.remoteStream;
    },
  },
});
