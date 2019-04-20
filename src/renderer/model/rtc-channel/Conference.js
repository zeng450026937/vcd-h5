import Vue from 'vue';
import { Conference } from 'apollosip';
import Channel from './Channel';
import rtc from '../../rtc';

export default Vue.extend({
  data() {
    return {
      // private
      conference   : null,
      information  : null,
      // status
      status       : 'disconnected',
      // media
      mediaChannel : null,
      shareChannel : null,
      // user
      addedUser    : null,
      deletedUser  : null,
      // layout
      videoLayout  : null,
    };
  },
  methods : {
    // public
    connect(options = {}, isAnonymous = false) {
      return isAnonymous ? this.anonymousJoin() : this.join();
    },
    leave() {

    },
    meetnow() {

    },
    invite() {

    },
    hold() {

    },
    unhold() {

    },
    getStats() {

    },

    // private
    join(options = {}) {
      return Promise.resolve();
    },
    anonymousJoin(options = {}) {
      return Promise.resolve();
    },
  },
  created() {
    this.$data.handlers = {
      connecting : () => {
      },
      connected : () => {
      },
      connectFailed : (data) => {
      },
      disconnected : (data) => {
      },
      subscribe : (sub_info) => {
      },
      informationUpdated : (information) => {
      },
      messageUpdated : (msg) => {
      },
      userAdded : (user) => {
      },
      userDeleted : (user) => {
      },
      viewUpdated : (view) => {
      },
    };
    const conference = new Conference();

    conference._isVue = true;
    this.conference = conference;
    this.information = conference.information;
    this.mediaChannel = new Channel({ parent: this });
    this.shareChannel = new Channel({ parent: this });
  },
});
