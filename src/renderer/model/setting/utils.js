import rtc from '../../rtc';
import storage from '../../storage';

// const version = 'V1';
// normal 通用模块
// conference 会议模块
export const moduleList = [ 'common', 'conference', 'video', 'audio', 'about', 'device' ];

const keyMap = {
  common     : 'SETTING_COMMON',
  conference : 'SETTING_CONFERENCE',
  video      : 'SETTING_VIDEO',
  audio      : 'SETTING_DEVICE',
  about      : 'SETTING_ABOUT',
  device     : 'SETTING_DEVICE',
};

const itemMap = { // 对应不同模块需要导出的设置项
  common     : [ 'autoStart', 'forceMinimize', 'language', 'address', 'updateChannel' ],
  conference : [ 'maxWindowWhenSharing', 'maxWindowWhenWatchingSharing',
    'enableGpu', 'autoSilence',
    'noticeWhenLeaving', 'advanceEntryTime',
    'instanceMeetingPassword', 'reserveMeetingPassword', 'dndWhenCalling',
    'shareComputerSound', 'preferredPictureFluency',
  ],
  video : [
    'enableHDVideo',
    'enableHWSpeed',
    'disableVideo',
    'enableMirroring', 
  ],
  about : [ 'autoUpdate' ],
  audio : [
    'videoInput',
    'audioInput',
    'audioOutput' ],
  device : [ 'videoInputId', 'audioInputId', 'audioOutputId' ],
};

const configKey = (type, name) => `${keyMap[type]}_USER_${name || rtc.account.username}`;

export const parseBoolean = (val) => (val === 'true' ? true : val === 'false' ? false : val);

export const checkType = (t) => moduleList.some((item) => item === t);

/**
 * 加载模块
 * @param context 调用当前方法的上下文环境
 * @param config
 * @param type 类型： common,conference,device,internet
 * @param userName
 */
export const loadConfig = (context, config, userName, type) => { // 加载设置信息到系统中
  if (!context || !checkType(type)) return;
  config = config
    || storage.query(String(configKey(type, userName)))
    || {};

  Object.keys(config).forEach((key) => {
    // console.log(context[type]);
    context[type][key] = parseBoolean(config[key]);
    // console.log(context[type]);
  });
};

/**
 * 导出(export)当前系统的配置
 * @param context
 * @param type
 */
export const exportConfig = (context, type) => {
  if (!context || !checkType(type)) return;
  const data = {};

  itemMap[type].forEach((key) => {
    data[key] = context[type][key];
  });

  return data;
};

/**
 * 保存设置信息
 * @param context
 * @param data
 * @param userName 时候指定保存的用户名（默认为当前登录的用户）
 * @param type
 */
export const saveConfig = (context, data = {}, userName, type) => { // 保存设置的数据
  if (!context || !checkType(type)) return;
  const config = exportConfig(context, type);

  storage.insert(configKey(type, userName), Object.assign(config, data));

  loadConfig(context, Object.assign(config, data), userName || rtc.account.username, type);
};

/**
 * 导出当前系统存储的配置
 * @param userName
 * @param type
 * @returns {any}
 */
export const genConfig = (userName, type) => storage.query(configKey(type, userName));
