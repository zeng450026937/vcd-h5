import Vuem from './vuem';
import { createApi } from '../../ytms/create-api';
import rtc from '../rtc';

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

    setting.$watch(
      'ytmsHostAddress',
      async(val) => {
        val = val || process.env.YEALINK_YTMS_URL || process.env.VUE_APP_YTMS_URL;

        // reset api
        this.api = null;

        const clientId = await ipcProxy.startYTMSService(val);

        this.api = createApi(val, clientId);
      
        const data = {
          updateChannel : setting.updateChannel,
        };

        this.$dispatch('ytms.updateClientInfo', { data });
      },
      { immediate: true } // connect to ytms at the very first time
    );

    setting.$watch('updateChannel', (val) => {
      const data = {
        updateChannel : val,
      };

      this.$dispatch('ytms.updateClientInfo', { data });
    });

    const account = this.$getVM('account');

    rtc.account.$watch('ua', (val) => {
      const configuration = val && val.configuration;

      const data = {
        user : {
          account      : configuration && configuration.uri.user,
          domain       : configuration && configuration.uri.host,
          outbound     : account.proxy,
          outboundPort : account.proxyPort,
          type         : account.serverType,
        },
      };

      this.$dispatch('ytms.updateClientInfo', { data });
    });

    rtc.account.$watch('status', (val) => {
      const data = {
        user : {
          status : val,
        },
      };

      this.$dispatch('ytms.updateClientInfo', { data });
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

  // is not api method
  if (apis.indexOf(method) === -1) {
    await next();

    return;
  }

  // redirect to apiChecker
  ctx.redirect = method;
  ctx.method = 'apiChecker';

  await next();
});

model.register('apiChecker', async function(ctx, next) {
  // api is not ready or unavailable
  if (!this.api) {
    throw new Error('ytms is not connected');
  }

  ctx.method = ctx.redirect;

  await next();
});

export default model;
