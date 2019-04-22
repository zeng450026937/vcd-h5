import { app } from 'electron';
import { readJson, writeJson } from 'fs-extra';
import { resolve } from 'path';

const i18n = require('../renderer/i18n/modules/main');

const path = resolve(__dirname, './package.json');

const langs = {
  'zh-CN' : 'zh',
  'zh-TW' : 'zh',
};


function getLocale() {
  const lang = app.getLocale();

  return lang.indexOf('zh') > -1 ? langs[lang] : lang;
}

export async function getLanguage() {
  const json = await readJson(path);
  const locale = getLocale();

  if (!json.lang) {
    await setLanguage(locale, json);

    return locale;
  }
  else {
    return json.lang;
  }
}

export async function setLanguage(lang, json) {
  if (!json) json = await readJson(path);

  json.lang = lang;

  await writeJson(
    path,
    json,
    { spaces: 2 },
  );
}


export function $t(key, language) {
  if (!i18n.lang || !i18n.lang[language]) return key;

  return i18n.lang[language][key];
}
