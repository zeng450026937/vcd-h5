import Vuem from '../vuem';
import storage, { LOGIN_STORAGE } from '../../storage';
import router from '../../router';
import { LOGIN } from '../../router/constants';

const model = new Vuem();

const SERVER_TYPE = {
  CLOUD : 'CLOUD',
  YMS   : 'YMS',
};
const CLOUD_TYPE = {
  PHONE : 'PHONE',
  EMAIL : 'EMAIL',
  CLOUD : 'CLOUD',
};
const PAGE_TYPE = {
  LOGIN      : 'LOGIN',
  CONFERENCE : 'CONFERENCE',
};

model.provide({
  data() {
    return {
      serverType : SERVER_TYPE.CLOUD, // 服务器类型 CLOUD YMS
      cloudType  : CLOUD_TYPE.PHONE, // cloud 服务器下的登陆类型 phone email cloud
      pageType   : PAGE_TYPE.LOGIN, // 页面类型 login conference
    };
  },
  created() {
    this.initData();
  },
  computed : {
    isCloud() {
      return this.serverType === SERVER_TYPE.CLOUD;
    },
    isYMS() {
      return !this.isCloud;
    },
    accountType : {
      get() {
        return this.isYMS ? this.serverType : this.cloudType;
      },
      set(val) {
        if (val === SERVER_TYPE.YMS) return this.serverType = val;
        this.cloudType = val;
      },
    },
    isLoginByPhone() {
      return this.isCloud && this.cloudType === CLOUD_TYPE.PHONE;
    },
    isLoginByEmail() {
      return this.isCloud && this.cloudType === CLOUD_TYPE.EMAIL;
    },
    isLoginByCloud() { // 云账号
      return this.isCloud && this.cloudType === CLOUD_TYPE.CLOUD;
    },
    isInLogin() {
      return this.pageType === PAGE_TYPE.LOGIN;
    },
    isInConference() {
      return this.pageType === PAGE_TYPE.CONFERENCE;
    },
  },
  methods : {
    initData() {
      this.serverType = storage.query(LOGIN_STORAGE.SERVER_TYPE) || SERVER_TYPE.CLOUD;
      this.accountType = storage.query(LOGIN_STORAGE.ACCOUNT_TYPE) || SERVER_TYPE.CLOUD;
      this.$watch('serverType', (val) => storage.insert(LOGIN_STORAGE.SERVER_TYPE, val));
      this.$watch('accountType', (val) => storage.insert(LOGIN_STORAGE.ACCOUNT_TYPE, val));
    },
    toYMS() {
      this.serverType = SERVER_TYPE.YMS;
    },
    toCloud() {
      this.serverType = SERVER_TYPE.CLOUD;
    },
    toLoginByPhone() {
      this.cloudType = CLOUD_TYPE.PHONE;
    },
    toLoginByEmail() {
      this.cloudType = CLOUD_TYPE.EMAIL;
    },
    toLoginByCloud() {
      this.cloudType = CLOUD_TYPE.CLOUD;
    },
    toJoinConferencePage() {
      this.pageType = PAGE_TYPE.CONFERENCE;
    },
    toLoginPage() {
      this.pageType = PAGE_TYPE.LOGIN;
    },
    updateRoute() {
      router.push(this.isInLogin ? LOGIN.LOGIN_CONTENT : LOGIN.MEETING_CONTENT);
    },
  },
  watch : {
    pageType : {
      handler   : 'updateRoute',
      immediate : true,
    },
  },
});

export default model;
