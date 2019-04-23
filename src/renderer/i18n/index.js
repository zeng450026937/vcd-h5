
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import utils from './utils';


const langModuleList = require('./modules/index');
const langNameObj = require('./config/index').langList;

Vue.use(VueI18n);


const locale = navigator.browserLanguage || navigator.languages[0] || navigator.language;

const i18n = new VueI18n({
  locale,
  fallbackLocale : 'zh',
  messages       : utils.moduleToI18n(langNameObj, langModuleList),
});

export default i18n;
