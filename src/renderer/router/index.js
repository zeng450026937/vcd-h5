import Vue from 'vue';
import Router from 'vue-router';
import { LOGIN } from './constants';
import routes from './routes';

Vue.use(Router);


const router = new Router({
  mode : process.type === 'renderer' ? 'hash' : 'history',
  base : process.env.BASE_URL,
  routes,
});

if (router.mode === 'abstract') {
  router.replace(LOGIN.LOGIN_CONTENT);
}

window.router = router;

export default router;
