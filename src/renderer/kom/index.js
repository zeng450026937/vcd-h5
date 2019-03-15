import Vue from 'vue';
import Vuem from 'vuem';

import shared from './shared';
import login from './login';
import config from './config';
import account from './account';
import calendar from './calendar';
import contact from './contact';
import sys from './sys';
import storage from './storage';
import state from './state';
//
import middles from './middle';
// conference
import chat from './conference/chat';
import stat from './conference/stat';
import conference from './conference';
import share from './conference/share';
import confState from './conference/state';
// call
import call from './call';
import callState from './call/state';
import callChat from './call/chat';
// sketch 速写 用于快速恢复现场
import globalSearch from './sketch/globalSearch';
import sketch from './sketch';

Vue.use(Vuem);

const kom = new Vuem();

middles.forEach((fn) => {
  kom.use(fn);
});

function provide(m, payloads) {
  Object.keys(payloads).forEach((k) => {
    const payload = payloads[k];
    const selfValue = payload.$selfValue;
    const model = m.model(k).provide(selfValue || payload);

    if (selfValue) { //
      Reflect.deleteProperty(payload, '$selfValue');
      provide(model, payload);
    }
  });
}

const data = {
  shared,
  login,
  config,
  account,
  calendar,
  contact,
  sys,
  state,
  storage,
  chat,
  stat,
  conference,
  confState,
  share,
  call,
  callChat,
  callState,
  sketch : {
    $selfValue : sketch,
    globalSearch,
  },
};

provide(kom, data);

// noinspection JSUnresolvedVariable

window.kom = kom;

export default kom;
