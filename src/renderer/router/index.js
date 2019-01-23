import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const router = new Router({
  mode   : process.type === 'renderer' ? 'hash' : 'history',
  base   : process.env.BASE_URL,
  routes : [
    {
      path       : '/login',
      name       : 'login',
      components : {
        header  : () => import(/* webpackChunkName: "login-header" */ '@/renderer/components/login/LoginHeader.vue'),
        default : () => import(/* webpackChunkName: "login-preview" */ '@/renderer/views/AppLogin.vue'),
      },
      children : [
        {
          name      : 'login-preview',
          path      : 'preview',
          component : () => import(/* webpackChunkName: "login-preview" */ '@/renderer/components/login/LoginPreview.vue'),
        },
        {
          name      : 'login-cloud',
          path      : 'cloud',
          component : () => import(/* webpackChunkName: "login-cloud" */ '@/renderer/components/login/CloudLogin.vue'),
        },
        {
          name      : 'login-yms',
          path      : 'yms',
          component : () => import(/* webpackChunkName: "login-yms" */ '@/renderer/components/login/YMSLogin.vue'),
        },
        {
          name      : 'meeting-cloud',
          path      : 'm-cloud',
          component : () => import(/* webpackChunkName: "meeting-cloud" */ '@/renderer/components/login/CloudMeeting.vue'),
        },
        {
          name      : 'meeting-yms',
          path      : 'm-yms',
          component : () => import(/* webpackChunkName: "meeting-yms" */ '@/renderer/components/login/YMSMeeting.vue'),
        },
      ],
    },
    {
      path     : '*',
      redirect : '/login/preview',
    },
  ],
});

if (router.mode === 'abstract') {
  router.replace('/login');
}

window.router = router;

export default router;
