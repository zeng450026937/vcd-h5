import Vue from 'vue';
import Vuem from './vuem';
import application from './application';
import setting from './setting';
import updater from './updater';
import ytms from './ytms';
import media from './media';
import account from './account';
import state from './state';
import contact from './contact';
import schedule from './schedule';
import meeting from './meeting';
import conference from './conference';
import main from './main';
import call from './call/index';
import ui from './ui';
import streamManager from './stream-manager';
import errorMessage from './middleware/error-message';

Vue.use(Vuem);

const model = new Vuem();

model.mount('application', application);
model.mount('setting', setting);
model.mount('updater', updater);
model.mount('ytms', ytms);
model.mount('media', media);
model.mount('account', account);
model.mount('contact', contact);
model.mount('schedule', schedule);
model.mount('meeting', meeting);
model.mount('state', state);
model.mount('conference', conference);
model.mount('main', main);
model.mount('call', call);
model.mount('ui', ui);
model.mount('streamManager', streamManager);

// logging middleware must be the first one
model.use(async(ctx, next) => {
  // inject setting
  ctx.setting = ctx.getVM('setting');

  const tick = Date.now();

  let error;
  
  let ret;

  // error handler
  try {
    ret = await next();
  }
  catch (e) {
    error = e;
  }

  const duration = Date.now() - tick;

  logger.debug(`model method: ${ctx.method}, duration: ${duration} ms, result: ${!error}`);

  // FIXME: maybe we should not throw error here
  if (error) throw error;

  return ret;
});

model.use(errorMessage);

window.kom = model;

window.addEventListener('beforeunload', () => model.destroy());

export default model;
