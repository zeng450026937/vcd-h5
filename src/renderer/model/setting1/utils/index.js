import rtc from '../../../rtc';
import localstorage from './storage';
import file from './file';

/**
 * 在vuem挂在完成之后再调用fn，类似Vue当中的nextTick
 * @param {Function} fn 
 */
export const nextTick = function(fn) {
  return Promise.resolve().then(fn);
};

const USERNAME = 'SYS';
const modelToStorageMap = {
  common     : 'SETTING_COMMON',
  conference : 'SETTING_CONFERENCE',
  video      : 'SETTING_VIDEO',
  audio      : 'SETTING_DEVICE',
  about      : 'SETTING_ABOUT',
  device     : 'SETTING_DEVICE',
};
const getConfigKey = (type, name) => `${modelToStorageMap[type]}_USER_${name || rtc.account.username}`;

export const loadConfig = async function(context) {
  // 遍历modelToStorageMap中所有配置的表名
  Object.keys(modelToStorageMap).forEach((modelName) => {
    // 调用数据库查询语句，查询当前循环表明对应的数据赋给result（可能某个表没有存在）
    const storageList = Array.from(context[modelName]._storageList);

    let result = null;
    
    // 遍历每个模块需要存储的对象列表（localstorage，file），越往后优先级越大，所以从后向前遍历，若哪一项已经有数据则使用该数据作为result
    while (storageList.length && result === null) {
      const storageName = storageList.pop();

      if (storageName === 'localstorage') { result = localstorage.getStorage(getConfigKey(modelName, USERNAME)); }
      // if (storageName === 'file');
    }
    
    if (result) {
      Object.entries(result).forEach(([ key, value ]) => { 
        context[modelName][key] = value;
      });
    }
  });
};

/**
 * 保存当前指定配置
 * @param {*} context 
 * @param {*} modelName 
 */
export const saveConfig = function(context, modelName) {
  const model = context[modelName];
  const storageList = model._storageList;
  const keyResult = Object.assign(model._keyList);

  Object.keys(keyResult).forEach((key) => {
    keyResult[key] = model[key];
  });

  storageList.forEach((storageName) => {
    if (storageName === 'localstorage') {
      localstorage.setStorage(getConfigKey(modelName, USERNAME), keyResult);
    }
    // if (storageName === 'file') {
    //   file.setStorage(getConfigKey(modelName, USERNAME), keyResult);
    // }
  });
};
