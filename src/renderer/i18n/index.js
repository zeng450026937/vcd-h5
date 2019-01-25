import Vue from 'vue';
import VueI18n from 'vue-i18n';

import en from './en';
import zh from './zh';

Vue.use(VueI18n);

const locale = navigator.browserLanguage || navigator.languages[0] || navigator.language;

const i18n = new VueI18n({
  locale,
  fallbackLocale : 'en',
  messages       : {
    en, 
    zh,
  },
});

export default i18n;
