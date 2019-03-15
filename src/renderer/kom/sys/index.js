/* eslint-disable import/no-extraneous-dependencies */
import { remote } from 'electron';

const current = remote.getCurrentWindow();

export default {
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
