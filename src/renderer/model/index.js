/* eslint-disable import/no-extraneous-dependencies */
import { remote } from 'electron';
import Vue from 'vue';
import Vuem from 'vuem';
import setting from './setting';
import account from './account';
import state from './state';
import contact from './contact';
import meeting from './meeting';

Vue.use(Vuem);

const root = new Vuem();

// ...
root.mount('setting', setting);
root.mount('account', account);
root.mount('contact', contact);
root.mount('state', state);
root.mount('meeting', meeting);

root.provide({
  methods : {
    maximize() {
      const current = remote.getCurrentWindow();

      if (current.isMaximized()) {
        current.unmaximize();
      }
      else {
        current.maximize();
      }
    },
    minimize() {
      remote.getCurrentWindow().minimize();
    },
    close() {
      remote.getCurrentWindow().close();
    },
    hide() {
      remote.getCurrentWindow().hide();
    },
  },
});

window.kom = root;

export default root;
