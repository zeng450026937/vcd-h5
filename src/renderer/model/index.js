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
import meeting from './meeting';
import conference from './conference';
import main from './main';
import call from './call/index';

Vue.use(Vuem);

const model = new Vuem();


model.mount('application', application);
model.mount('setting', setting);
model.mount('updater', updater);
model.mount('ytms', ytms);
model.mount('media', media);
model.mount('account', account);
model.mount('contact', contact);
model.mount('state', state);
model.mount('meeting', meeting);
model.mount('conference', conference);
model.mount('main', main);
model.mount('call', call);

model.use(async(ctx, next) => {
  // inject setting
  ctx.setting = ctx.getVM('setting');

  const tick = Date.now();

  let ret = true;

  // error handler
  try {
    await next();
  }
  catch (error) {
    ret = false;
  }

  const duration = Date.now() - tick;

  logger.debug(`model method: ${ctx.method}, duration: ${duration} ms, result: ${ret} `);
});

window.kom = model;

window.addEventListener('beforeunload', () => model.destroy());

export default model;
