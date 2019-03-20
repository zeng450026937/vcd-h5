import Vue from 'vue';
import Vuem from './vuem';
import setting1 from './setting1';
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


model.mount('application', application);
model.mount('updater', updater);
model.mount('account', account);
model.mount('contact', contact);
model.mount('state', state);
model.mount('meeting', meeting);
model.mount('conference', conference);
model.mount('main', main);
model.mount('call', call);
model.mount('setting', setting1);

model.use(async(ctx, next) => {
  // error handler
  try {
    await next();
  }
  catch (error) {
    console.warn(error);
  }
});

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
