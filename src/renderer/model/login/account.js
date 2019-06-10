import { ipcRenderer } from 'electron';
import Vuem from '../vuem';
import rtc from '../../rtc';
import storage, { LOGIN_STORAGE as S } from '../../storage';

export const PROTOCOL = {
  WSS     : 'wss',
  TLS     : 'tls',
  UDP     : 'udp',
  DEFAULT : 'tls',
};
export const PORT = {
  DEFAULT   : 5061,
  CLOUD_WSS : 7443,
};
const model = new Vuem();

model.provide({
  data() {
    return {
      loginData : {
        account   : '',
        pin       : '',
        principle : '',
        server    : '', // 服务器cr
        protocol  : PROTOCOL.DEFAULT,
      },
      pushUrl            : 'http://10.120.2.198:9444', // 接入服务地址
      proxy              : '10.200.112.134', // 代理服务器
      proxyPort          : PORT.DEFAULT, // 代理服务器端口
      rmbPassword        : false,
      accountInfo        : {},
      hasMultiEnterprise : false,
    };
  },
  created() {
    this.initData();
  },
  computed : {
    registered() {
      return rtc.account.registered;
    },
  },
  middleware : {
    getRawAccounts() {
      return storage.query(S.ACCOUNT_LIST) || [];
    },
    clearAccount({ payload: ids }) {
      storage.deleteItem(S.ACCOUNT_LIST, ids);
    },
    deleteAccount({ payload: principle }) {
      storage.deleteItem(S.ACCOUNT_LIST, principle, 'principle');
    },
    updateAccounts({ payload: accounts }) {
      storage.insert(S.ACCOUNT_LIST, accounts);
    },
  },
  methods : {
    initData() {
      this.rmbPassword = storage.query(S.REMEMBER_PASSWORD);
      this.pushUrl = storage.query(S.PUSH_URL);
      ipcRenderer.send('push-update', { url: this.pushUrl });
    },
    saveData() {
      const loginData = Object.assign(
        {},
        this.loginData,
        {
          proxy     : this.proxy,
          proxyPort : this.proxyPort,
        },
        {
          lastLoginDate : Date.now(),
          type          : this.$getVM('login.sketch').accountType,
        }
      );

      if (!this.rmbPassword) loginData.pin = '';
      this.saveLoginData(loginData);
      this.saveConfig();
    },
    saveLoginData(loginData) {
      storage.insertOrUpdate('ACCOUNT_LIST', loginData, 'principle');
      storage.update('CURRENT_ACCOUNT', loginData);
    },
    saveConfig() {
      storage.insert(S.REMEMBER_PASSWORD, this.rmbPassword);
      storage.insert(S.PUSH_URL, this.pushUrl);
    },
  },
  watch : {
    registered(val) {
      if (!val) {
        this.hasMultiEnterprise = false;
        this.accountInfo = {};
      }
    },
  },
});

export default model;
