/* eslint-disable import/no-extraneous-dependencies */
import os from 'os';
import { remote } from 'electron';

const current = remote.getCurrentWindow();

export default {
  data() {
    return {
      name     : os.hostname(),
      hostname : os.hostname(),
      os       : os.type(),
      version  : remote.app.getVersion(),
      remote,
    };
  },
  methods : {
    async maximize() {
      if (current.isMaximized()) {
        current.unmaximize();
      }
      else {
        current.maximize();
      }
    },
    async minimize() {
      current.minimize();
    },
    async close() {
      current.close();
    },
    async hide() {
      current.hide();
    },
  },
};
