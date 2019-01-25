import Vue from 'vue';
import Vuem from 'vuem';

import shared from './shared';
import login from './login';
import config from './config';
import account from './account';
import calendar from './calendar';
import contact from './contact';
import meeting from './meeting';
import sys from './sys';
import storage from './storage';
//
import setting from './setting';
import call from './setting/call';
import normal from './setting/normal';
import internet from './setting/internet';
import device from './setting/device';
import state from './state';
//
import middles from './middle';

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
  meeting,
  sys,
  state,
  storage,
  setting : {
    $selfValue : setting,
    call,
    normal,
    device,
    internet,
  },
};

provide(kom, data);

// noinspection JSUnresolvedVariable
window.kom = kom;

export default kom;
