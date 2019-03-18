/* eslint-disable import/no-extraneous-dependencies */
import { remote } from 'electron';
import Vue from 'vue';
import Vuem from './vuem';
import setting from './setting';
import application from './application';
import account from './account';
import state from './state';
import contact from './contact';
import meeting from './meeting';
import conference from './conference';

Vue.use(Vuem);

const model = new Vuem();

model.mount('setting', setting);
model.mount('application', application);
model.mount('account', account);
model.mount('contact', contact);
model.mount('state', state);
model.mount('meeting', meeting);
model.mount('conference', conference);

model.use(async(ctx, next) => {
  // inject setting
  ctx.setting = ctx.getVM('setting');

  await next();
});

window.kom = model;

export default model;
