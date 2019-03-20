import Vuem from './vuem';
import { createApi } from '../../ytms/create-api';

const model = new Vuem();

model.provide({
  data() {
    return {
    };
  },

  computed : {
  },

  watch : {
  },

  middleware : {
    async doFeedback(ctx, next) {
      await next();

      const { formdata } = ctx.payload;

      await this.api.doFeedback(formdata);
    },

    async updateClientInfo(ctx, next) {
      await next();

      const { data } = ctx.payload;

      await this.api.updateClientInfo(data);
    },

    async doAlarm(ctx, next) {
      await next();

      const { formdata } = ctx.payload;

      await this.api.doAlarm(formdata);
    },
  },
  
  methods : {
  },

  async created() {
    this.api = null;

    // model hasn't be fully initilized when created() invoked
    await this.$nextTick();
    // model fully initilized

    const setting = this.$getVM('setting');
    const url = setting.ytmsHostAddress || process.env.YEALINK_YTMS_URL || process.env.VUE_APP_YTMS_URL;

    if (url) {
      const clientId = await ipcProxy.startYTMSService(url);

      this.api = createApi(url, clientId);
    }

    setting.$watch('ytmsHostAddress', async(val) => {
      console.warn('ytmsHostAddress', val);
      val = val || process.env.YEALINK_YTMS_URL || process.env.VUE_APP_YTMS_URL;
      const clientId = await ipcProxy.startYTMSService(val);

      this.api = createApi(url, clientId);
    });
  },

  beforeDestroy() {
  },
});

model.use(async(ctx, next) => {
  // check api
  const { method } = ctx;

  const apis = [
    'doFeedback',
    'updateClientInfo',
    'doAlarm',
  ];

  if (apis.indexOf(method) === -1) {
    await next();

    return;
  }

  ctx.redirect = method;
  ctx.method = 'apiChecker';

  await next();
});

model.register('apiChecker', async function(ctx, next) {
  if (!this.api) {
    throw new Error('ytms is not connected');
  }

  ctx.method = ctx.redirect;

  await next();
});

export default model;
