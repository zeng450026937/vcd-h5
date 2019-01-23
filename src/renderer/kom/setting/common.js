import rtc from '../../rtc';
import storage from '../../storage';

// const version = 'V1';

export const moduleList = [ 'normal', 'call', 'device', 'net' ];

const keyMap = {
  normal : 'SETTING_NORMAL',
  call   : 'SETTING_CALL',
  device : 'SETTING_DEVICE',
  net    : 'SETTING_INTERNET',
};

const itemMap = { // 对应不同模块需要导出的设置项
  normal : [ 'labelList', 'serverAddress', 'serverPort', 'sipServerPort' ],
  call   : [ 'autoAnswer', 'enableDND' ],
  device : [
    'videoInput',
    'forceLocalStream',
    'audioInput',
    'audioOutput',
    'muteVideo',
    'notification',
    'videoQuality',
    'shareQuality',
    'sampleRate',
    'sampleSize',
    'autoGainControl',
    'noiseSuppression',
    'channelCount' ],
  net : [ 'forceRelay' ],
};

const configKey = (type, name) => `${keyMap[type]}_USER_${name || rtc.account.username}`;

export const parseBoolean = (val) => (val === 'true' ? true : val === 'false' ? false : val);

export const checkType = (t) => moduleList.some((item) => item === t);

/**
 * 加载模块
 * @param context 调用当前方法的上下文环境
 * @param config
 * @param type 类型： normal,call,device,internet
 * @param userName
 */
export const load = (context, config, type, userName) => { // 加载设置信息到系统中
  if (!context || !checkType(type)) return;
  config = config
    || storage.query(String(configKey(type, userName)))
    || {};
  Object.keys(config).forEach((key) => {
    context[key] = parseBoolean(config[key]);
  });
};

/**
 * 导出(export)当前系统（call）的配置
 * @param context
 * @param type
 */
export const exp = (context, type) => {
  if (!context || !checkType(type)) return;
  const data = {};

  itemMap[type].forEach((key) => {
    data[key] = context[key];
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
export const save = (context, data = {}, userName, type) => { // 保存设置的数据
  if (!context || !checkType(type)) return;
  const config = exp(context, type);

  storage.insert(configKey(type, userName), Object.assign(config, data));
  load(context, Object.assign(config, data), type);
};

/**
 * 导出当前系统（call）存储的配置
 * @param userName
 * @param type
 * @returns {any}
 */
export const gen = (userName, type) => storage.query(configKey(type, userName));
