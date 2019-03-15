/* eslint-disable import/no-extraneous-dependencies */
import Vue from 'vue';
import { Conference } from 'apollosip';
import { setupEventHandlers, removeEventHandlers, arrayfy } from '../Utils';
import Channel from '../Channel';

const C = Conference.Command;

export default Vue.extend({
  data() {
    return {
      // private
      conference       : null,
      // setting
      number           : null,
      pin              : null,
      // status
      status           : 'disconnected',
      reason           : null,
      error            : null,
      // media
      mediaChannel     : null,
      shareChannel     : null,
      // info
      information      : null,
      sharingUser      : null,
      sharingDirection : null,
      // message
      message          : null,
      // user
      addedUser        : null,
      deletedUser      : null,
    };
  },
  computed : {
    ua() {
      return this.$root.account.ua;
    },
    cm() {
      return this.$root.account.cm;
    },
    lobby() {
      return this.conference.lobby;
    },
    localMedia() {
      return this.$root.media.localMedia;
    },
    screenMedia() {
      return this.$root.media.screenMedia;
    },
    connecting() {
      return this.status === 'connecting';
    },
    connected() {
      return this.status === 'connected';
    },
    disconnected() {
      return this.status === 'disconnected';
    },
    connectFailed() {
      return this.status === 'connectFailed';
    },
    localSharing() {
      return this.sharingDirection === 'send';
    },
    remoteSharing() {
      return this.sharingDirection === 'receive';
    },
  },
  watch : {
    ua(val) {
      this.conference.ua = val;
    },
    conference(val, oldVal) {
      removeEventHandlers(oldVal, this.$data.handlers);
      setupEventHandlers(val, this.$data.handlers);

      if (!val) {
        this.information = null;
        this.mediaChannel.channel = null;
        this.shareChannel.channel = null;

        return;
      }
      val.mediaChannel._isVue = true;
      val.shareChannel._isVue = true;

      this.information = val.information;
      this.mediaChannel.channel = val.mediaChannel;
      this.shareChannel.channel = val.shareChannel;
    },
    sharingUser(val) {
      if (val) {
        if (!val.isCurrentUser()) {
          this.shareChannel.connect('receive');
        }
      }
      else
      if (this.localSharing || this.remoteSharing) {
        this.shareChannel.disconnect();
      }
    },
  },
  methods : {
    join(options) {
      const { audio, video } = options || {
        audio : true,
        video : true,
      };
      const { localMedia, conference } = this;

      this.status = 'connecting';

      return localMedia.acquireStream()
        .then(() => {
          conference.media.constraints = localMedia.constraints;
          conference.media.stream = localMedia.stream;
        })
        .catch(() => {
          localMedia.releaseStream();
          conference.media.constraints = {
            audio : false,
            video : false,
          };
          conference.media.stream = null;
          conference.media.receiveAudio = true;
          conference.media.receiveVideo = true;
        })
        .then(() => {
          conference.number = this.number || conference.number;
          conference.pin = this.pin || conference.pin;

          return conference.dialIn();
        });
    },
    leave() {
      return this.conference.disconnect();
    },
    meetnow(info, participants) {
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
          this.conference = conference;
          this.number = conference.number;
          this.pin = conference.pin;

          return this.join();
        })
        .then(() => this.invite(participants));
    },
    invite(participants) {
      return this.information.users.invite(participants);
    },
    getStats() {
      const { mediaChannel, shareChannel } = this.conference;

      return Promise.all([
        mediaChannel.getStats(),
        shareChannel.getStats(),
      ])
        .then(([ media, share ]) => ({
          media, share,
        }));
    },
    attachMediaChannel(channel) {
      // media channel is attached
      if (channel.entity && channel.focusUri) {
        this.conference.disconnect()
          .then(() => {            
            this.conference.id = channel.data.id;
            this.conference.mediaChannel = channel;
            this.mediaChannel.channel = channel;

            return this.conference.connect();
          });
      }
    },
  },
  created() {
    this.$data.handlers = {
      connecting : () => {
        this.status = 'connecting';
      },
      connected : () => {
        this.status = 'connected';
        this.error = null;
        this.reason = null;
      },
      connectFailed : (data) => {
        this.status = 'connectFailed';
        this.error = data;
        this.localMedia.releaseStream();
      },
      disconnected : (data) => {
        this.status = 'disconnected';
        this.reason = data;
        this.localMedia.releaseStream();
        this.sharingUser = null;
      },
      informationUpdated : (information) => {
        const { sharingUser } = information.state;

        if (this.sharingUser && sharingUser
         && sharingUser.entity !== this.sharingUser.entity) {
          this.sharingUser = sharingUser;
        }
        else if (!this.sharingUser || !sharingUser) {
          this.sharingUser = sharingUser;
        }
      },
      messageUpdated : (msg) => {
        this.message = msg;
      },
      userAdded : (user) => {
        this.addedUser = user;
      },
      userDeleted : (user) => {
        this.deletedUser = user;
      },
    };

    const conference = new Conference();

    conference._isVue = true;
    this.conference = conference;
    this.information = conference.information;
    this.mediaChannel = new Channel({ parent: this });
    this.shareChannel = new Channel({ parent: this });
  },
  destroyed() {
    if (this.connected || this.connecting) {
      this.conference.disconnect();
    }

    this.mediaChannel.$destroy();
    this.shareChannel.$destroy();

    this.conference.removeAllListeners();
    this.conference.ua = null;
    this.conference = null;
  },
});
