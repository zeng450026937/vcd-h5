import Vue from 'vue';
import Vuem from './vuem';
import setting from './setting';
import application from './application';
import updater from './updater';
import account from './account';
import state from './state';
import contact from './contact';
import meeting from './meeting';
import conference from './conference';
import main from './main';
import call from './call/index';

Vue.use(Vuem);

const model = new Vuem();

model.mount('setting', setting);
model.mount('application', application);
model.mount('updater', updater);
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

  await next();

  const duration = Date.now() - tick;

  logger.debug(`model method: ${ctx.method}, duration: ${duration} ms`);
});

window.kom = model;

window.addEventListener('beforeunload', () => model.destroy());

export default model;
