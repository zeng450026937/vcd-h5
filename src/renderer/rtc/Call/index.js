import Vue from 'vue';
import Channel from '../Channel';
import { setupEventHandlers, removeEventHandlers, arrayfy, defer } from '../Utils';

export default Vue.extend({
  mixins : [ Channel ],
  data() {
    return {
      // private
      isCall         : true,
      holdedChannels : [],
      autoAnswer     : false, // 自动接听
      enableDND      : false, // 请勿打扰
    };
  },
  computed : {
    ua() {
      return this.$root.account.ua;
    },
    cm() {
      return this.$root.account.cm;
    },
    conference() {
      return this.$root.conference;
    },
    incoming() {
      return this.$root.account.newChannel;
    },
    ringing() {
      return this.incoming.length > 0;
    },
  },
  watch : {
    ua(val) {
      this.channel.ua = val;
    },
    status(val) {
      if (val !== 'ended' || !this.holdedChannels.length) return;
      
      this.channel = this.holdedChannels.pop();
      this.channel.unhold();
    },
    ringing(val) {
      if (val && this.enableDND) {
        this.decline();
      }
      if (val && this.autoAnswer) {
        this.answer();
      }
    },
  },
  methods : {
    isAvariable() {
      // registered && iceServers
      return this.channel.isAvariable();
    },
    hold(options) {      
      const dfer = defer();

      this.channel.hold(options, () => dfer.resolve(), () => dfer.reject());

      return dfer.promise;
    },
    unhold(options) {
      const dfer = defer();

      this.channel.unhold(options, () => dfer.resolve(), () => dfer.reject());

      return dfer.promise;
    },
    refer(target, replaces) {
      if (!this.channel.connection) return Promise.reject();

      const dfer = defer();
      const options = {
        replaces,
        eventHandlers : {
          requestSucceeded : () => {
            dfer.resolve();
            // hold() here will cause wrong status
            // this.hold();
            this.localMedia.toggleAudio(false);
            this.localMedia.toggleVideo(false);
          },
          requestFailed : () => {
            dfer.reject();
          },
          accepted : () => {
            // hold() channel might make media stream disabled
            // ensure media stream status
            this.localMedia.toggleAudio(!this.localMedia.muteAudio);
            this.localMedia.toggleVideo(!this.localMedia.muteVideo);
            this.channel.disconnect();
          },
          failed : () => {
            dfer.reject();
            // this.unhold();
            this.localMedia.toggleAudio(!this.localMedia.muteAudio);
            this.localMedia.toggleVideo(!this.localMedia.muteVideo);
          },
        },
      };
      
      this.channel.refer(target, options);
      
      return dfer.promise;
    },
    answer(channel, hold = true) {
      channel = channel || this.incoming[0];

      if (!channel) return Promise.reject(new Error('No Incoming Call.'));

      const { localMedia } = this;

      return localMedia.acquireStream()
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
        .then(() => channel.connect())
        .then(() => {
          if (!hold) {
            return this.disconnect();
          }

          if (this.connected) {
            return this.hold()
              .then(() => {
                this.holdedChannels.push(this.channel);
              });
          }

          return channel;
        })
        .then(() => {
          this.channel = channel;
          const index = this.incoming.indexOf(channel);

          this.incoming.splice(index, 1);
        });
    },
    decline(channel) {
      channel = channel || this.incoming[0];

      if (!channel) return Promise.reject(new Error('No Incoming Call.'));

      return channel.disconnect()
        .then(() => {
          const index = this.incoming.indexOf(channel);

          this.incoming.splice(index, 1);
        });
    },
    switch(channel) {
      channel = channel || this.holdedChannels[0];
    },
    upgrade(info, participants) {
      if (!this.connected) {
        return Promise.reject();
      }
      if (info && !participants) {
        participants = info;
        info = null;
      }
      participants = arrayfy(participants);
      participants = participants.map((p) => {
        p.requestUri = this.ua.normalizeTarget(p.requestUri);

        return p;
      });

      return this.cm.createConference(info)
        .then((conference) => {
          this.conference.conference = conference;
          this.conference.number = conference.number;
          this.conference.pin = conference.pin;

          return this.conference.join();
        })
        .then(() => {
          const { target } = this.conference.mediaChannel;

          return this.refer(target);
        })
        .then(() => (participants 
          ? this.conference.invite(participants) 
          : Promise.resolve()))
        .catch((e) => {
          this.conference.disconnect();
          throw e;
        });
    },
    sendDTMF(tones, options) {
      /*
      var tones = '1234#';

      var extraHeaders = [ 'X-Foo: foo', 'X-Bar: bar' ];

      var options = {
        'duration': 160,
        'interToneGap': 1200,
        'extraHeaders': extraHeaders
      };

      call.sendDTMF(tones, options);
      */
      return this.channel.sendDTMF(tones, options);
    },
  },
  created() {
  },
});
