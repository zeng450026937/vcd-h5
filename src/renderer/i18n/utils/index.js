export default {

  /**
 * 将语言模块数组和config中的配置信息转换成I18n构造器能够识别的语言包
 * @param { Object } langNameObj 需要翻译的语言
 * @param { Array } langModuleList 模块数组
 */
  moduleToI18n(langNameObj, langModuleList) {
    // 遍历语言模块数组
    langModuleList.forEach((langModule) => {
      // 遍历config中配置的语言
      Object.entries(langNameObj).forEach(([ langName, langInfor ]) => {
        if (!langInfor.modules) {
          langInfor.modules = {};
        }
        // 如果当前模块中langName语言包存在的话才导入
        if (langModule.lang[langName]) {
          langInfor.modules[langModule.name] = langModule.lang[langName];
        }
      });
    });
  
    // 将最后语言包导出成i18n的构造器模式
    const i18nObj = ((obj) => {
      const result = {};
  
      Object.entries(obj).forEach(([ , langInfor ]) => {
        result[langInfor.locale] = langInfor.modules;
      });
      
      return result;
    })(langNameObj);
  
    return i18nObj;
  },
};
