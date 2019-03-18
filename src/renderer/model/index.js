import Vue from 'vue';
<<<<<<< HEAD
import Vuem from './vuem';
import setting from './setting';
import application from './application';
=======
import Vuem from 'vuem';
// import setting from './setting';
import setting1 from './setting1';
>>>>>>> 基本完成设置模块的国际化
import account from './account';
import state from './state';
import contact from './contact';
import meeting from './meeting';
import conference from './conference';
import main from './main';

Vue.use(Vuem);

<<<<<<< HEAD
const model = new Vuem();

model.mount('setting', setting);
model.mount('application', application);
model.mount('account', account);
model.mount('contact', contact);
model.mount('state', state);
model.mount('meeting', meeting);
model.mount('conference', conference);
model.mount('main', main);

model.use(async(ctx, next) => {
  // inject setting
  ctx.setting = ctx.getVM('setting');

  const tick = Date.now();

  await next();

  const duration = Date.now() - tick;

  logger.debug(`model method: ${ctx.method}, duration: ${duration} ms`);
=======
const root = new Vuem();

// ...
// root.mount('setting', setting);
root.mount('setting1', setting1);
root.mount('account', account);
root.mount('contact', contact);
root.mount('state', state);
root.mount('system', system);

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
>>>>>>> 基本完成设置模块的国际化
});

window.kom = model;

export default model;
